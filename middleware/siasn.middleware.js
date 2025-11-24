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
const COOKIE_KEY = "siasn_cookies";
const COOKIE_LOCK_KEY = "siasn_cookies_lock";
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

/**
 * Fetch cookies dari APIM BKN base URL
 * Hit ke https://apimws.bkn.go.id:8243/ untuk mendapatkan session cookies
 */
const fetchCookiesFromAPIM = async () => {
  try {
    logger.info("[SIASN] Fetching cookies from APIM base URL");

    // Create axios instance untuk initial request
    const cookieFetcher = axios.create({
      baseURL: baseUrl, // https://apimws.bkn.go.id:8243
      httpsAgent: createHttpsAgent(),
      maxRedirects: 5,
      validateStatus: () => true, // Accept semua status code
    });

    // Hit base URL untuk trigger cookie generation
    const response = await cookieFetcher.get("/", {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Extract cookies dari response
    const setCookieHeaders = response.headers["set-cookie"];

    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      // Parse semua cookies
      const cookies = setCookieHeaders
        .map((cookie) => {
          // Ambil bagian cookie name=value saja (sebelum semicolon)
          const cookieParts = cookie.split(";")[0].trim();
          return cookieParts;
        })
        .filter(Boolean)
        .join("; ");

      if (cookies) {
        logger.info("[SIASN] Cookies fetched successfully from APIM", {
          cookieCount: setCookieHeaders.length,
          preview: cookies.substring(0, 100) + "...",
        });
        return cookies;
      }
    }

    logger.warn("[SIASN] No cookies received from APIM base URL");
    return null;
  } catch (error) {
    logger.error("[SIASN] Failed to fetch cookies from APIM:", {
      error: error.message,
    });
    return null;
  }
};

/**
 * Get or Create Cookies dengan Redis caching
 * Optimized: hanya fetch sekali, setelahnya pakai cache
 */
const getOrCreateCookies = async () => {
  await initRedis();

  // Fast path: Check cache terlebih dahulu (no lock needed)
  let cookies = await redisClient.get(COOKIE_KEY);
  if (cookies) {
    // Cache hit - return langsung tanpa processing
    return cookies;
  }

  // Slow path: Cache miss, perlu fetch (dengan lock)
  let lockAcquired = false;
  try {
    lockAcquired = await acquireLock(COOKIE_LOCK_KEY, LOCK_TTL);

    if (lockAcquired) {
      // Double-check cache setelah acquire lock
      // (mungkin sudah di-fetch oleh process lain)
      cookies = await redisClient.get(COOKIE_KEY);
      if (cookies) {
        return cookies;
      }

      // Benar-benar perlu fetch - log ini
      logger.info("[SIASN] Fetching fresh cookies (cache miss)");

      // Fetch fresh cookies dari APIM
      cookies = await fetchCookiesFromAPIM();

      if (cookies) {
        // Cache cookies dengan TTL 30 menit
        const TTL = 1800; // 30 menit
        await redisClient.set(COOKIE_KEY, cookies, "EX", TTL);
        logger.info("[SIASN] Cookies cached", { ttl: `${TTL}s` });
        return cookies;
      }

      // Fallback ke environment variable jika fetch gagal
      const envCookies = process.env.SIASN_COOKIES;
      if (envCookies) {
        logger.warn("[SIASN] Using fallback cookies from env");
        await redisClient.set(COOKIE_KEY, envCookies, "EX", 1800);
        return envCookies;
      }

      logger.warn("[SIASN] No cookies available");
      return null;
    } else {
      // Lock sudah diambil process lain, tunggu sebentar
      // Kemungkinan besar process lain sedang fetch
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Cek cache lagi
      cookies = await redisClient.get(COOKIE_KEY);
      if (cookies) {
        return cookies;
      }

      // Masih tidak ada, wait sedikit lagi (max 2 retries)
      for (let i = 0; i < 2; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        cookies = await redisClient.get(COOKIE_KEY);
        if (cookies) {
          return cookies;
        }
      }

      // Timeout, return null (request tetap jalan tanpa cookies)
      logger.warn("[SIASN] Cookie fetch timeout, proceeding without cookies");
      return null;
    }
  } catch (err) {
    logger.error("[SIASN] Cookie error:", { error: err.message });
    return null;
  } finally {
    if (lockAcquired) {
      await releaseLock(COOKIE_LOCK_KEY);
    }
  }
};

const requestHandler = async (request) => {
  try {
    const token = await getOrCreateToken();
    const { sso_token, wso_token } = token;
    request.headers.Authorization = `Bearer ${wso_token}`;
    request.headers.Auth = `bearer ${sso_token}`;

    // Tambahkan cookies ke request (async tapi non-blocking)
    // Jika cookies tidak ada, request tetap jalan
    const cookies = await getOrCreateCookies();
    if (cookies) {
      request.headers.Cookie = cookies;
    }

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
    logger.warn("[SIASN] Token/Cookie invalid, invalidating cache", {
      url: requestUrl,
      status: statusCode,
      errorCode: error?.code,
    });

    if (redisClient) {
      try {
        // Invalidate both token and cookies
        await redisClient.del(TOKEN_KEY);
        await redisClient.del(COOKIE_KEY);
        logger.info("[SIASN] Token and cookies cache cleared");
      } catch (delError) {
        logger.error("[SIASN] Failed to delete cache:", {
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
  getOrCreateCookies, // Export for manual cookie management
  cleanup, // Export cleanup function untuk testing atau manual cleanup
};
