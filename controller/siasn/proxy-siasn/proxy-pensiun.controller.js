const { handleError } = require("@/utils/helper/controller-helper");
const { getPemberhentianProxy } = require("@/utils/siasn-local-proxy.utils");
const PensiunProxy = require("@/models/siasn-proxy/pensiun-proxy.model");
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
  transformPensiunData,
} = require("@/utils/siasn-proxy/transformers/pensiun-transformer");
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
  applyProxyPensiunFilters,
} = require("@/utils/siasn-proxy/query-builders/pensiun-relation-builder");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

const syncProxyPensiun = async (req, res) => {
  try {
    const { token } = req;
    const knex = PensiunProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PENSIUN}`;

    log.info("Starting proxy pensiun synchronization");

    // Clear existing data
    await clearTable(knex, tableName);

    // Fetch all data in batches
    // Note: Using smaller batch size and longer delay for pemberhentian API
    // due to socket hang up issues
    const allResults = await fetchAllBatches(
      (params) => getPemberhentianProxy(token, params),
      {
        batchSize: 100, // Smaller batch size to avoid socket hang up
        initialLimit: INITIAL_FETCH_LIMIT,
        delayBetweenBatches: 1000, // 1 second delay between batches
        maxRetries: 5, // More retries for unstable API
      }
    );

    // Transform data
    const transformedData = transformPensiunData(allResults);

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
      `Proxy pensiun synchronization completed. Inserted: ${insertStats.inserted}`
    );

    res.json({
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    });
  } catch (error) {
    log.error("Error during proxy pensiun synchronization", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProxyPensiun = async (req, res) => {
  try {
    const { page, limit, ...filters } = req?.query;

    // Get OPD ID from user (authorization)
    const opdId = getOpdIdFromUser(req?.user);

    log.info("Fetching proxy pensiun data", {
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
    let query = PensiunProxy.query();
    query = applyProxyPensiunFilters(query, filters, opdId);

    // Order by
    query = query.orderBy("siasn_proxy.proxy_pensiun.tgl_usulan", "desc");

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

      log.info(`All proxy pensiun data fetched: ${allData.length} records`);
    } else {
      // Execute paginated query
      result = await query.page(pageNum - 1, limitNum);

      responseData = {
        success: true,
        data: result.results,
        pagination: buildPaginationResponse(result, pageNum, limitNum),
      };

      log.info(
        `Proxy pensiun data fetched successfully: ${result.results.length} records`
      );
    }

    res.json(responseData);
  } catch (error) {
    log.error("Error fetching proxy pensiun data", error);
    handleError(res, error);
  }
};

module.exports = {
  syncProxyPensiun,
  getProxyPensiun,
};
