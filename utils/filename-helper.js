/**
 * Utility functions for filename handling and sanitization
 */

/**
 * Sanitize filename to be safe for URLs and file systems
 * @param {string} filename - Original filename
 * @param {object} options - Sanitization options
 * @param {boolean} options.preserveExtension - Keep file extension (default: true)
 * @param {string} options.replacement - Character to replace invalid chars (default: "_")
 * @param {number} options.maxLength - Maximum filename length (default: 255)
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename, options = {}) => {
  const {
    preserveExtension = true,
    replacement = "_",
    maxLength = 255
  } = options;

  if (!filename || typeof filename !== "string") {
    return "untitled";
  }

  let sanitized = filename;
  let extension = "";

  // Extract extension if preserveExtension is true
  if (preserveExtension) {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex > 0) {
      extension = filename.substring(lastDotIndex);
      sanitized = filename.substring(0, lastDotIndex);
    }
  }

  // Sanitization steps
  sanitized = sanitized
    .replace(/\s+/g, replacement) // Replace spaces with replacement character
    .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, underscores, hyphens
    .replace(new RegExp(`${replacement.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}{2,}`, "g"), replacement) // Replace multiple replacement chars with single one
    .replace(/^[._-]+|[._-]+$/g, ""); // Remove leading/trailing dots, underscores, hyphens

  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = "untitled";
  }

  // Add extension back
  const finalFilename = sanitized + extension;

  // Truncate if too long
  if (finalFilename.length > maxLength) {
    const truncateLength = maxLength - extension.length;
    sanitized = sanitized.substring(0, Math.max(1, truncateLength));
    return sanitized + extension;
  }

  return finalFilename;
};

/**
 * Generate unique filename with timestamp prefix
 * @param {string} originalFilename - Original filename
 * @param {object} options - Generation options
 * @param {string} options.prefix - Custom prefix (default: timestamp)
 * @param {string} options.separator - Separator between prefix and filename (default: "_")
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalFilename, options = {}) => {
  const {
    prefix = new Date().getTime().toString(),
    separator = "_"
  } = options;

  const sanitizedFilename = sanitizeFilename(originalFilename);
  return `${prefix}${separator}${sanitizedFilename}`;
};

/**
 * Generate full file path for media uploads
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID for folder structure
 * @param {object} options - Path generation options
 * @param {string} options.baseFolder - Base folder name (default: "knowledge-media")
 * @param {boolean} options.useEncryptedUserId - Use encrypted user ID (default: true)
 * @param {function} options.encryptUserIdFn - Function to encrypt user ID
 * @returns {string} Full file path
 */
const generateMediaFilePath = (originalFilename, userId, options = {}) => {
  const {
    baseFolder = "knowledge-media",
    useEncryptedUserId = true,
    encryptUserIdFn = null
  } = options;

  let folderUserId = userId;
  if (useEncryptedUserId && encryptUserIdFn) {
    folderUserId = encryptUserIdFn(userId);
  }

  const uniqueFilename = generateUniqueFilename(originalFilename);
  return `${baseFolder}/${folderUserId}/${uniqueFilename}`;
};

/**
 * Generate temporary media file path
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID for folder structure
 * @param {function} encryptUserIdFn - Function to encrypt user ID
 * @returns {string} Temporary file path
 */
const generateTempMediaFilePath = (originalFilename, userId, encryptUserIdFn) => {
  return generateMediaFilePath(originalFilename, userId, {
    baseFolder: "knowledge-media-temp",
    useEncryptedUserId: true,
    encryptUserIdFn
  });
};

/**
 * Generate permanent media file path
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID for folder structure
 * @param {function} encryptUserIdFn - Function to encrypt user ID
 * @param {boolean} isAdmin - Whether this is admin upload
 * @returns {string} Permanent file path
 */
const generatePermanentMediaFilePath = (originalFilename, userId, encryptUserIdFn, isAdmin = false) => {
  const finalUserId = isAdmin ? `admin_${userId}` : userId;
  return generateMediaFilePath(originalFilename, finalUserId, {
    baseFolder: "knowledge-media",
    useEncryptedUserId: true,
    encryptUserIdFn
  });
};

module.exports = {
  sanitizeFilename,
  generateUniqueFilename,
  generateMediaFilePath,
  generateTempMediaFilePath,
  generatePermanentMediaFilePath
};