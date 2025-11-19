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
} = require("@/utils/siasn-proxy/query-builders/proxy-relation-builder");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

const syncProxyPensiun = async (req, res, job = null) => {
  const startTime = Date.now();
  try {
    const { token } = req;
    const knex = PensiunProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PENSIUN}`;

    log.info("[PROXY PENSIUN] Starting synchronization");
    if (job) await job.progress(5);

    // Clear existing data
    log.info("[PROXY PENSIUN] Clearing existing data...");
    await clearTable(knex, tableName);
    log.info("[PROXY PENSIUN] Table cleared successfully");
    if (job) await job.progress(10);

    // Fetch all data in batches with progress
    log.info("[PROXY PENSIUN] Starting data fetch...");
    const allResults = await fetchAllBatches(
      (params) => getPemberhentianProxy(token, params),
      {
        batchSize: 100,
        initialLimit: INITIAL_FETCH_LIMIT,
        delayBetweenBatches: 1000,
        maxRetries: 5,
      }
    );
    log.info(
      `[PROXY PENSIUN] Fetch completed! Total: ${allResults.length} records`
    );
    if (job) await job.progress(60);

    // Transform data
    log.info(`[PROXY PENSIUN] Transforming ${allResults.length} records...`);
    const transformedData = transformPensiunData(allResults);
    log.info(
      `[PROXY PENSIUN] Transform completed! ${transformedData.length} records processed`
    );
    if (job) await job.progress(70);

    // Remove duplicates
    log.info(
      `[PROXY PENSIUN] Checking for duplicates in ${transformedData.length} records...`
    );
    const { uniqueData, stats } = removeDuplicates(transformedData);
    log.info(
      `[PROXY PENSIUN] Deduplication completed! Unique: ${stats.unique}, Duplicates: ${stats.duplicates}`
    );
    if (job) await job.progress(80);

    // Batch insert
    log.info(
      `[PROXY PENSIUN] Starting batch insert: ${uniqueData.length} records...`
    );
    const insertStats = await batchInsert(knex, tableName, uniqueData, {
      batchSize: BATCH_INSERT_SIZE,
    });
    log.info(
      `[PROXY PENSIUN] Insert completed! ${insertStats.inserted} records inserted`
    );
    if (job) await job.progress(95);

    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.info("[PROXY PENSIUN] ========================================");
    log.info("[PROXY PENSIUN] ✅ Sync Completed Successfully!");
    log.info(`[PROXY PENSIUN] Total inserted: ${insertStats.inserted} records`);
    log.info(`[PROXY PENSIUN] Total duration: ${totalDuration}s`);
    log.info("[PROXY PENSIUN] ========================================");

    const result = {
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    };

    if (job) await job.progress(100, result);
    return result;
  } catch (error) {
    log.error("[PROXY PENSIUN] ❌ Error syncing data", error);
    if (job)
      await job.progress(100, {
        success: false,
        message: "Gagal sinkronisasi",
        error: error.message,
      });
    throw error;
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

// Queue handlers (reuse generic pattern)
const {
  handleSyncQueue,
  handleGetStatus,
} = require("@/utils/proxy-queue-helper");

const syncProxyPensiunQueue = (req, res) => {
  return handleSyncQueue("pensiun", req, res);
};

const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxyPensiun,
  getProxyPensiun,
  syncProxyPensiunQueue,
  getProxySyncStatus,
};
