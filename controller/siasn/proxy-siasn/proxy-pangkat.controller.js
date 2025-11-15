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

const syncProxyPangkat = async (req, res) => {
  try {
    const { token } = req;
    const knex = PangkatProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PANGKAT}`;

    log.info("Starting proxy pangkat synchronization");

    // Clear existing data
    await clearTable(knex, tableName);

    // Fetch all data in batches
    const allResults = await fetchAllBatches(
      (params) => getKenaikanPangkatProxy(token, params),
      {
        batchSize: BATCH_FETCH_LIMIT,
        initialLimit: INITIAL_FETCH_LIMIT,
      }
    );

    // Transform data
    const transformedData = transformPangkatData(allResults);

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
      `Proxy pangkat synchronization completed. Inserted: ${insertStats.inserted}`
    );

    res.json({
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    });
  } catch (error) {
    log.error("Error during proxy pangkat synchronization", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
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

module.exports = {
  syncProxyPangkat,
  getProxyPangkat,
};
