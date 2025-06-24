const Queue = require("bull");
const { defaultJobOptions, redis } = require("./config");

// create a queue for each job type
const sealQueue = new Queue("seal", { redis }, defaultJobOptions);

function addLogging(queue, name) {
  queue.on("error", (error) => {
    console.error(`${name} queue error:`, error);
  });

  queue.on("waiting", (jobId) => {
    console.log(`${name} queue waiting:`, jobId);
  });

  queue.on("completed", (jobId, result) => {
    console.log(`${name} queue completed:`, jobId, result);
  });

  queue.on("failed", (jobId, error) => {
    console.error(`${name} queue failed:`, jobId, error);
  });

  queue.on("progress", (jobId, progress) => {
    console.log(`${name} queue progress:`, jobId, progress);
  });

  queue.on("paused", () => {
    console.log(`${name} queue paused`);
  });

  queue.on("resumed", () => {
    console.log(`${name} queue resumed`);
  });
}

addLogging(sealQueue, "seal");

module.exports = {
  sealQueue,
};
