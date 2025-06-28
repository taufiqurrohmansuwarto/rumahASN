const { sealQueue, shutdown } = require("./queue");

const sealProcessor = require("./processors/seal");

// Process jobs with enhanced error handling
sealQueue.process("refresh-totp", async (job) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  try {
    console.log(`🚀 [SEAL] Starting job ${job.id} at ${new Date().toISOString()}`);
    
    const result = await sealProcessor.refreshTotp(job);
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;
    
    console.log(`📊 [SEAL] Job ${job.id} completed - Duration: ${duration}ms, Memory: ${Math.round(memoryUsed / 1024)}KB`);
    
    return result;
  } catch (error) {
    console.error(`❌ [SEAL] Job ${job.id} failed:`, error.message);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log(`🧹 [SEAL] Garbage collection triggered after job ${job.id} failure`);
    }
    
    throw error;
  }
});

console.log("🔄 Worker started and processing jobs...");
console.log(`📊 Worker PID: ${process.pid}`);
console.log(`💾 Initial memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

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
  console.error("💥 Unhandled Rejection in worker at:", promise, "reason:", reason);
  await gracefulShutdown("UNHANDLED_REJECTION");
});

// Memory monitoring (every 5 minutes)
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log(`📊 [MEMORY] RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
}, 5 * 60 * 1000);
