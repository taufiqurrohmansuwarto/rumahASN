/**
 * Authorization helper untuk SIASN Proxy
 */

/**
 * Get OPD ID berdasarkan user role
 * @param {Object} user - User object dari request
 * @param {String} user.current_role - Role user (admin, operator, etc)
 * @param {String} user.organization_id - SKPD ID user
 * @returns {String} OPD ID untuk filter
 */
const getOpdIdFromUser = (user) => {
  if (!user) {
    return null;
  }

  const { current_role, organization_id } = user;

  // Admin bisa lihat semua data (opd_id = '1' adalah root/all)
  if (current_role === "admin") {
    return "1";
  }

  // Non-admin hanya bisa lihat data OPD mereka
  return organization_id || null;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {Boolean}
 */
const isAdmin = (user) => {
  return user?.current_role === "admin";
};

/**
 * Check if user has access to specific OPD
 * @param {Object} user - User object
 * @param {String} targetOpdId - Target OPD ID to check
 * @returns {Boolean}
 */
const hasOpdAccess = (user, targetOpdId) => {
  if (!user || !targetOpdId) {
    return false;
  }

  // Admin has access to all OPDs
  if (isAdmin(user)) {
    return true;
  }

  // Check if user's OPD matches target OPD
  return user.organization_id === targetOpdId;
};

module.exports = {
  getOpdIdFromUser,
  isAdmin,
  hasOpdAccess,
};
