/**
 * Utilities untuk handle duplicate data
 */

/**
 * Remove duplicate items by ID
 * @param {Array} data - Array of objects with id field
 * @param {String} idField - Field name to check for duplicates (default: 'id')
 * @returns {Object} { uniqueData, stats }
 */
const removeDuplicates = (data, idField = "id") => {
  if (!Array.isArray(data)) {
    return { uniqueData: [], stats: { total: 0, unique: 0, duplicates: 0 } };
  }

  const uniqueData = data.filter(
    (item, index, self) =>
      item[idField] &&
      index === self.findIndex((t) => t[idField] === item[idField])
  );

  const stats = {
    total: data.length,
    unique: uniqueData.length,
    duplicates: data.length - uniqueData.length,
    nullIds: data.filter((item) => !item[idField]).length,
  };

  return { uniqueData, stats };
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
