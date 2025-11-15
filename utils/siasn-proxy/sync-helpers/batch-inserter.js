const { log } = require("@/utils/logger");

/**
 * Insert data in batches
 * @param {Object} knex - Knex instance
 * @param {String} tableName - Full table name
 * @param {Array} data - Data to insert
 * @param {Object} options - Options
 * @param {Number} options.batchSize - Insert batch size (default: 100)
 * @returns {Promise<Object>} Insert stats
 */
const batchInsert = async (knex, tableName, data, options = {}) => {
  const { batchSize = 100 } = options;

  if (!data || data.length === 0) {
    log.warn("No data to insert");
    return { inserted: 0, batches: 0 };
  }

  try {
    log.info(
      `Inserting ${data.length} records into ${tableName} (batch size: ${batchSize})`
    );

    await knex.batchInsert(tableName, data, batchSize);

    log.info(`Data insertion completed successfully`);

    return {
      inserted: data.length,
      batches: Math.ceil(data.length / batchSize),
    };
  } catch (error) {
    log.error(`Error inserting data into ${tableName}:`, error);
    throw error;
  }
};

module.exports = {
  batchInsert,
};
