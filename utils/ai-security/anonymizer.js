// anonymizer.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Config
const PEPPER = process.env.ANONYMIZE_PEPPER || "default-secret-change-this";
const SALT_ROUNDS = 12;

// Pure function: SHA-256 hash
const hashDeterministic = (data, pepper = PEPPER) => {
  if (!data) return null;

  return crypto.createHmac("sha256", pepper).update(String(data)).digest("hex");
};

// Async function: Bcrypt hash
const hashSecure = async (data) => {
  if (!data) return null;
  return await bcrypt.hash(String(data), SALT_ROUNDS);
};

// Async function: Verify bcrypt
const verifyHash = async (data, hash) => {
  return await bcrypt.compare(String(data), hash);
};

// Specialized: Hash NIP
const hashNIP = (nip) => {
  if (!nip) return null;
  const hash = hashDeterministic(nip);
  return `H_${hash.substring(0, 16)}`;
};

// Specialized: Hash NIK
const hashNIK = (nik) => {
  if (!nik) return null;
  const hash = hashDeterministic(nik);
  return `NIK_${hash.substring(0, 20)}`;
};

module.exports = {
  hashDeterministic,
  hashSecure,
  verifyHash,
  hashNIP,
  hashNIK,
};
