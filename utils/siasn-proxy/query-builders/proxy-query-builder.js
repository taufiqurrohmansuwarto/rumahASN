/**
 * Generic query builder untuk proxy tables
 */

/**
 * Build query dengan filters
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {Object} filters - Filter object
 * @param {Object} config - Configuration untuk filter mapping
 * @returns {Object} Modified query builder
 */
const applyFilters = (queryBuilder, filters = {}, config = {}) => {
  const {
    textFilters = [], // ['nip', 'nama']
    exactFilters = [], // ['status_usulan', 'jenis_kp_id']
    dateFilters = [], // ['tgl_usulan']
  } = config;

  let query = queryBuilder;

  // Apply text filters (ILIKE)
  textFilters.forEach((field) => {
    if (filters[field]) {
      query = query.where(field, "ilike", `%${filters[field]}%`);
    }
  });

  // Apply exact filters
  exactFilters.forEach((field) => {
    if (filters[field] !== undefined && filters[field] !== null) {
      query = query.where(field, filters[field]);
    }
  });

  // Apply date filters
  dateFilters.forEach((field) => {
    if (filters[`${field}_from`]) {
      query = query.where(field, ">=", filters[`${field}_from`]);
    }
    if (filters[`${field}_to`]) {
      query = query.where(field, "<=", filters[`${field}_to`]);
    }
  });

  return query;
};

/**
 * Build pagination response
 * @param {Object} result - Result from query.page()
 * @param {Number} page - Current page
 * @param {Number} limit - Records per page
 * @returns {Object} Pagination object
 */
const buildPaginationResponse = (result, page, limit) => ({
  page: page,
  limit: limit,
  total: result.total,
  totalPages: Math.ceil(result.total / limit),
  hasNextPage: page < Math.ceil(result.total / limit),
  hasPrevPage: page > 1,
});

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Request query object
 * @param {Object} options - Options
 * @param {Number} options.defaultLimit - Default limit (default: 10)
 * @param {Number} options.maxLimit - Maximum allowed limit (default: 100)
 * @returns {Object} { page, limit, showAll }
 */
const parsePagination = (query = {}, options = {}) => {
  const { defaultLimit = 10, maxLimit = 100 } = options;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limitParam = parseInt(query.limit);

  // Special case: limit = -1 means show all (for download)
  if (limitParam === -1) {
    return { page: 1, limit: -1, showAll: true };
  }

  const limit = Math.min(maxLimit, Math.max(1, limitParam || defaultLimit));

  return { page, limit, showAll: false };
};

module.exports = {
  applyFilters,
  buildPaginationResponse,
  parsePagination,
};
