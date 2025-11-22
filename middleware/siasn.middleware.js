const { default: axios } = require("axios");
const https = require("https");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const { createRedisInstance } = require("../utils/redis");
const { default: Redlock } = require("redlock");
const { log } = require("@/utils/logger");

const dotenv = require("dotenv");
dotenv.config();

const baseUrl = process.env.API_SIASN;
const TOKEN_KEY = "siasn_token";
const LOCK_KEY = "token_lock";

let redisClient;
let redlock;
let httpsAgent;

// Cleanup function untuk mencegah memory leak
const cleanup = async () => {
  try {
    // Clear axios interceptors
    if (siasnWsAxios && siasnWsAxios.interceptors) {
      siasnWsAxios.interceptors.request.clear();
      siasnWsAxios.interceptors.response.clear();
    }

    if (redlock) {
      await redlock.quit();
      redlock = null;
    }
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
    if (httpsAgent) {
      httpsAgent.destroy();
      httpsAgent = null;
    }

    log.info("[SIASN] Cleanup completed");
  } catch (error) {
    log.error("[SIASN] Cleanup failed:", error);
  }
};

// Handle process termination
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);

const initRedis = async () => {
  if (!redisClient) {
    try {
      redisClient = await createRedisInstance();
      if (!redisClient) {
        throw new Error("Failed to create Redis instance");
      }
      log.info("[SIASN] Redis initialized");
    } catch (error) {
      log.error("[SIASN] Redis initialization failed:", error);
      throw error;
    }
  }
  if (!redlock) {
    try {
      redlock = new Redlock([redisClient], {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 200,
      });
    } catch (error) {
      log.error("[SIASN] Redlock initialization failed:", error);
      throw error;
    }
  }
};

// Create HTTPS agent with proper cleanup
const createHttpsAgent = () => {
  if (!httpsAgent) {
    httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 60000,
      maxSockets: 150,
      maxFreeSockets: 20,
      timeout: 60000,
    });
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

  // Gunakan distributed lock untuk mencegah race condition
  let lock;
  try {
    // Acquire lock dengan TTL 10 detik
    lock = await redlock.acquire([LOCK_KEY], 10000);

    // Double-check token setelah acquire lock
    tokenData = await redisClient.get(TOKEN_KEY);
    if (tokenData) {
      return JSON.parse(tokenData);
    }

    // Generate token baru
    log.info("[SIASN] Creating new token");
    const token = await getoken();
    await redisClient.set(TOKEN_KEY, JSON.stringify(token), "EX", 3600); // TTL 1 hour
    return token;
  } catch (err) {
    log.warn("[SIASN] Lock acquisition failed, trying fallback", {
      error: err.message,
    });

    // Fallback: coba tunggu token dari process lain
    const maxRetries = 5;
    const retryTimeout = 1000;
    const totalTimeout = 10000;
    const startTime = Date.now();

    for (let i = 0; i < maxRetries; i++) {
      if (Date.now() - startTime > totalTimeout) {
        log.error("[SIASN] Token retry timeout exceeded", {
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
        log.info(`[SIASN] Token acquired on retry ${i + 1}`);
        return JSON.parse(tokenData);
      }
    }

    log.error("[SIASN] Failed to get token after retries");
    throw new Error("Failed to get token after retries");
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (err) {
        log.error("[SIASN] Lock release failed:", err);
      }
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
    log.error("[SIASN] Request handler failed:", {
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
    log.warn("[SIASN] Token invalid/expired, invalidating cache", {
      url: requestUrl,
      status: statusCode,
    });

    if (redisClient) {
      try {
        await redisClient.del(TOKEN_KEY);
      } catch (delError) {
        log.error("[SIASN] Failed to delete token from cache:", delError);
      }
    }
  } else if (statusCode >= 500) {
    // Only log server errors, skip client errors (4xx)
    log.error("[SIASN] Server error:", {
      url: requestUrl,
      status: statusCode,
      message: error.message,
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
    log.error("[SIASN] Middleware error:", {
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
