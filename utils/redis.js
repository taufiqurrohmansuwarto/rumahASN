const { config: loadEnv } = require("dotenv");
loadEnv(); // ☑️ load env vars

const Redis = require("ioredis");

// ✅ Use global in development to persist across HMR
const getRedisClient = () => {
  if (process.env.NODE_ENV === "development") {
    if (!global.redisClient) {
      return null;
    }
    return global.redisClient;
  }
  return global.redisClient || null;
};

const setRedisClient = (client) => {
  if (process.env.NODE_ENV === "development") {
    global.redisClient = client;
  } else {
    global.redisClient = client;
  }
};

const createRedisInstance = () => {
  let redisClient = getRedisClient();

  if (!redisClient) {
    const host = process.env.REDIS_URL ?? "127.0.0.1";
    const port = parseInt(process.env.REDIS_PORT ?? "6380", 10);
    const password = process.env.REDIS_PASSWORD ?? "";

    redisClient = new Redis({
      host,
      port,
      password,

      // retry sampai 5 kali dengan backoff
      maxRetriesPerRequest: 5,
      retryStrategy: (times) => Math.min(times * 200, 1000),

      showFriendlyErrorStack: true,
      enableAutoPipelining: true,

      // ✅ Connection pooling optimizations
      keepAlive: true,
      family: 4,
      lazyConnect: true,
      maxLoadingTimeout: 2000,
    });

    // ✅ Store in global for persistence
    setRedisClient(redisClient);

    // ✅ Graceful shutdown handler
    process.on("SIGTERM", async () => {
      const client = getRedisClient();
      if (client) {
        console.log("🔄 Closing Redis connection...");
        await client.quit();
        setRedisClient(null);
      }
    });

    process.on("SIGINT", async () => {
      const client = getRedisClient();
      if (client) {
        console.log("🔄 Closing Redis connection...");
        await client.quit();
        setRedisClient(null);
      }
    });

    console.log(
      `🔗 Redis connected to ${host}:${port} - Pool ready (${process.env.NODE_ENV})`
    );
  }

  return getRedisClient();
};

module.exports = {
  createRedisInstance,
};
