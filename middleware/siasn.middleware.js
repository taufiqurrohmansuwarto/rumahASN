const { default: axios } = require("axios");
const https = require("https");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const { createRedisInstance } = require("../utils/redis");
const { default: Redlock } = require("redlock");

const baseUrl = "https://apimws.bkn.go.id:8243/apisiasn/1.0";
const TOKEN_KEY = "siasn_token";
const REFRESH_FLAG_KEY = "refresh:token";

let redisClient;
let redlock;

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

const siasnWsAxios = axios.create({
  baseURL: baseUrl,
  httpsAgent: new https.Agent({
    secureProtocol: "TLS_method",
  }),
});

const getoken = async () => {
  const wso2 = await a.wso2Fetcher();
  const sso = ssoToken?.token;
  return { sso_token: sso, wso_token: wso2 };
};

const getOrCreateToken = async () => {
  await initRedis();

  let tokenData = await redisClient.get(TOKEN_KEY);
  if (tokenData) {
    return JSON.parse(tokenData);
  }

  // Coba set refresh flag dengan SETNX dan TTL 5 detik
  const setResult = await redisClient.set(REFRESH_FLAG_KEY, "1", "NX", "EX", 5);
  if (!setResult) {
    console.log("Refresh token sedang berjalan, menunggu token baru...");
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      tokenData = await redisClient.get(TOKEN_KEY);
      if (tokenData) {
        return JSON.parse(tokenData);
      }
    }
    throw new Error("Timeout menunggu token baru");
  }

  try {
    const token = await getoken();
    await redisClient.set(TOKEN_KEY, JSON.stringify(token));
    console.log("Token baru dibuat dan disimpan di Redis");
    return token;
  } catch (err) {
    console.error("Gagal membuat token:", err);
    throw err;
  } finally {
    await redisClient.del(REFRESH_FLAG_KEY);
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
  const invalidJwt = errorData.message === "invalid or expired jwt";
  const tokenError = errorData.data === "Token SSO mismatch";
  const invalidCredentials = errorData.message === "Invalid Credentials";
  const runtimeError =
    errorData.message === "Runtime Error" &&
    !(errorData.description && errorData.description.includes("SUSPENDED"));

  const notValid =
    invalidJwt || runtimeError || tokenError || invalidCredentials;
  if (notValid) {
    if (redisClient) {
      await redisClient.del(TOKEN_KEY);
    }
    console.log("Token dihapus dari Redis karena error:", errorData);
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  siasnMiddleware,
  siasnWsAxios,
};
