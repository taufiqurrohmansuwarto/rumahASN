// utils/load-env.js
const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  const env = process.env.NODE_ENV || "development";
  const basePath = path.resolve(__dirname, `../../.env.local`);
  const envPath = path.resolve(__dirname, `../../.env.${env}.local`);

  dotenv.config({ path: basePath });
  dotenv.config({ path: envPath });

  console.log(`✅ Loaded .env and .env.${env}`);
}

module.exports = { loadEnv };
