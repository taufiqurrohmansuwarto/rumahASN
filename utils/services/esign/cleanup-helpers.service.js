/**
 * Cleanup Helper Functions
 * Helper functions untuk cleanup operations (file deletion, rollback, etc)
 */

// Development logging helper
const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devLog(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devError(...args);
  }
};

/**
 * Validate file path untuk cleanup
 * Safety check untuk prevent accidental deletion
 * @param {String} filePath - File path to validate
 * @returns {Boolean} - True if valid and safe to delete
 */
const isValidCleanupPath = (filePath) => {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  // Check tidak empty
  if (filePath.trim() === "") {
    return false;
  }

  // Check harus dimulai dengan esign/
  if (!filePath.startsWith("esign/")) {
    return false;
  }

  // Additional safety: tidak boleh ada path traversal
  if (filePath.includes("..") || filePath.includes("//")) {
    return false;
  }

  return true;
};

/**
 * Cleanup uploaded file dari Minio (safe deletion)
 * @param {Object} mc - Minio client
 * @param {String} filePath - File path to delete
 * @returns {Promise<Boolean>} - True if deleted, false if skipped
 */
export const cleanupUploadedFile = async (mc, filePath) => {
  if (!mc) {
    devError("✗ Cleanup skipped: Minio client not available");
    return false;
  }

  if (!isValidCleanupPath(filePath)) {
    devError(
      "✗ Cleanup skipped: Invalid or unsafe file path:",
      filePath
    );
    return false;
  }

  devLog("   [cleanupUploadedFile] Attempting to cleanup:", filePath);

  try {
    const { deleteFile } = require("@/utils/helper/minio-helper");
    await deleteFile(mc, "public", filePath);
    devLog("   [cleanupUploadedFile] ✓ File deleted successfully");
    return true;
  } catch (error) {
    devError(
      "   [cleanupUploadedFile] ✗ Delete failed (non-critical):",
      error.message
    );
    return false;
  }
};

/**
 * Cleanup multiple uploaded files
 * @param {Object} mc - Minio client
 * @param {Array<String>} filePaths - Array of file paths to delete
 * @returns {Promise<Object>} - Cleanup results {success: number, failed: number}
 */
export const cleanupMultipleFiles = async (mc, filePaths) => {
  if (!mc || !Array.isArray(filePaths) || filePaths.length === 0) {
    return { success: 0, failed: 0 };
  }

  const results = { success: 0, failed: 0 };

  for (const filePath of filePaths) {
    const deleted = await cleanupUploadedFile(mc, filePath);
    if (deleted) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  devLog(
    `   [cleanupMultipleFiles] Results: ${results.success} deleted, ${results.failed} failed`
  );

  return results;
};

/**
 * Rollback transaction dengan logging
 * @param {Object} trx - Transaction object
 * @param {String} context - Context/function name untuk logging
 * @returns {Promise<Boolean>} - True if rolled back successfully
 */
export const rollbackTransaction = async (trx, context = "Unknown") => {
  if (!trx) {
    devError(`   [${context}] ✗ Rollback skipped: No transaction`);
    return false;
  }

  if (trx.isCompleted()) {
    devLog(`   [${context}] Transaction already completed`);
    return false;
  }

  devLog(`   [${context}] Rolling back transaction...`);

  try {
    await trx.rollback();
    devLog(`   [${context}] ✓ Transaction rolled back`);
    return true;
  } catch (rollbackError) {
    devError(
      `   [${context}] ✗ Rollback error:`,
      rollbackError.message
    );
    return false;
  }
};

/**
 * Cleanup handler untuk catch block
 * Melakukan rollback dan cleanup file dalam satu fungsi
 * @param {Object} trx - Transaction object
 * @param {Object} mc - Minio client
 * @param {String|Array<String>} filePaths - File path(s) to cleanup
 * @param {String} context - Context untuk logging
 * @returns {Promise<void>}
 */
export const cleanupOnError = async (trx, mc, filePaths, context = "Error") => {
  devError(`=== ${context.toUpperCase()} - CLEANUP START ===`);

  // 1. Rollback transaction
  await rollbackTransaction(trx, context);

  // 2. Cleanup files
  if (filePaths) {
    if (Array.isArray(filePaths)) {
      await cleanupMultipleFiles(mc, filePaths);
    } else {
      await cleanupUploadedFile(mc, filePaths);
    }
  }

  devError(`=== ${context.toUpperCase()} - CLEANUP DONE ===`);
};
