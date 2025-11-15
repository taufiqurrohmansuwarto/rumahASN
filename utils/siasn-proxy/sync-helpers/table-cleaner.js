const { log } = require("@/utils/logger");

/**
 * Clear table data dengan fallback ke TRUNCATE
 * @param {Object} knex - Knex instance
 * @param {String} tableName - Full table name (e.g., "siasn_proxy.proxy_pangkat")
 * @param {Object} options - Options
 * @param {Boolean} options.restartIdentity - Restart sequence/identity (default: true)
 * @returns {Promise<void>}
 */
const clearTable = async (knex, tableName, options = {}) => {
  const { restartIdentity = true } = options;

  log.info(`Clearing existing data from ${tableName}`);

  try {
    // Try DELETE first
    await knex(tableName).del();
    log.info(`Existing data cleared using DELETE`);
  } catch (deleteError) {
    // Fallback to TRUNCATE if DELETE fails
    log.warn("DELETE failed, trying TRUNCATE:", deleteError.message);

    try {
      const restartClause = restartIdentity ? "RESTART IDENTITY" : "";
      await knex.raw(`TRUNCATE TABLE ${tableName} ${restartClause}`.trim());
      log.info(`Existing data cleared using TRUNCATE`);
    } catch (truncateError) {
      log.error("Both DELETE and TRUNCATE failed:", truncateError);
      throw truncateError;
    }
  }
};

/**
 * Clear multiple tables
 * @param {Object} knex - Knex instance
 * @param {Array} tableNames - Array of table names
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
const clearTables = async (knex, tableNames, options = {}) => {
  for (const tableName of tableNames) {
    await clearTable(knex, tableName, options);
  }
};

module.exports = {
  clearTable,
  clearTables,
};
