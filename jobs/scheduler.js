const { sealQueue } = require("./queue");

async function setupJobs() {
  const queues = [sealQueue];

  for (const queue of queues) {
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // Schedule seal TOTP refresh (every 5 minutes)
  await sealQueue.add(
    "refresh-totp",
    {},
    {
      repeat: { cron: "*/5 * * * *" },
      jobId: "seal-totp-refresh",
    }
  );

  // Schedule daily cleanup of Bull repeat keys (at 2 AM)
  await sealQueue.add(
    "cleanup-repeat-keys",
    {},
    {
      repeat: { cron: "0 2 * * *" },
      jobId: "bull-repeat-keys-cleanup",
    }
  );
}

if (require.main === module) {
  setupJobs().then(() => {
    console.log("Jobs setup complete");
    process.exit(0);
  });
}

module.exports = {
  setupJobs,
};
