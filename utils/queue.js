const Bull = require("bull");
const Redis = require("ioredis");

const connection = {
  host: process.env.REDIS_URL || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
};

const redisConnection = new Redis(connection);

export const signAndSaveQueue = new Bull("signAndSaveQueue", {
  redis: redisConnection,
});
