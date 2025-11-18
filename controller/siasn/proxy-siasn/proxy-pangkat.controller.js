const { handleError } = require("@/utils/helper/controller-helper");
const { getKenaikanPangkatProxy } = require("@/utils/siasn-local-proxy.utils");
const PangkatProxy = require("@/models/siasn-proxy/pangkat-proxy.model");
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
  transformPangkatData,
} = require("@/utils/siasn-proxy/transformers/pangkat-transformer");
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
  applyProxyPangkatFilters,
} = require("@/utils/siasn-proxy/query-builders");
const { getOpdIdFromUser } = require("@/utils/siasn-proxy/helpers");

// Import Queue Helper
const {
  handleSyncQueue,
  handleGetStatus,
} = require("@/utils/proxy-queue-helper");

const syncProxyPangkat = async (req, res, job = null) => {
  const startTime = Date.now();
  try {
    const { token } = req;
    const knex = PangkatProxy.knex();

    log.info(`[PROXY PANGKAT] ========================================`);
    log.info(`[PROXY PANGKAT] Starting Sync`);
    log.info(`[PROXY PANGKAT] ========================================`);
    const tableName = `${PROXY_SCHEMA}.${TABLES.PANGKAT}`;

    // Update progress: 5% - Starting
    if (job) await job.progress(5);

    // Clear existing data
    log.info(`[PROXY PANGKAT] Clearing existing data...`);
    await clearTable(knex, tableName);
    log.info(`[PROXY PANGKAT] Table cleared successfully`);

    // Update progress: 10% - Table cleared
    if (job) await job.progress(10);

    // Fetch all data in batches with progress callback
    const progressCallback = (batchInfo) => {
      const percentage =
        batchInfo.expectedTotal > 0
          ? Math.round((batchInfo.currentTotal / batchInfo.expectedTotal) * 100)
          : 0;

      const message = `Batch ${batchInfo.page}: offset=${batchInfo.offset}, fetched=${batchInfo.currentTotal}/${batchInfo.expectedTotal} (${percentage}%)`;
      log.info(`[PROXY PANGKAT] ${message}`);

      // Update progress: 10% - 60% during fetching
      if (job) {
        const fetchProgress =
          10 +
          Math.floor(
            (batchInfo.currentTotal /
              (batchInfo.expectedTotal || batchInfo.currentTotal)) *
              50
          );
        job.progress(Math.min(fetchProgress, 60), {
          stage: "fetching",
          message,
          offset: batchInfo.offset,
          currentTotal: batchInfo.currentTotal,
          expectedTotal: batchInfo.expectedTotal,
        });
      }
    };

    log.info(
      `[PROXY PANGKAT] Starting data fetch (batch size: ${BATCH_FETCH_LIMIT})...`
    );
    const allResults = await fetchAllBatches(
      (params) => getKenaikanPangkatProxy(token, params),
      {
        batchSize: BATCH_FETCH_LIMIT,
        initialLimit: INITIAL_FETCH_LIMIT,
        onProgress: progressCallback,
      }
    );
    log.info(
      `[PROXY PANGKAT] Fetch completed! Total: ${allResults.length} records`
    );

    // Update progress: 65% - Fetching completed
    if (job)
      await job.progress(65, {
        stage: "transforming",
        message: "Transforming data...",
      });

    // Transform data
    log.info(`[PROXY PANGKAT] Transforming ${allResults.length} records...`);
    const transformedData = transformPangkatData(allResults);
    log.info(
      `[PROXY PANGKAT] Transform completed! ${transformedData.length} records processed`
    );

    // Update progress: 75% - Transform completed
    if (job)
      await job.progress(75, {
        stage: "deduplicating",
        message: "Removing duplicates...",
      });

    // Remove duplicates
    log.info(
      `[PROXY PANGKAT] Checking for duplicates in ${transformedData.length} records...`
    );
    const { uniqueData, stats } = removeDuplicates(transformedData);
    log.info(
      `[PROXY PANGKAT] Deduplication completed! Unique: ${stats.unique}, Duplicates: ${stats.duplicates}`
    );

    // Update progress: 80% - Deduplication completed
    if (job)
      await job.progress(80, {
        stage: "inserting",
        message: "Inserting data to database...",
      });

    // Batch insert with logging
    log.info(
      `[PROXY PANGKAT] Starting batch insert: ${uniqueData.length} records (batch size: ${BATCH_INSERT_SIZE})...`
    );

    const totalBatches = Math.ceil(uniqueData.length / BATCH_INSERT_SIZE);
    let insertedCount = 0;

    for (let i = 0; i < uniqueData.length; i += BATCH_INSERT_SIZE) {
      const batch = uniqueData.slice(i, i + BATCH_INSERT_SIZE);
      const batchNum = Math.floor(i / BATCH_INSERT_SIZE) + 1;

      const startBatch = Date.now();
      await knex.batchInsert(tableName, batch, BATCH_INSERT_SIZE);
      const batchDuration = Date.now() - startBatch;

      insertedCount += batch.length;
      const percentage = Math.round((insertedCount / uniqueData.length) * 100);

      log.info(
        `[PROXY PANGKAT] Batch ${batchNum}/${totalBatches}: ${batch.length} records in ${batchDuration}ms | Total: ${insertedCount}/${uniqueData.length} (${percentage}%)`
      );

      // Update progress: 80% - 95% during inserting
      if (job) {
        const insertProgress =
          80 + Math.floor((insertedCount / uniqueData.length) * 15);
        await job.progress(insertProgress, {
          stage: "inserting",
          message: `Inserting batch ${batchNum}/${totalBatches}`,
          inserted: insertedCount,
          total: uniqueData.length,
        });
      }
    }

    const insertStats = { inserted: insertedCount };

    // Update progress: 95% - Insert completed
    if (job)
      await job.progress(95, { stage: "finalizing", message: "Finalizing..." });

    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.info(`[PROXY PANGKAT] ========================================`);
    log.info(`[PROXY PANGKAT] ✅ Sync Completed Successfully!`);
    log.info(`[PROXY PANGKAT] Total inserted: ${insertStats.inserted} records`);
    log.info(`[PROXY PANGKAT] Total duration: ${totalDuration}s`);
    log.info(`[PROXY PANGKAT] ========================================`);

    const result = {
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    };

    // Update progress: 100% - Completed
    if (job) await job.progress(100, result);
    return result;
  } catch (error) {
    log.error("[PROXY PANGKAT] ❌ Error syncing data", error);
    if (job)
      await job.progress(100, {
        success: false,
        message: "Gagal sinkronisasi",
        error: error.message,
      });
    throw error;
  }
};

const getProxyPangkat = async (req, res) => {
  try {
    const { page, limit, ...filters } = req?.query;

    // Get OPD ID from user (authorization)
    const opdId = getOpdIdFromUser(req?.user);

    log.info("Fetching proxy pangkat data", {
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
    let query = PangkatProxy.query();
    query = applyProxyPangkatFilters(query, filters, opdId);

    // Order by
    query = query.orderBy("siasn_proxy.proxy_pangkat.tgl_usulan", "desc");

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

      log.info(`All proxy pangkat data fetched: ${allData.length} records`);
    } else {
      // Execute paginated query
      result = await query.page(pageNum - 1, limitNum);

      responseData = {
        success: true,
        data: result.results,
        pagination: buildPaginationResponse(result, pageNum, limitNum),
      };

      log.info(
        `Proxy pangkat data fetched successfully: ${result.results.length} records`
      );
    }

    res.json(responseData);
  } catch (error) {
    log.error("Error fetching proxy pangkat data", error);
    handleError(res, error);
  }
};

/**
 * Queue-based sync (Non-blocking, untuk production)
 * POST /api/siasn/ws/admin/proxy/pangkat/sync
 * Query params: force=true (untuk cleanup & restart)
 */
const syncProxyPangkatQueue = (req, res) => {
  return handleSyncQueue("pangkat", req, res);
};

/**
 * Get sync job status
 * GET /api/siasn/ws/admin/proxy/status?jobId=xxx
 */
const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxyPangkat, // Direct sync (blocking, untuk dev/testing)
  syncProxyPangkatQueue, // Queue sync (non-blocking, untuk production)
  getProxySyncStatus, // Get job status
  getProxyPangkat,
};
