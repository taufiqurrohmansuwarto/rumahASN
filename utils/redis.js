const { config: loadEnv } = require("dotenv");
loadEnv(); // ☑️ load env vars

const Redis = require("ioredis");

// ✅ Flag untuk prevent duplicate listeners
let shutdownHandlersAttached = false;

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

// ✅ Setup shutdown handlers sekali saja
const setupShutdownHandlers = () => {
  if (shutdownHandlersAttached) return;

  const gracefulShutdown = async (signal) => {
    const client = getRedisClient();
    if (client) {
      console.log(`🔄 [${signal}] Closing Redis connection...`);
      try {
        await client.quit();
        setRedisClient(null);
      } catch (err) {
        console.error(`Error closing Redis on ${signal}:`, err);
      }
    }
  };

  process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  
  shutdownHandlersAttached = true;
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

    // ✅ Setup shutdown handlers hanya sekali
    setupShutdownHandlers();

    console.log(
      `🔗 Redis connected to ${host}:${port} - Pool ready (${process.env.NODE_ENV})`
    );
  }

  return getRedisClient();
};

module.exports = {
  createRedisInstance,
};
