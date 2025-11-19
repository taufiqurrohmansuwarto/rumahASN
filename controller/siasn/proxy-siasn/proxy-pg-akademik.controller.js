const { handleError } = require("@/utils/helper/controller-helper");
const { getPeremajaanGelarProxy } = require("@/utils/siasn-local-proxy.utils");
const PgAkademikProxy = require("@/models/siasn-proxy/pg-akademik-proxy.model");
const { log } = require("@/utils/logger");

// Import SIASN Proxy Utilities
const {
  BATCH_INSERT_SIZE,
  TABLES,
  PROXY_SCHEMA,
} = require("@/utils/siasn-proxy/constants");
const {
  transformPgAkademikData,
} = require("@/utils/siasn-proxy/transformers/pg-akademik-transformer");
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
  applyProxyPgAkademikFilters,
} = require("@/utils/siasn-proxy/query-builders/proxy-relation-builder");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

const syncProxyPgAkademik = async (req, res) => {
  try {
    const { token } = req;
    const knex = PgAkademikProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PG_AKADEMIK}`;

    log.info("Starting proxy pg_akademik synchronization");

    // Clear existing data
    await clearTable(knex, tableName);

    // Fetch all data in batches until empty array
    // Note: This API doesn't return meta.total, so we fetch until empty
    // Note: This API uses incremental offset (0,1,2,3...) not batch offset (0,100,200...)
    const allResults = await fetchAllBatchesUntilEmpty(
      (params) => getPeremajaanGelarProxy(token, params),
      {
        batchSize: 100, // Fetch 100 records per request
        delayBetweenBatches: 500,
        maxRetries: 3,
        dataKey: "results", // Response key for data array
        incrementalOffset: true, // Important! Offset is 0,1,2,3... not 0,100,200...
      }
    );

    // Transform data
    const transformedData = transformPgAkademikData(allResults);

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
      `Proxy pg_akademik synchronization completed. Inserted: ${insertStats.inserted}`
    );

    res.json({
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    });
  } catch (error) {
    log.error("Error during proxy pg_akademik synchronization", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getProxyPgAkademik = async (req, res) => {
  try {
    const { page, limit, ...filters } = req?.query;

    // Get OPD ID from user (authorization)
    const opdId = getOpdIdFromUser(req?.user);

    log.info("Fetching proxy pg_akademik data", {
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
    let query = PgAkademikProxy.query();
    query = applyProxyPgAkademikFilters(query, filters, opdId);

    // Order by periode_id DESC (NULL last), then by tgl_usulan DESC
    query = query.orderByRaw(
      "siasn_proxy.proxy_pg_akademik.periode_id DESC NULLS LAST, siasn_proxy.proxy_pg_akademik.tgl_usulan DESC"
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

      log.info(`All proxy pg_akademik data fetched: ${allData.length} records`);
    } else {
      // Execute paginated query
      result = await query.page(pageNum - 1, limitNum);

      responseData = {
        success: true,
        data: result.results,
        pagination: buildPaginationResponse(result, pageNum, limitNum),
      };

      log.info(
        `Proxy pg_akademik data fetched successfully: ${result.results.length} records`
      );
    }

    res.json(responseData);
  } catch (error) {
    log.error("Error fetching proxy pg_akademik data", error);
    handleError(res, error);
  }
};

// Queue handlers (reuse generic pattern)
const {
  handleSyncQueue,
  handleGetStatus,
} = require("@/utils/proxy-queue-helper");

const syncProxyPgAkademikQueue = (req, res) => {
  return handleSyncQueue("pg_akademik", req, res);
};

const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxyPgAkademik,
  getProxyPgAkademik,
  syncProxyPgAkademikQueue,
  getProxySyncStatus,
};

