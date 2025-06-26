const Queue = require("bull");
const { defaultJobOptions, redis } = require("./config");

// create a queue for each job type
const sealQueue = new Queue("seal", { redis }, defaultJobOptions);

function addLogging(queue, name) {
  queue.on("error", (error) => {
    console.error(`❌ [${name.toUpperCase()}] Queue error:`, error.message);
  });

  queue.on("waiting", (jobId) => {
    console.log(`⏳ [${name.toUpperCase()}] Job waiting: ${jobId}`);
  });

  queue.on("completed", (jobId, result) => {
    console.log(
      `✅ [${name.toUpperCase()}] Job completed: ${jobId}`,
      result?.status ? `- ${result.status}` : ""
    );
  });

  queue.on("failed", (jobId, error) => {
    console.error(
      `❌ [${name.toUpperCase()}] Job failed: ${jobId} - ${error.message}`
    );
  });

  queue.on("progress", (jobId, progress) => {
    console.log(
      `🔄 [${name.toUpperCase()}] Job progress: ${jobId} - ${progress}%`
    );
  });

  queue.on("paused", () => {
    console.log(`⏸️  [${name.toUpperCase()}] Queue paused`);
  });

  queue.on("resumed", () => {
    console.log(`▶️  [${name.toUpperCase()}] Queue resumed`);
  });
}

addLogging(sealQueue, "seal");

module.exports = {
  sealQueue,
};
