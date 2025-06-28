const Queue = require("bull");
const { defaultJobOptions, redis } = require("./config");

// create a queue for each job type
const sealQueue = new Queue("seal", { redis }, defaultJobOptions);

function addLogging(queue, name) {
  const listeners = {
    error: (error) => {
      console.error(`❌ [${name.toUpperCase()}] Queue error:`, error.message);
    },
    waiting: (jobId) => {
      console.log(`⏳ [${name.toUpperCase()}] Job waiting: ${jobId}`);
    },
    completed: (jobId, result) => {
      console.log(
        `✅ [${name.toUpperCase()}] Job completed: ${jobId}`,
        result?.status ? `- ${result.status}` : ""
      );
    },
    failed: (jobId, error) => {
      console.error(
        `❌ [${name.toUpperCase()}] Job failed: ${jobId} - ${error.message}`
      );
    },
    progress: (jobId, progress) => {
      console.log(
        `🔄 [${name.toUpperCase()}] Job progress: ${jobId} - ${progress}%`
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

// Graceful shutdown function
const shutdown = async () => {
  console.log("🔄 Starting graceful shutdown of Bull queues...");
  
  try {
    // Clean up event listeners
    if (sealQueue._loggerCleanup) {
      sealQueue._loggerCleanup();
    }
    
    // Pause queue to stop accepting new jobs
    await sealQueue.pause();
    console.log("⏸️  Queue paused");
    
    // Wait for active jobs to complete (with timeout)
    await Promise.race([
      sealQueue.whenCurrentJobsFinished(),
      new Promise((resolve) => setTimeout(resolve, 30000)) // 30s timeout
    ]);
    console.log("✅ Active jobs completed");
    
    // Close queue connection
    await sealQueue.close();
    console.log("🔌 Queue connection closed");
    
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
  shutdown,
};
