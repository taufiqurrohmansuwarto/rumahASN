const { default: axios } = require("axios");
const https = require("https");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const { createRedisInstance } = require("../utils/redis");
const { default: Redlock } = require("redlock");

const dotenv = require("dotenv");
dotenv.config();

const baseUrl = process.env.API_SIASN;
const TOKEN_KEY = "siasn_token";
const REFRESH_FLAG_KEY = "refresh:token";
const LOCK_KEY = "token_lock";

let redisClient;
let redlock;
let httpsAgent;

// Cleanup function untuk mencegah memory leak
const cleanup = async () => {
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
};

// Handle process termination
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);

const initRedis = async () => {
  if (!redisClient) {
    redisClient = await createRedisInstance();
  }
  if (!redlock) {
    redlock = new Redlock([redisClient], {
      driftFactor: 0.01,
      retryCount: 3,
      retryDelay: 200,
      retryJitter: 200,
    });
    console.log("Redis dan Redlock telah diinisialisasi");
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
    const token = await getoken();
    await redisClient.set(TOKEN_KEY, JSON.stringify(token), "EX", 3600); // TTL 1 hour
    console.log("Token baru dibuat dan disimpan di Redis");
    return token;
  } catch (err) {
    // console.error("Gagal membuat token:", err);

    // Fallback: coba tunggu token dari process lain
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      tokenData = await redisClient.get(TOKEN_KEY);
      if (tokenData) {
        return JSON.parse(tokenData);
      }
    }

    throw new Error("Gagal mendapatkan token setelah retry");
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (err) {
        console.error("Gagal release lock:", err);
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
    console.error("Error pada requestHandler:", error);
    throw error;
  }
};

const responseHandler = async (response) => response;

const errorHandler = async (error) => {
  const errorData = error?.response?.data || {};

  // typeo errorData is buffer
  const isBuffer = Buffer.isBuffer(errorData);

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
    if (redisClient) {
      try {
        await redisClient.del(TOKEN_KEY);
        console.log("Token dihapus dari Redis karena error:", errorData);
      } catch (delError) {
        console.error("Gagal menghapus token dari Redis:", delError);
      }
    }
    return Promise.reject(errorData);
  } else {
    return Promise.reject(errorData);
  }
};

siasnWsAxios.interceptors.request.use(requestHandler, errorHandler);
siasnWsAxios.interceptors.response.use(responseHandler, errorHandler);

const siasnMiddleware = async (req, res, next) => {
  try {
    req.siasnRequest = siasnWsAxios;
    next();
  } catch (error) {
    console.error("Error in siasnMiddleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  siasnMiddleware,
  siasnWsAxios,
  cleanup, // Export cleanup function untuk testing atau manual cleanup
};
