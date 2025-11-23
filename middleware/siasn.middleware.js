const { default: axios } = require("axios");
const https = require("https");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const { createRedisInstance } = require("../utils/redis");
const { logger } = require("@/utils/logger");

const dotenv = require("dotenv");
dotenv.config();

const baseUrl = process.env.API_SIASN;
const TOKEN_KEY = "siasn_token";
const LOCK_KEY = "siasn_token_lock";
const LOCK_TTL = 10; // Lock TTL in seconds

// Use global to persist across hot reloads in development
let redisClient = global.__siasnRedisClient;
let httpsAgent = global.__siasnHttpsAgent;

// Simple Redis lock functions
const acquireLock = async (key, ttl) => {
  try {
    const result = await redisClient.set(key, "locked", "NX", "EX", ttl);
    return result === "OK";
  } catch (error) {
    logger.error("[SIASN] Lock acquisition error:", { error: error.message });
    return false;
  }
};

const releaseLock = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error("[SIASN] Lock release error:", { error: error.message });
  }
};

// Cleanup function untuk mencegah memory leak
const cleanup = async () => {
  try {
    // Clear axios interceptors
    if (siasnWsAxios && siasnWsAxios.interceptors) {
      siasnWsAxios.interceptors.request.clear();
      siasnWsAxios.interceptors.response.clear();
    }

    if (httpsAgent) {
      httpsAgent.destroy();
      httpsAgent = null;
    }

    logger.info("[SIASN] Cleanup completed");
  } catch (error) {
    logger.error("[SIASN] Cleanup failed:", { error: error.message });
  }
};

const initRedis = async () => {
  if (!redisClient) {
    try {
      const isFirstInit = !global.__siasnRedisClient;

      redisClient = global.__siasnRedisClient || (await createRedisInstance());

      if (!redisClient) {
        throw new Error("Failed to create Redis instance");
      }

      global.__siasnRedisClient = redisClient;

      if (isFirstInit) {
        logger.info("[SIASN] Redis initialized");
      } else {
        logger.debug("[SIASN] Redis restored from global (hot reload)");
      }
    } catch (error) {
      logger.error("[SIASN] Redis initialization failed:", {
        error: error.message,
      });
      throw error;
    }
  }
};

// Create HTTPS agent with proper cleanup
const createHttpsAgent = () => {
  if (!httpsAgent) {
    httpsAgent =
      global.__siasnHttpsAgent ||
      new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 60000,
        maxSockets: 150,
        maxFreeSockets: 20,
        timeout: 60000,
      });
    global.__siasnHttpsAgent = httpsAgent;
  }
  return httpsAgent;
};

const siasnWsAxios = axios.create({
  baseURL: baseUrl,
  httpsAgent: createHttpsAgent(),
});

const getoken = async () => {
  const wso2 = await a.wso2Fetcher();
  const sso = ssoToken?.token;
  return { sso_token: sso, wso_token: wso2 };
};

const getOrCreateToken = async () => {
  await initRedis();

  // Cek token dulu sebelum acquire lock
  let tokenData = await redisClient.get(TOKEN_KEY);
  if (tokenData) {
    return JSON.parse(tokenData);
  }

  // Try to acquire lock
  let lockAcquired = false;
  try {
    // Acquire lock dengan TTL
    lockAcquired = await acquireLock(LOCK_KEY, LOCK_TTL);

    if (lockAcquired) {
      // Double-check token setelah acquire lock
      tokenData = await redisClient.get(TOKEN_KEY);
      if (tokenData) {
        return JSON.parse(tokenData);
      }

      // Generate token baru
      logger.info("[SIASN] Creating new token");
      const token = await getoken();
      await redisClient.set(TOKEN_KEY, JSON.stringify(token), "EX", 3600); // TTL 1 hour
      return token;
    } else {
      // Lock acquisition failed, try fallback
      logger.warn("[SIASN] Lock acquisition failed, trying fallback");

      // Fallback: coba tunggu token dari process lain
      const maxRetries = 5;
      const retryTimeout = 1000;
      const totalTimeout = 10000;
      const startTime = Date.now();

      for (let i = 0; i < maxRetries; i++) {
        if (Date.now() - startTime > totalTimeout) {
          logger.error("[SIASN] Token retry timeout exceeded", {
            elapsed: Date.now() - startTime,
          });
          throw new Error("Token retry timeout exceeded");
        }

        await new Promise((resolve) => setTimeout(resolve, retryTimeout));

        if (!redisClient) {
          throw new Error("Redis client unavailable during token retry");
        }

        tokenData = await redisClient.get(TOKEN_KEY);
        if (tokenData) {
          logger.info(`[SIASN] Token acquired on retry ${i + 1}`);
          return JSON.parse(tokenData);
        }
      }

      logger.error("[SIASN] Failed to get token after retries");
      throw new Error("Failed to get token after retries");
    }
  } catch (err) {
    logger.error("[SIASN] Token acquisition error:", { error: err.message });
    throw err;
  } finally {
    if (lockAcquired) {
      await releaseLock(LOCK_KEY);
    }
  }
};

const requestHandler = async (request) => {
  try {
    const token = await getOrCreateToken();
    const { sso_token, wso_token } = token;
    request.headers.Authorization = `Bearer ${wso_token}`;
    request.headers.Auth = `bearer ${sso_token}`;
    return request;
  } catch (error) {
    logger.error("[SIASN] Request handler failed:", {
      method: request.method,
      url: request.url,
      error: error.message,
    });
    throw error;
  }
};

const responseHandler = async (response) => response;

const errorHandler = async (error) => {
  const errorData = error?.response?.data || {};
  const statusCode = error?.response?.status;
  const requestUrl = error?.config?.url;

  // Safe logging - prevent circular structure error
  const safeErrorData = {
    code: errorData.code,
    message: errorData.message,
    type: errorData.type,
    description: errorData.description,
    data: errorData.data,
  };

  logger.error("[SIASN] Error data:", safeErrorData);

  const ECONRESET = error?.code === "ECONNRESET";
  const invalidJwt = errorData.message === "invalid or expired jwt";
  const tokenError = errorData.data === "Token SSO mismatch";
  const invalidCredentials = errorData.message === "Invalid Credentials";

  const runtimeError =
    errorData.message === "Runtime Error" &&
    !(errorData.description && errorData.description.includes("SUSPENDED"));

  const isTokenError =
    invalidJwt || runtimeError || tokenError || invalidCredentials || ECONRESET;

  if (isTokenError) {
    logger.warn("[SIASN] Token invalid/expired, invalidating cache", {
      url: requestUrl,
      status: statusCode,
      errorCode: error?.code,
    });

    if (redisClient) {
      try {
        await redisClient.del(TOKEN_KEY);
      } catch (delError) {
        logger.error("[SIASN] Failed to delete token from cache:", {
          error: delError.message,
        });
      }
    }
  } else if (statusCode >= 500) {
    // Server errors (5xx)
    logger.error("[SIASN] Server error:", {
      url: requestUrl,
      status: statusCode,
      message: error.message,
      code: errorData.code,
      description: errorData.description,
    });
  } else if (statusCode >= 400) {
    // Client errors (4xx) - log as debug/warn instead of error
    logger.debug("[SIASN] Client error:", {
      url: requestUrl,
      status: statusCode,
      code: errorData.code,
      message: errorData.message,
      description: errorData.description,
    });
  }

  return Promise.reject(errorData);
};

siasnWsAxios.interceptors.request.use(requestHandler, errorHandler);
siasnWsAxios.interceptors.response.use(responseHandler, errorHandler);

const siasnMiddleware = async (req, res, next) => {
  try {
    req.siasnRequest = siasnWsAxios;
    next();
  } catch (error) {
    logger.error("[SIASN] Middleware error:", {
      method: req.method,
      path: req.path,
      error: error.message,
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  siasnMiddleware,
  siasnWsAxios,
  getOrCreateToken, // Export for job processors
  cleanup, // Export cleanup function untuk testing atau manual cleanup
};
