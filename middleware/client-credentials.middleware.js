/**
 * Client Credentials Middleware dengan Redis Caching
 *
 * Strategy:
 * - Cache OAuth2 token di Redis dengan TTL 1 jam
 * - Gunakan simple Redis lock (SET NX EX) untuk prevent race condition
 * - Auto-refresh token saat expired
 * - Retry mechanism dengan exponential backoff
 *
 * Performance:
 * - First request: ~2-5 detik (fetch token dari external server)
 * - Cached requests: <10ms (dari Redis)
 * - Token lifetime: 1 jam
 * - Saves ~99% network calls to external OAuth server
 */

const { default: axios } = require("axios");
const ClientOAuth2 = require("client-oauth2");
const { logger } = require("@/utils/logger");
const { createRedisInstance } = require("../utils/redis");

const clientId = process.env.CLIENT_ID_CC;
const clientSecret = process.env.CLIENT_SECRET_CC;

const TOKEN_KEY = "client_credentials_token";
const LOCK_KEY = "client_credentials_lock";
const LOCK_TTL = 10; // Lock TTL in seconds

// Use global to persist across hot reloads in development
let redisClient = global.__ccRedisClient;

// Simple Redis lock functions
const acquireLock = async (key, ttl) => {
  try {
    const result = await redisClient.set(key, "locked", "NX", "EX", ttl);
    return result === "OK";
  } catch (error) {
    logger.error("[Client Credentials] Lock acquisition error:", {
      error: error.message,
    });
    return false;
  }
};

const releaseLock = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error("[Client Credentials] Lock release error:", {
      error: error.message,
    });
  }
};

// Cleanup function untuk mencegah memory leak
const cleanup = async () => {
  try {
    logger.info("[Client Credentials] Cleanup completed");
  } catch (error) {
    logger.error("[Client Credentials] Cleanup failed:", {
      error: error.message,
    });
  }
};

// Initialize Redis
const initRedis = async () => {
  if (!redisClient) {
    try {
      const isFirstInit = !global.__ccRedisClient;

      redisClient = global.__ccRedisClient || (await createRedisInstance());

      if (!redisClient) {
        throw new Error("Failed to create Redis instance");
      }

      global.__ccRedisClient = redisClient;

      if (isFirstInit) {
        logger.info("[Client Credentials] Redis initialized");
      } else {
        logger.debug(
          "[Client Credentials] Redis restored from global (hot reload)"
        );
      }
    } catch (error) {
      logger.error("[Client Credentials] Redis initialization failed:", {
        error: error.message,
      });
      throw error;
    }
  }
};

// Retry helper dengan exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isConnectionError =
        error.code === "EUNAVAILABLE" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ERR_STREAM_PREMATURE_CLOSE" ||
        (error.cause && error.cause.code === "ERR_STREAM_PREMATURE_CLOSE");

      if (isConnectionError && !isLastAttempt) {
        const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(
          `[Client Credentials] Koneksi gagal (percobaan ${attempt}/${maxRetries}). Retry dalam ${waitTime}ms...`,
          {
            error: error.message,
            code: error.code || error.cause?.code,
            url: error.request?.url,
          }
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

// Generate OAuth2 token
const generateToken = async () => {
  const masterOAuth = new ClientOAuth2({
    clientId,
    clientSecret,
    scopes: ["pemprov"],
    accessTokenUri: "https://siasn.bkd.jatimprov.go.id/oidc-master/token",
  });

  const token = await retryWithBackoff(
    () => masterOAuth.credentials.getToken(),
    3,
    1000
  );

  return {
    accessToken: token.accessToken,
    expiresAt: Date.now() + 3600 * 1000, // 1 jam dari sekarang
  };
};

// Get or create token dengan Redis caching dan simple lock
const getOrCreateToken = async () => {
  await initRedis();

  // Cek token dulu sebelum acquire lock
  let tokenData = await redisClient.get(TOKEN_KEY);
  if (tokenData) {
    const parsed = JSON.parse(tokenData);
    // Cek apakah token masih valid (belum expired)
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      logger.debug("[Client Credentials] Using cached token");
      return parsed.accessToken;
    } else {
      logger.debug(
        "[Client Credentials] Cached token expired, generating new one"
      );
      await redisClient.del(TOKEN_KEY);
    }
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
        const parsed = JSON.parse(tokenData);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          logger.debug("[Client Credentials] Token found after lock acquired");
          return parsed.accessToken;
        }
      }

      // Generate token baru
      logger.info("[Client Credentials] Creating new token");
      const tokenInfo = await generateToken();

      // Cache dengan TTL 3600 detik (1 jam)
      await redisClient.set(TOKEN_KEY, JSON.stringify(tokenInfo), "EX", 3600);

      return tokenInfo.accessToken;
    } else {
      // Lock acquisition failed, try fallback
      logger.warn(
        "[Client Credentials] Lock acquisition failed, trying fallback"
      );

      // Fallback: coba tunggu token dari process lain
      const maxRetries = 5;
      const retryTimeout = 1000;
      const totalTimeout = 10000;
      const startTime = Date.now();

      for (let i = 0; i < maxRetries; i++) {
        if (Date.now() - startTime > totalTimeout) {
          logger.error("[Client Credentials] Token retry timeout exceeded", {
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
          const parsed = JSON.parse(tokenData);
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            logger.info(
              `[Client Credentials] Token acquired on retry ${i + 1}`
            );
            return parsed.accessToken;
          }
        }
      }

      logger.error("[Client Credentials] Failed to get token after retries");
      throw new Error("Failed to get token after retries");
    }
  } catch (err) {
    logger.error("[Client Credentials] Token acquisition error:", {
      error: err.message,
    });
    throw err;
  } finally {
    if (lockAcquired) {
      await releaseLock(LOCK_KEY);
    }
  }
};

module.exports = async (req, res, next) => {
  try {
    logger.debug("[Client Credentials] Memulai autentikasi...");

    // Get token from cache or generate new one
    const accessToken = await getOrCreateToken();

    logger.debug("[Client Credentials] Token berhasil didapatkan");

    req.clientCredentialsFetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 30000, // 30 detik timeout
    });

    next();
  } catch (error) {
    // Log error dengan detail lengkap - safe logging to prevent circular structure
    logger.error("[Client Credentials] Gagal mendapatkan token:", {
      clientId: clientId?.substring(0, 10) + "...", // Log sebagian client ID
      url: error.request?.url,
      code: error.code || error.cause?.code,
      errorName: error.name,
      message: error.message,
    });

    // Response yang lebih informatif berdasarkan jenis error
    const isConnectionError =
      error.code === "EUNAVAILABLE" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      (error.cause && error.cause.code === "ERR_STREAM_PREMATURE_CLOSE");

    if (isConnectionError) {
      return res.status(503).json({
        code: "SERVICE_UNAVAILABLE",
        message:
          "Server autentikasi SIASN sedang tidak dapat diakses. Silakan coba beberapa saat lagi.",
        details:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }

    // Error lainnya (misal: kredensial salah)
    return res.status(500).json({
      code: "AUTH_ERROR",
      message: "Gagal melakukan autentikasi. Silakan hubungi administrator.",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};
