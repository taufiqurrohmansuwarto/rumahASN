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
    log.info("[SIASN Middleware] Memulai cleanup resources");

    // Clear axios interceptors
    if (siasnWsAxios && siasnWsAxios.interceptors) {
      siasnWsAxios.interceptors.request.clear();
      siasnWsAxios.interceptors.response.clear();
      log.debug("[SIASN Middleware] Axios interceptors dibersihkan");
    }

    if (redlock) {
      await redlock.quit();
      redlock = null;
      log.debug("[SIASN Middleware] Redlock connection ditutup");
    }
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      log.debug("[SIASN Middleware] Redis connection ditutup");
    }
    if (httpsAgent) {
      httpsAgent.destroy();
      httpsAgent = null;
      log.debug("[SIASN Middleware] HTTPS agent dihancurkan");
    }

    log.info("[SIASN Middleware] Cleanup berhasil diselesaikan");
  } catch (error) {
    log.error("[SIASN Middleware] Gagal melakukan cleanup:", {
      error: error.message,
      stack: error.stack,
    });
  }
};

// Handle process termination
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);

const initRedis = async () => {
  if (!redisClient) {
    try {
      log.debug("[SIASN Middleware] Menginisialisasi Redis client");
      redisClient = await createRedisInstance();
      if (!redisClient) {
        throw new Error("Gagal membuat Redis instance");
      }
      log.info("[SIASN Middleware] Redis client berhasil diinisialisasi");
    } catch (error) {
      log.error("[SIASN Middleware] Gagal menginisialisasi Redis client:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  if (!redlock) {
    try {
      log.debug("[SIASN Middleware] Menginisialisasi Redlock");
      redlock = new Redlock([redisClient], {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 200,
      });
      log.info("[SIASN Middleware] Redis dan Redlock berhasil diinisialisasi", {
        config: {
          driftFactor: 0.01,
          retryCount: 3,
          retryDelay: 200,
          retryJitter: 200,
        },
      });
    } catch (error) {
      log.error("[SIASN Middleware] Gagal menginisialisasi Redlock:", {
        error: error.message,
        stack: error.stack,
      });
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
    log.debug("[SIASN Token] Token ditemukan di cache Redis");
    return JSON.parse(tokenData);
  }

  log.debug(
    "[SIASN Token] Token tidak ditemukan di cache, mencoba acquire lock"
  );

  // Gunakan distributed lock untuk mencegah race condition
  let lock;
  try {
    // Acquire lock dengan TTL 10 detik
    lock = await redlock.acquire([LOCK_KEY], 10000);
    log.debug("[SIASN Token] Lock berhasil di-acquire", {
      lockKey: LOCK_KEY,
      ttl: 10000,
    });

    // Double-check token setelah acquire lock
    tokenData = await redisClient.get(TOKEN_KEY);
    if (tokenData) {
      log.debug(
        "[SIASN Token] Token ditemukan setelah acquire lock (dibuat oleh proses lain)"
      );
      return JSON.parse(tokenData);
    }

    // Generate token baru
    log.info("[SIASN Token] Membuat token baru");
    const token = await getoken();
    await redisClient.set(TOKEN_KEY, JSON.stringify(token), "EX", 3600); // TTL 1 hour
    log.info("[SIASN Token] Token baru berhasil dibuat dan disimpan di Redis", {
      ttl: 3600,
      tokenKey: TOKEN_KEY,
    });
    return token;
  } catch (err) {
    log.warn("[SIASN Token] Gagal acquire lock, mencoba fallback strategy", {
      error: err.message,
      lockKey: LOCK_KEY,
    });

    // Fallback: coba tunggu token dari process lain dengan timeout
    const maxRetries = 5;
    const retryTimeout = 1000; // 1 second per retry
    const totalTimeout = 10000; // 10 seconds total timeout

    const startTime = Date.now();
    for (let i = 0; i < maxRetries; i++) {
      // Check if total timeout exceeded
      if (Date.now() - startTime > totalTimeout) {
        log.error(
          "[SIASN Token] Timeout exceeded saat mencoba mendapatkan token",
          {
            totalTimeout,
            elapsedTime: Date.now() - startTime,
            retries: i + 1,
          }
        );
        throw new Error("Token retry timeout exceeded");
      }

      log.debug(`[SIASN Token] Retry ke-${i + 1} dari ${maxRetries}`, {
        retryTimeout,
        elapsedTime: Date.now() - startTime,
      });

      await new Promise((resolve) => setTimeout(resolve, retryTimeout));

      // Check if Redis client is still available
      if (!redisClient) {
        log.error("[SIASN Token] Redis client tidak tersedia saat retry");
        throw new Error("Redis client unavailable during token retry");
      }

      tokenData = await redisClient.get(TOKEN_KEY);
      if (tokenData) {
        log.info(
          `[SIASN Token] Token berhasil didapatkan pada retry ke-${i + 1}`,
          {
            totalRetries: i + 1,
            elapsedTime: Date.now() - startTime,
          }
        );
        return JSON.parse(tokenData);
      }
    }

    log.error("[SIASN Token] Gagal mendapatkan token setelah retry", {
      maxRetries,
      totalTimeout,
      elapsedTime: Date.now() - startTime,
    });
    throw new Error("Gagal mendapatkan token setelah retry");
  } finally {
    if (lock) {
      try {
        await lock.release();
        log.debug("[SIASN Token] Lock berhasil di-release");
      } catch (err) {
        log.error("[SIASN Token] Gagal release lock:", {
          error: err.message,
          lockKey: LOCK_KEY,
        });
      }
    }
  }
};

const requestHandler = async (request) => {
  try {
    log.debug("[SIASN Request] Memproses request", {
      method: request.method,
      url: request.url,
      baseURL: request.baseURL,
    });

    const token = await getOrCreateToken();
    const { sso_token, wso_token } = token;
    request.headers.Authorization = `Bearer ${wso_token}`;
    request.headers.Auth = `bearer ${sso_token}`;

    log.debug("[SIASN Request] Token berhasil ditambahkan ke header");
    return request;
  } catch (error) {
    log.error("[SIASN Request] Gagal memproses request:", {
      error: error.message,
      method: request.method,
      url: request.url,
      stack: error.stack,
    });
    throw error;
  }
};

const responseHandler = async (response) => response;

const errorHandler = async (error) => {
  const errorData = error?.response?.data || {};
  // const isBuffer = Buffer.isBuffer(errorData);
  const statusCode = error?.response?.status;
  const requestUrl = error?.config?.url;

  log.error("[SIASN Error] Error terdeteksi pada request", {
    error: error.message,
    code: error.code,
    url: requestUrl,
    status: statusCode,
    // isBuffer,
    // errorData: isBuffer ? "[Buffer data]" : errorData,
  });

  const ECONRESET = error?.code === "ECONNRESET";
  const invalidJwt = errorData.message === "invalid or expired jwt";
  const tokenError = errorData.data === "Token SSO mismatch";
  const invalidCredentials = errorData.message === "Invalid Credentials";

  const runtimeError =
    errorData.message === "Runtime Error" &&
    !(errorData.description && errorData.description.includes("SUSPENDED"));

  const notValid =
    invalidJwt ||
    runtimeError ||
    tokenError ||
    invalidCredentials ||
    ECONRESET ||
    isBuffer;

  if (notValid) {
    log.warn(
      "[SIASN Error] Token tidak valid atau expired, menghapus dari cache",
      {
        reason: {
          invalidJwt,
          runtimeError,
          tokenError,
          invalidCredentials,
          ECONRESET,
          // isBuffer,
        },
        url: requestUrl,
      }
    );

    if (redisClient) {
      try {
        await redisClient.del(TOKEN_KEY);
        log.info("[SIASN Error] Token berhasil dihapus dari Redis cache");
      } catch (delError) {
        log.error("[SIASN Error] Gagal menghapus token dari Redis:", {
          error: delError.message,
          stack: delError.stack,
        });
      }
    }
    return Promise.reject(errorData);
  } else {
    log.debug(
      "[SIASN Error] Error tidak terkait dengan token, meneruskan error"
    );
    return Promise.reject(errorData);
  }
};

siasnWsAxios.interceptors.request.use(requestHandler, errorHandler);
siasnWsAxios.interceptors.response.use(responseHandler, errorHandler);

const siasnMiddleware = async (req, res, next) => {
  try {
    log.debug("[SIASN Middleware] Request masuk", {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });

    req.siasnRequest = siasnWsAxios;
    next();
  } catch (error) {
    log.error("[SIASN Middleware] Gagal memproses middleware:", {
      error: error.message,
      method: req.method,
      path: req.path,
      stack: error.stack,
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
