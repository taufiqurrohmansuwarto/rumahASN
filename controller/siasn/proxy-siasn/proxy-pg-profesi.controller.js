const { handleError } = require("@/utils/helper/controller-helper");
const { getPeremajaanProfesiProxy } = require("@/utils/siasn-local-proxy.utils");
const PgProfesiProxy = require("@/models/siasn-proxy/pg-profesi-proxy.model");
const { log } = require("@/utils/logger");

// Import SIASN Proxy Utilities
const {
  BATCH_INSERT_SIZE,
  TABLES,
  PROXY_SCHEMA,
} = require("@/utils/siasn-proxy/constants");
const {
  transformPgProfesiData,
} = require("@/utils/siasn-proxy/transformers/pg-profesi-transformer");
const {
  removeDuplicates,
} = require("@/utils/siasn-proxy/validators/duplicate-validator");
const {
  fetchAllBatchesUntilEmpty,
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
  applyProxyPgProfesiFilters,
} = require("@/utils/siasn-proxy/query-builders/pg-profesi-relation-builder");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

const syncProxyPgProfesi = async (req, res) => {
  try {
    const { token } = req;
    const knex = PgProfesiProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PG_PROFESI}`;

    log.info("Starting proxy pg_profesi synchronization");

    // Clear existing data
    await clearTable(knex, tableName);

    // Fetch all data in batches until empty array
    // Note: This API doesn't return meta.total, so we fetch until empty
    // Note: This API uses incremental offset (0,1,2,3...) not batch offset (0,100,200...)
    const allResults = await fetchAllBatchesUntilEmpty(
      (params) => getPeremajaanProfesiProxy(token, params),
      {
        batchSize: 100, // Fetch 100 records per request
        delayBetweenBatches: 500,
        maxRetries: 3,
        dataKey: "results", // Response key for data array
        incrementalOffset: true, // Important! Offset is 0,1,2,3... not 0,100,200...
      }
    );

    // Transform data
    const transformedData = transformPgProfesiData(allResults);

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
      `Proxy pg_profesi synchronization completed. Inserted: ${insertStats.inserted}`
    );

    res.json({
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    });
  } catch (error) {
    log.error("Error during proxy pg_profesi synchronization", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProxyPgProfesi = async (req, res) => {
  try {
    const { page, limit, ...filters } = req?.query;

    // Get OPD ID from user (authorization)
    const opdId = getOpdIdFromUser(req?.user);

    log.info("Fetching proxy pg_profesi data", {
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
    let query = PgProfesiProxy.query();
    query = applyProxyPgProfesiFilters(query, filters, opdId);

    // Order by periode_id DESC (NULL last), then by tgl_usulan DESC
    query = query.orderByRaw(
      "siasn_proxy.proxy_pg_profesi.periode_id DESC NULLS LAST, siasn_proxy.proxy_pg_profesi.tgl_usulan DESC"
    );

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

      log.info(`All proxy pg_profesi data fetched: ${allData.length} records`);
    } else {
      // Execute paginated query
      result = await query.page(pageNum - 1, limitNum);

      responseData = {
        success: true,
        data: result.results,
        pagination: buildPaginationResponse(result, pageNum, limitNum),
      };

      log.info(
        `Proxy pg_profesi data fetched successfully: ${result.results.length} records`
      );
    }

    res.json(responseData);
  } catch (error) {
    log.error("Error fetching proxy pg_profesi data", error);
    handleError(res, error);
  }
};

module.exports = {
  syncProxyPgProfesi,
  getProxyPgProfesi,
};

