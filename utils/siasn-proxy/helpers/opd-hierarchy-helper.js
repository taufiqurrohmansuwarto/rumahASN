/**
 * Helper untuk handle hierarchical OPD access
 *
 * Example OPD hierarchy:
 * - "1" = Root/Admin (all access)
 * - "123" = Parent OPD
 *   - "1234" = Child OPD level 1
 *   - "12345" = Child OPD level 2
 *   - "123456" = Child OPD level 3
 *
 * User dengan organization_id "123" dapat mengakses:
 * - "123" (exact)
 * - "1234", "1235", "1236", etc (children)
 * - "12345", "123456", etc (grandchildren)
 *
 * Menggunakan SQL ILIKE pattern (PostgreSQL): '123%'
 */

/**
 * Check if opdId is root/admin
 * @param {String} opdId - OPD ID
 * @returns {Boolean}
 */
const isRootOpd = (opdId) => {
  return opdId === "1" || opdId === 1;
};

/**
 * Check if childOpdId is under parentOpdId hierarchy
 * @param {String} parentOpdId - Parent OPD ID
 * @param {String} childOpdId - Child OPD ID to check
 * @returns {Boolean}
 */
const isChildOpd = (parentOpdId, childOpdId) => {
  if (!parentOpdId || !childOpdId) {
    return false;
  }

  // Root OPD has access to all
  if (isRootOpd(parentOpdId)) {
    return true;
  }

  // Check if child starts with parent
  return String(childOpdId).startsWith(String(parentOpdId));
};

/**
 * Get OPD level based on ID length
 * Assuming: longer ID = deeper level
 * @param {String} opdId - OPD ID
 * @returns {Number} Level (1 = root, 2+ = deeper)
 */
const getOpdLevel = (opdId) => {
  if (!opdId) {
    return 0;
  }

  if (isRootOpd(opdId)) {
    return 1;
  }

  return String(opdId).length;
};

/**
 * Get parent OPD ID
 * @param {String} opdId - Current OPD ID
 * @returns {String|null} Parent OPD ID or null if root
 */
const getParentOpdId = (opdId) => {
  if (!opdId || isRootOpd(opdId)) {
    return null;
  }

  const opdStr = String(opdId);

  // Remove last character to get parent
  if (opdStr.length > 1) {
    return opdStr.substring(0, opdStr.length - 1);
  }

  return "1"; // Root
};

/**
 * Generate ILIKE pattern for SQL query (PostgreSQL case-insensitive)
 * @param {String} opdId - OPD ID
 * @returns {String} ILIKE pattern (e.g., "123%")
 */
const getOpdLikePattern = (opdId) => {
  if (!opdId || isRootOpd(opdId)) {
    return "%"; // Match all
  }

  return `${opdId}%`;
};

module.exports = {
  isRootOpd,
  isChildOpd,
  getOpdLevel,
  getParentOpdId,
  getOpdLikePattern,
};
