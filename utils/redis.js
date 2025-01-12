import { config } from "dotenv";
import Redis from "ioredis";

export const createRedisInstance = async () => {
  const configuration = {
    host: process.env.REDIS_URL || "localhost",
    password: process.env.REDIS_PASSWORD || "",
    port: process.env.REDIS_PORT || 6379,
  };
  try {
    const options = {
      host: configuration.host,
      port: configuration.port,
      password: configuration.password,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times) => {
        if (times > 3) {
          throw new Error(`[Redis] Could not connect after ${times} attempts`);
        }
        return Math.min(times * 200, 1000);
      },
    };

    if (config.port) {
      options.port = configuration.port;
    }

    if (configuration.password) {
      options.password = configuration.password;
    }

    const redis = new Redis(options);

    return redis;
  } catch (error) {
    throw new Error(error);
  }
};
