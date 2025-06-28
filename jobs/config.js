const { loadEnv } = require("./utils/load-env");
loadEnv();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  username: process.env.REDIS_USERNAME || "",
  // Enhanced Redis configuration for better performance and stability
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  family: 4,
};

const queueOptions = {
  removeOnComplete: 50, // Increased from 20 to prevent queue bloat
  removeOnFail: 100,    // Increased from 50 for better debugging
  attempts: 3,
  backoff: "exponential",
  // Enhanced job options
  delay: 1000,          // 1 second delay between retries
  timeout: 60000,       // 60 second timeout per job
  removeOnComplete: true, // Auto-remove completed jobs
  removeOnFail: false,    // Keep failed jobs for debugging
};

module.exports = {
  redis: redisConfig,
  defaultJobOptions: queueOptions,
};
