// encryption.js
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

// Validate key
const validateKey = (key) => {
  if (key.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (64 hex chars)");
  }
  return key;
};

// Pure function: Encrypt
const encrypt = (text) => {
  if (!text) return null;

  const key = validateKey(KEY);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted
  return [iv.toString("hex"), authTag.toString("hex"), encrypted].join(":");
};

// Pure function: Decrypt
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const key = validateKey(KEY);
  const [ivHex, authTagHex, encrypted] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// Utility: Generate key
const generateKey = () => crypto.randomBytes(32).toString("hex");

module.exports = {
  encrypt,
  decrypt,
  generateKey,
};
