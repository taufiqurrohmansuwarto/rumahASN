const { sealQueue } = require("./queue");

const sealProcessor = require("./processors/seal");

sealQueue.process("refresh-totp", sealProcessor.refreshTotp);

console.log("🔄 Worker started and processing jobs...");

// Graceful shutdown
process.on("SIGINT", async () => {
  await Promise.all([sealQueue.close()]);
  process.exit(0);
});
