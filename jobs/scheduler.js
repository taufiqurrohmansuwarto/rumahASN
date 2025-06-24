const { sealQueue } = require("./queue");

async function setupJobs() {
  const queues = [sealQueue];

  for (const queue of queues) {
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // Schedule seal TOTP refresh (every 10 seconds)
  await sealQueue.add(
    "refresh-totp",
    {},
    {
      repeat: { cron: "*/10 * * * * *" },
      jobId: "seal-totp-refresh",
    }
  );

  if (require.main === module) {
    setupJobs().then(() => {
      console.log("Jobs setup complete");
      process.exit(0);
    });
  }
}

module.exports = {
  setupJobs,
};
