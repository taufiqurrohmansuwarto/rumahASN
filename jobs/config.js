const { loadEnv } = require("./utils/load-env");
loadEnv();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  username: process.env.REDIS_USERNAME || "",
};

const queueOptions = {
  removeOnComplete: 20,
  removeOnFail: 50,
  attempts: 3,
  backoff: "exponential",
};

module.exports = {
  redis: redisConfig,
  defaultJobOptions: queueOptions,
};
