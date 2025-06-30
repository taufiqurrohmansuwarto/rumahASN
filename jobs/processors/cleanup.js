const { loadEnv } = require("../utils/load-env");
loadEnv();

const Redis = require("ioredis");

async function createRedisClient() {
  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || 6379;
  const password = process.env.REDIS_PASSWORD || "";
  const username = process.env.REDIS_USERNAME || "";

  return new Redis({
    host,
    port,
    password,
    username,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    family: 4,
  });
}

async function cleanupBullRepeatKeys() {
  console.log(">ù Starting Bull repeat keys cleanup...");
  
  let redisClient = null;
  try {
    redisClient = await createRedisClient();
    await redisClient.connect();
    
    // Scan for bull:seal:repeat:* keys
    const pattern = "bull:seal:repeat:*";
    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      console.log(" No Bull repeat keys found to cleanup");
      return { status: "no_keys", cleaned: 0 };
    }
    
    console.log(`= Found ${keys.length} Bull repeat keys to cleanup`);
    
    // Delete keys in batches to avoid blocking Redis
    const batchSize = 100;
    let cleaned = 0;
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const deleted = await redisClient.del(...batch);
      cleaned += deleted;
      console.log(`=Ñ Deleted ${deleted} keys (batch ${Math.ceil((i + 1) / batchSize)})`);
    }
    
    console.log(` Cleanup completed: ${cleaned} Bull repeat keys removed`);
    return { status: "success", cleaned };
    
  } catch (error) {
    console.error("L Error during Bull repeat keys cleanup:", error.message);
    throw error;
  } finally {
    if (redisClient) {
      await redisClient.quit();
    }
  }
}

async function cleanupSpecificRepeatKey(jobId) {
  console.log(`>ù Cleaning specific repeat key for job: ${jobId}`);
  
  let redisClient = null;
  try {
    redisClient = await createRedisClient();
    await redisClient.connect();
    
    const pattern = `bull:seal:repeat:*${jobId}*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      console.log(` No specific repeat keys found for job: ${jobId}`);
      return { status: "no_keys", cleaned: 0 };
    }
    
    const deleted = await redisClient.del(...keys);
    console.log(` Cleaned ${deleted} specific repeat keys for job: ${jobId}`);
    
    return { status: "success", cleaned: deleted };
    
  } catch (error) {
    console.error(`L Error cleaning specific repeat key for ${jobId}:`, error.message);
    throw error;
  } finally {
    if (redisClient) {
      await redisClient.quit();
    }
  }
}

module.exports = {
  cleanupBullRepeatKeys,
  cleanupSpecificRepeatKey,
};