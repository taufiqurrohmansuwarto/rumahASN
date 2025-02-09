const { default: axios } = require("axios");
const https = require("https");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const { createRedisInstance } = require("../utils/redis");
const { default: Redlock } = require("redlock");

const baseUrl = "https://apimws.bkn.go.id:8243/apisiasn/1.0";
const TOKEN_KEY = "siasn_token";

let redisClient;
let redlock;

/**
 * Inisialisasi Redis dan Redlock.
 * Pastikan kedua objek diinisialisasi sebelum digunakan.
 */
const initRedis = async () => {
  if (!redisClient) {
    redisClient = await createRedisInstance();
  }
  if (!redlock) {
    redlock = new Redlock([redisClient], {
      driftFactor: 0.01, // faktor drift (default: 0.01)
      retryCount: 3, // jumlah maksimal percobaan
      retryDelay: 200, // delay antar percobaan (ms)
      retryJitter: 200, // jitter untuk menghindari pola yang sama (ms)
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

/**
 * Fungsi untuk mendapatkan token baru.
 */
const getoken = async () => {
  const wso2 = await a.wso2Fetcher();
  const sso = ssoToken?.token;
  return {
    sso_token: sso,
    wso_token: wso2,
  };
};

/**
 * Fungsi untuk mendapatkan token dari Redis atau membuat token baru jika belum ada.
 * Menggunakan mekanisme locking via Redlock untuk menghindari race condition.
 */
const getOrCreateToken = async () => {
  await initRedis(); // Pastikan Redis dan Redlock sudah diinisialisasi

  let tokenData = await redisClient.get(TOKEN_KEY);
  if (tokenData) {
    return JSON.parse(tokenData);
  }

  // Mendefinisikan key untuk lock
  const LOCK_KEY = "locks:token";
  let lock;

  try {
    // Mengakuisisi lock selama 1000 ms
    lock = await redlock.acquire([LOCK_KEY], 1000);

    // Periksa kembali apakah token sudah ada setelah mendapatkan lock
    tokenData = await redisClient.get(TOKEN_KEY);
    if (tokenData) {
      return JSON.parse(tokenData);
    }

    // Jika token belum ada, buat token baru
    const token = await getoken();
    // Simpan token ke Redis (tambahkan opsi EX jika token memiliki masa berlaku)
    await redisClient.set(TOKEN_KEY, JSON.stringify(token));
    console.log("Token baru dibuat dan disimpan di Redis");
    return token;
  } catch (err) {
    console.error("Gagal mendapatkan lock atau membuat token:", err);
    throw err;
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (releaseErr) {
        console.error("Gagal melepaskan lock:", releaseErr);
      }
    }
  }
};

/**
 * Interceptor request: Menambahkan header otentikasi menggunakan token dari Redis.
 */
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

/**
 * Interceptor response: Mengoper response tanpa modifikasi.
 */
const responseHandler = async (response) => response;

/**
 * Interceptor error: Jika terjadi error terkait token (misalnya token expired atau tidak valid),
 * token dihapus dari Redis agar pada request berikutnya dibuat token baru.
 */
const errorHandler = async (error) => {
  const errorData = error?.response?.data || {};
  const invalidJwt = errorData.message === "invalid or expired jwt";
  const runtimeError = errorData.message === "Runtime Error";
  const tokenError = errorData.data === "Token SSO mismatch";
  const invalidCredentials = errorData.message === "Invalid Credentials";

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

// Pasang interceptor pada instance Axios
siasnWsAxios.interceptors.request.use(requestHandler, errorHandler);
siasnWsAxios.interceptors.response.use(responseHandler, errorHandler);

/**
 * Middleware Express untuk menyuntikkan instance Axios ke objek request.
 */
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
