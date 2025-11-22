const { default: axios } = require("axios");
const ClientOAuth2 = require("client-oauth2");
const { logger } = require("@/utils/logger");

const clientId = process.env.CLIENT_ID_CC;
const clientSecret = process.env.CLIENT_SECRET_CC;

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

module.exports = async (req, res, next) => {
  try {
    logger.debug("[Client Credentials] Memulai autentikasi...");

    const masterOAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      scopes: ["pemprov"],
      accessTokenUri: "https://siasn.bkd.jatimprov.go.id/oidc-master/token",
    });

    // Retry token request dengan backoff
    const token = await retryWithBackoff(
      () => masterOAuth.credentials.getToken(),
      3,
      1000
    );

    logger.debug("[Client Credentials] Token berhasil didapatkan");

    req.clientCredentialsFetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
      timeout: 30000, // 30 detik timeout
    });

    next();
  } catch (error) {
    // Log error dengan detail lengkap
    logger.error("[Client Credentials] Gagal mendapatkan token:", error, {
      clientId: clientId?.substring(0, 10) + "...", // Log sebagian client ID
      url: error.request?.url,
      code: error.code || error.cause?.code,
      errorName: error.name,
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
