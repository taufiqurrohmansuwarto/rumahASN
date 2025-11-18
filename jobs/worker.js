// Register module aliases for Node.js context only
require("module-alias/register");

const { sealQueue, siasnQueue, proxyQueue, shutdown } = require("./queue");

const sealProcessor = require("./processors/seal");
const siasnProcessor = require("./processors/siasn");
const proxyProcessor = require("./processors/proxy");
const cleanupProcessor = require("./processors/cleanup");

// Process jobs with enhanced error handling
sealQueue.process("refresh-totp", async (job) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  try {
    console.log(
      `🚀 [SEAL] Starting job ${job.id} at ${new Date().toISOString()}`
    );

    const result = await sealProcessor.refreshTotp();

    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

    console.log(
      `📊 [SEAL] Job ${
        job.id
      } completed - Duration: ${duration}ms, Memory: ${Math.round(
        memoryUsed / 1024
      )}KB`
    );

    // Cleanup specific repeat keys after successful job completion
    try {
      await cleanupProcessor.cleanupSpecificRepeatKey(job.id);
    } catch (cleanupError) {
      console.warn(
        `⚠️ Failed to cleanup repeat keys for job ${job.id}:`,
        cleanupError.message
      );
    }

    return result;
  } catch (error) {
    console.error(`❌ [SEAL] Job ${job.id} failed:`, error.message);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log(
        `🧹 [SEAL] Garbage collection triggered after job ${job.id} failure`
      );
    }

    throw error;
  }
});

// Process SIASN jobs with enhanced error handling and monitoring
siasnQueue.process("sync-structural-batch", async (job) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  try {
    console.log(
      `🚀 [SIASN] Starting structural batch job ${job.id} - Batch ${job.data.batchNumber}/${job.data.totalBatches}`
    );

    const result = await siasnProcessor.syncStrukturalData(job);

    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

    console.log(
      `📊 [SIASN] Batch job ${
        job.id
      } completed - Duration: ${duration}ms, Memory: ${Math.round(
        memoryUsed / 1024
      )}KB`
    );
    console.log(
      `✅ [SIASN] Batch ${job.data.batchNumber}: Processed ${result.processed}/${result.total}, Errors: ${result.errors}`
    );

    // Cleanup specific repeat keys after successful job completion
    try {
      await cleanupProcessor.cleanupSpecificRepeatKey(job.id);
    } catch (cleanupError) {
      console.warn(
        `⚠️ Failed to cleanup repeat keys for job ${job.id}:`,
        cleanupError.message
      );
    }

    return result;
  } catch (error) {
    console.error(`❌ [SIASN] Batch job ${job.id} failed:`, error.message);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log(
        `🧹 [SIASN] Garbage collection triggered after batch job ${job.id} failure`
      );
    }

    throw error;
  }
});

// Process other SIASN job types
siasnQueue.process("sync-all-structural", async (job) => {
  try {
    console.log(`🚀 [SIASN] Starting sync all structural job ${job.id}`);
    return await siasnProcessor.syncAllStrukturalData(job);
  } catch (error) {
    console.error(`❌ [SIASN] Sync all job ${job.id} failed:`, error.message);
    throw error;
  }
});

siasnQueue.process("test-connection", async (job) => {
  try {
    console.log(`🧪 [SIASN] Starting connection test job ${job.id}`);
    return await siasnProcessor.testSiasnConnection(job);
  } catch (error) {
    console.error(
      `❌ [SIASN] Connection test job ${job.id} failed:`,
      error.message
    );
    throw error;
  }
});

// Process cleanup jobs
sealQueue.process("cleanup-repeat-keys", async (job) => {
  try {
    console.log(`🧹 [CLEANUP] Starting cleanup job ${job.id}`);
    return await cleanupProcessor.cleanupBullRepeatKeys();
  } catch (error) {
    console.error(`❌ [CLEANUP] Cleanup job ${job.id} failed:`, error.message);
    throw error;
  }
});

// Process proxy sync jobs (separate logic)
console.log(
  "📋 Registering proxyQueue.process('sync-proxy') with concurrency 1..."
);

// Add Redis connection event listeners for debugging
proxyQueue.client.on("connect", () => {
  console.log("✅ [PROXY] Redis client connected");
});

proxyQueue.client.on("ready", () => {
  console.log("✅ [PROXY] Redis client ready");
});

proxyQueue.client.on("error", (err) => {
  console.error("❌ [PROXY] Redis client error:", err.message);
});

proxyQueue.process("sync-proxy", 1, async (job) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  console.log(
    `🔔 [PROXY WORKER] Picked up ${job.data.type} sync job: ${job.id}`
  );

  try {
    const result = await proxyProcessor.processProxySync(job);

    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

    console.log(
      `✅ [PROXY WORKER] Completed ${job.data.type} sync: ${
        job.id
      } | Duration: ${Math.round(duration / 1000)}s, Memory: ${Math.round(
        memoryUsed / 1024 / 1024
      )}MB | Total: ${result?.total}, Inserted: ${result?.inserted}`
    );

    // Garbage collection
    if (global.gc) {
      global.gc();
      console.log(`🧹 [PROXY WORKER] GC triggered for job: ${job.id}`);
    }

    return result;
  } catch (error) {
    console.error(
      `❌ [PROXY WORKER] Failed ${job.data.type} sync: ${job.id}`,
      error.message
    );

    // Garbage collection on error
    if (global.gc) {
      global.gc();
    }

    throw error;
  }
});

// Give some time for all processors to register
setTimeout(() => {
  console.log("🔄 Worker started and processing jobs...");
  console.log("📋 Registered processors:");
  console.log("   - SEAL: refresh-totp, cleanup-repeat-keys");
  console.log(
    "   - SIASN: sync-structural-batch, sync-all-structural, test-connection"
  );
  console.log(
    "   - PROXY: sync-proxy (pangkat, pensiun, pg_akademik, pg_profesi, skk)"
  );
  console.log(`📊 Worker PID: ${process.pid}`);
  console.log(
    `💾 Initial memory usage: ${Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    )}MB`
  );
  console.log("✅ All processors registered, ready to accept jobs!");
}, 1000);

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`📨 ${signal} received - initiating graceful shutdown...`);

  try {
    // Use the centralized shutdown function from queue.js
    await shutdown();

    console.log("✅ Worker shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during worker shutdown:", error.message);
    process.exit(1);
  }
};

// Handle different termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Enhanced error handling
process.on("uncaughtException", async (error) => {
  console.error("💥 Uncaught Exception in worker:", error);
  await gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error(
    "💥 Unhandled Rejection in worker at:",
    promise,
    "reason:",
    reason
  );
  await gracefulShutdown("UNHANDLED_REJECTION");
});

// Memory monitoring (every 5 minutes)
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log(
    `📊 [MEMORY] RSS: ${Math.round(
      memUsage.rss / 1024 / 1024
    )}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
  );
}, 5 * 60 * 1000);
