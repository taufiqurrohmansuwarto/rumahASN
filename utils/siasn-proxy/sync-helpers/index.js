const { fetchAllBatches } = require("./batch-fetcher");
const { clearTable, clearTables } = require("./table-cleaner");
const { batchInsert } = require("./batch-inserter");

module.exports = {
  fetchAllBatches,
  clearTable,
  clearTables,
  batchInsert,
};
