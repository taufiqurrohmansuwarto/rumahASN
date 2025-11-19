const { handleError } = require("@/utils/helper/controller-helper");
const { getSKKProxy } = require("@/utils/siasn-local-proxy.utils");
const SkkProxy = require("@/models/siasn-proxy/skk-proxy.model");
const { log } = require("@/utils/logger");

// Import SIASN Proxy Utilities
const {
  INITIAL_FETCH_LIMIT,
  BATCH_FETCH_LIMIT,
  BATCH_INSERT_SIZE,
  TABLES,
  PROXY_SCHEMA,
} = require("@/utils/siasn-proxy/constants");
const {
  transformSkkData,
} = require("@/utils/siasn-proxy/transformers/skk-transformer");
const {
  removeDuplicates,
} = require("@/utils/siasn-proxy/validators/duplicate-validator");
const {
  fetchAllBatches,
} = require("@/utils/siasn-proxy/sync-helpers/batch-fetcher");
const {
  clearTable,
} = require("@/utils/siasn-proxy/sync-helpers/table-cleaner");
const {
  batchInsert,
} = require("@/utils/siasn-proxy/sync-helpers/batch-inserter");
const {
  buildPaginationResponse,
  parsePagination,
} = require("@/utils/siasn-proxy/query-builders");
const {
  applyProxySkkFilters,
} = require("@/utils/siasn-proxy/query-builders/proxy-relation-builder");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

const syncProxySkk = async (req, res) => {
  try {
    const { token } = req;
    const knex = SkkProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.SKK}`;

    log.info("Starting proxy skk synchronization");

    // Clear existing data
    await clearTable(knex, tableName);

    // Fetch all data in batches
    const allResults = await fetchAllBatches(
      (params) => getSKKProxy(token, params),
      {
        batchSize: BATCH_FETCH_LIMIT,
        initialLimit: INITIAL_FETCH_LIMIT,
      }
    );

    // Transform data
    const transformedData = transformSkkData(allResults);

    // Remove duplicates
    const { uniqueData, stats } = removeDuplicates(transformedData);
    log.info(
      `Total transformed: ${stats.total}, Unique: ${stats.unique}, Duplicates removed: ${stats.duplicates}`
    );

    // Batch insert
    const insertStats = await batchInsert(knex, tableName, uniqueData, {
      batchSize: BATCH_INSERT_SIZE,
    });

    log.info(
      `Proxy skk synchronization completed. Inserted: ${insertStats.inserted}`
    );

    res.json({
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    });
  } catch (error) {
    log.error("Error during proxy skk synchronization", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProxySkk = async (req, res) => {
  try {
    const { page, limit, ...filters } = req?.query;

    // Get OPD ID from user (authorization)
    const opdId = getOpdIdFromUser(req?.user);

    log.info("Fetching proxy skk data", {
      page,
      limit,
      filters,
      opdId,
      user_role: req?.user?.current_role,
    });

    // Parse pagination
    const {
      page: pageNum,
      limit: limitNum,
      showAll,
    } = parsePagination({ page, limit }, { defaultLimit: 10, maxLimit: 100 });

    // Build query with filters and authorization
    let query = SkkProxy.query();
    query = applyProxySkkFilters(query, filters, opdId);

    // Order by tgl_usulan DESC
    query = query.orderBy("siasn_proxy.proxy_skk.tgl_usulan", "desc");

    let result;
    let responseData;

    if (showAll) {
      // Fetch all data without pagination (for download)
      log.info("Fetching all data (limit = -1, for download)");
      const allData = await query;

      result = allData;
      responseData = {
        success: true,
        data: allData,
        total: allData.length,
        showAll: true,
      };

      log.info(`All proxy skk data fetched: ${allData.length} records`);
    } else {
      // Execute paginated query
      result = await query.page(pageNum - 1, limitNum);

      responseData = {
        success: true,
        data: result.results,
        pagination: buildPaginationResponse(result, pageNum, limitNum),
      };

      log.info(
        `Proxy skk data fetched successfully: ${result.results.length} records`
      );
    }

    res.json(responseData);
  } catch (error) {
    log.error("Error fetching proxy skk data", error);
    handleError(res, error);
  }
};

// Queue handlers (reuse generic pattern)
const {
  handleSyncQueue,
  handleGetStatus,
} = require("@/utils/proxy-queue-helper");

const syncProxySkkQueue = (req, res) => {
  return handleSyncQueue("skk", req, res);
};

const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxySkk,
  getProxySkk,
  syncProxySkkQueue,
  getProxySyncStatus,
};

