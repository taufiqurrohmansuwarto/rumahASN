const Queue = require("bull");
const { defaultJobOptions, redis } = require("./config");

// create a queue for each job type
const sealQueue = new Queue("seal", { redis }, defaultJobOptions);
const siasnQueue = new Queue("siasn", { redis }, defaultJobOptions);

// Proxy sync queue (separate logic untuk proxy operations)
const proxyQueue = new Queue(
  "proxy-sync",
  { redis },
  {
    ...defaultJobOptions,
    attempts: 3,
    timeout: 1800000, // 30 minutes untuk sync yang lama
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  }
);

function addLogging(queue, name) {
  const listeners = {
    error: (error) => {
      console.error(`❌ [${name.toUpperCase()}] Queue error:`, error.message);
    },
    waiting: (jobId) => {
      console.log(`⏳ [${name.toUpperCase()}] Job waiting: ${jobId}`);
    },
    completed: (job, result) => {
      const jobId = typeof job === 'object' ? job.id : job;
      const resultStr = result && typeof result === 'object' 
        ? `| ${JSON.stringify(result).substring(0, 100)}` 
        : result ? `| ${result}` : '';
      console.log(`✅ [${name.toUpperCase()}] Job completed: ${jobId} ${resultStr}`);
    },
    failed: (jobId, error) => {
      console.error(
        `❌ [${name.toUpperCase()}] Job failed: ${jobId} - ${error.message}`
      );
    },
    progress: (job, progress) => {
      const jobId = typeof job === 'object' ? job.id : job;
      const progressNum = typeof progress === 'number' ? progress : progress?.progress || 0;
      console.log(
        `🔄 [${name.toUpperCase()}] Job progress: ${jobId} - ${progressNum}%`
      );
    },
    paused: () => {
      console.log(`⏸️  [${name.toUpperCase()}] Queue paused`);
    },
    resumed: () => {
      console.log(`▶️  [${name.toUpperCase()}] Queue resumed`);
    }
  };

  // Add all listeners
  Object.entries(listeners).forEach(([event, handler]) => {
    queue.on(event, handler);
  });

  // Store cleanup function for later use
  queue._loggerCleanup = () => {
    Object.entries(listeners).forEach(([event, handler]) => {
      queue.removeListener(event, handler);
    });
    console.log(`🧹 [${name.toUpperCase()}] Event listeners cleaned up`);
  };

  return queue._loggerCleanup;
}

addLogging(sealQueue, "seal");
addLogging(siasnQueue, "siasn");
addLogging(proxyQueue, "proxy");

// Auto-resume queues on initialization
proxyQueue.resume().then(() => {
  console.log("▶️  [PROXY] Queue auto-resumed on initialization");
}).catch(err => {
  console.warn("⚠️  [PROXY] Failed to auto-resume queue:", err.message);
});

// Shutdown flag to prevent multiple shutdowns
let isShuttingDown = false;

// Helper to safely close a queue
const safeCloseQueue = async (queue, name) => {
  try {
    // Check if Redis client exists and is connected
    if (queue.client && queue.client.status === "ready") {
      await queue.close();
      console.log(`✅ [${name}] Queue closed`);
    } else {
      console.log(`⚠️  [${name}] Queue already disconnected, skipping close`);
    }
  } catch (error) {
    // Ignore "already connecting/connected" errors
    if (!error.message.includes("already connecting") && !error.message.includes("already connected")) {
      console.error(`❌ [${name}] Error closing queue:`, error.message);
    }
  }
};

// Graceful shutdown function
const shutdown = async () => {
  if (isShuttingDown) {
    console.log("⚠️  Shutdown already in progress, ignoring...");
    return;
  }
  
  isShuttingDown = true;
  console.log("🔄 Starting graceful shutdown of Bull queues...");
  
  try {
    // Clean up event listeners first
    if (sealQueue._loggerCleanup) sealQueue._loggerCleanup();
    if (siasnQueue._loggerCleanup) siasnQueue._loggerCleanup();
    if (proxyQueue._loggerCleanup) proxyQueue._loggerCleanup();
    console.log("🧹 Event listeners cleaned up");
    
    // Pause queues to stop accepting new jobs
    try {
      await Promise.all([
        sealQueue.pause().catch(() => {}),
        siasnQueue.pause().catch(() => {}),
        proxyQueue.pause().catch(() => {}),
      ]);
      console.log("⏸️  All queues paused");
    } catch (error) {
      console.log("⚠️  Some queues failed to pause:", error.message);
    }
    
    // Wait for active jobs to complete (with timeout)
    try {
      await Promise.race([
        Promise.all([
          sealQueue.whenCurrentJobsFinished().catch(() => {}),
          siasnQueue.whenCurrentJobsFinished().catch(() => {}),
          proxyQueue.whenCurrentJobsFinished().catch(() => {}),
        ]),
        new Promise((resolve) => setTimeout(resolve, 5000)) // 5s timeout (reduced)
      ]);
      console.log("✅ Active jobs completed or timed out");
    } catch (error) {
      console.log("⚠️  Error waiting for jobs:", error.message);
    }
    
    // Close queue connections individually
    await safeCloseQueue(sealQueue, "SEAL");
    await safeCloseQueue(siasnQueue, "SIASN");
    await safeCloseQueue(proxyQueue, "PROXY");
    
    console.log("🔌 All queue connections closed");
    
  } catch (error) {
    console.error("❌ Error during queue shutdown:", error.message);
  }
};

// Handle process termination
process.on("SIGTERM", async () => {
  console.log("📨 SIGTERM received");
  await shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("📨 SIGINT received");
  await shutdown();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  console.error("💥 Uncaught Exception:", error);
  await shutdown();
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  await shutdown();
  process.exit(1);
});

module.exports = {
  sealQueue,
  siasnQueue,
  proxyQueue,
  shutdown,
};
