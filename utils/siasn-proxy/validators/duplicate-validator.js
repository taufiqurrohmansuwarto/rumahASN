/**
 * Utilities untuk handle duplicate data
 */

const { log } = require("@/utils/logger");
const { nanoid } = require("nanoid");

/**
 * Remove duplicate items by ID - Generate nanoid untuk duplicates
 * @param {Array} data - Array of objects with id field
 * @param {String} idField - Field name to check for duplicates (default: 'id')
 * @returns {Object} { uniqueData, stats }
 */
const removeDuplicates = (data, idField = "id") => {
  if (!Array.isArray(data)) {
    return { uniqueData: [], stats: { total: 0, unique: 0, duplicates: 0 } };
  }

  // Track IDs yang sudah muncul
  const seenIds = new Set();
  const duplicateDetails = [];
  let duplicateCount = 0;
  let nullIdCount = 0;

  // Process setiap item dan generate nanoid untuk duplicate
  const processedData = data.map((item, index) => {
    const originalId = item[idField];

    // Handle null ID
    if (!originalId) {
      nullIdCount++;
      // Generate nanoid untuk null ID juga
      const newId = nanoid();
      log.warn(
        `[DEDUP] Record tanpa ID ditemukan (index: ${index}): NIP=${
          item.nip
        }, Nama=${item.nama} - Generated ID: ${newId.substring(0, 8)}...`
      );
      return {
        ...item,
        [idField]: newId,
      };
    }

    // Check duplicate
    if (seenIds.has(originalId)) {
      // Duplicate! Generate nanoid baru
      const newId = nanoid();
      duplicateCount++;

      duplicateDetails.push({
        originalId: originalId.substring(0, 8) + "...",
        newId: newId.substring(0, 8) + "...",
        nip: item.nip,
        nama: item.nama,
        index,
      });

      log.warn(
        `[DEDUP] Duplicate ID found (index: ${index}): ${item.nama} (${
          item.nip
        }) - Original ID: ${originalId.substring(
          0,
          8
        )}... -> New ID: ${newId.substring(0, 8)}...`
      );

      return {
        ...item,
        [idField]: newId,
      };
    }

    // ID unique, tambahkan ke set
    seenIds.add(originalId);
    return item;
  });

  // Summary log
  if (duplicateCount > 0) {
    log.warn(
      `[DEDUP] Total ${duplicateCount} duplicate IDs replaced with nanoid`
    );
    log.warn(`[DEDUP] Sample duplicates (first 5):`);
    duplicateDetails.slice(0, 5).forEach((dup) => {
      log.warn(
        `  ${dup.nama} (${dup.nip}) - ${dup.originalId} -> ${dup.newId}`
      );
    });
    if (duplicateDetails.length > 5) {
      log.warn(`  ... and ${duplicateDetails.length - 5} more`);
    }
  }

  if (nullIdCount > 0) {
    log.warn(`[DEDUP] Total ${nullIdCount} null IDs replaced with nanoid`);
  }

  const stats = {
    total: data.length,
    unique: processedData.length, // Semua data di-keep
    duplicates: duplicateCount,
    nullIds: nullIdCount,
    duplicateDetails,
  };

  return { uniqueData: processedData, stats };
};

/**
 * Check if data has duplicates
 * @param {Array} data - Array of objects
 * @param {String} idField - Field name to check
 * @returns {Boolean}
 */
const hasDuplicates = (data, idField = "id") => {
  const ids = data.map((item) => item[idField]).filter(Boolean);
  return new Set(ids).size !== ids.length;
};

/**
 * Get duplicate items
 * @param {Array} data - Array of objects
 * @param {String} idField - Field name to check
 * @returns {Array} Array of duplicate items
 */
const getDuplicates = (data, idField = "id") => {
  const seen = new Set();
  const duplicates = [];

  data.forEach((item) => {
    if (item[idField]) {
      if (seen.has(item[idField])) {
        duplicates.push(item);
      } else {
        seen.add(item[idField]);
      }
    }
  });

  return duplicates;
};

module.exports = {
  removeDuplicates,
  hasDuplicates,
  getDuplicates,
};
