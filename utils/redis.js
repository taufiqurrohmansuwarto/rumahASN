import { config as loadEnv } from "dotenv";
loadEnv(); // ☑️ load env vars

import Redis from "ioredis";

export const createRedisInstance = () => {
  const host = process.env.REDIS_URL ?? "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);
  const password = process.env.REDIS_PASSWORD ?? "";

  return new Redis({
    host,
    port,
    password,

    // retry sampai 5 kali dengan backoff
    maxRetriesPerRequest: 5,
    retryStrategy: (times) => Math.min(times * 200, 1000),

    showFriendlyErrorStack: true,
    enableAutoPipelining: true,
  });
};
