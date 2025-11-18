const { log } = require("@/utils/logger");

/**
 * Sleep/delay utility
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Number} maxRetries - Maximum number of retries (default: 3)
 * @param {Number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise<any>} Result of function
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isSocketError =
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.message?.includes("socket hang up");

      if (attempt < maxRetries && isSocketError) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        log.warn(
          `Attempt ${attempt} failed with socket error. Retrying in ${delay}ms...`,
          {
            error: error.message,
            code: error.code,
          }
        );
        await sleep(delay);
      } else if (attempt === maxRetries) {
        log.error(`All ${maxRetries} retry attempts failed`, lastError);
        throw lastError;
      } else {
        // Non-socket error, throw immediately
        throw error;
      }
    }
  }

  throw lastError;
};

/**
 * Fetch data in batches with pagination, retry mechanism, and delay between batches
 * @param {Function} fetchFunction - Function to fetch data (should accept { limit, offset })
 * @param {Object} options - Options
 * @param {Number} options.batchSize - Records per batch (default: 500)
 * @param {Number} options.initialLimit - Initial fetch limit to get total (default: 10)
 * @param {Number} options.delayBetweenBatches - Delay in ms between batches (default: 500)
 * @param {Number} options.maxRetries - Max retries per batch (default: 3)
 * @param {Object} options.additionalParams - Additional params for fetchFunction
 * @returns {Promise<Array>} All fetched data
 */
const fetchAllBatches = async (fetchFunction, options = {}) => {
  const {
    batchSize = 500,
    initialLimit = 10,
    delayBetweenBatches = 500,
    maxRetries = 3,
    additionalParams = {},
    onProgress = null, // Callback untuk progress update
  } = options;

  try {
    // Get initial data to determine total records with retry
    log.info("Fetching initial data to determine total records");
    const initialData = await retryWithBackoff(
      () =>
        fetchFunction({
          limit: initialLimit,
          offset: 0,
          ...additionalParams,
        }),
      maxRetries
    );

    const total = initialData?.meta?.total || 0;
    log.info(`Total records to fetch: ${total}`);

    if (total === 0) {
      log.warn("No data to fetch");
      return [];
    }

    // Fetch all batches
    let allResults = [];
    let page = 1;
    log.info(
      `Starting to fetch data in batches (limit: ${batchSize}, delay: ${delayBetweenBatches}ms)`
    );

    for (let offset = 0; offset < total; offset += batchSize) {
      log.info(
        `Fetching batch: offset ${offset}, limit ${batchSize}, page ${page}`
      );

      // Call progress callback before fetching
      if (onProgress) {
        onProgress({
          offset,
          limit: batchSize,
          page,
          currentTotal: allResults.length,
          expectedTotal: total,
        });
      }

      // Add delay between batches (except for the first one)
      if (offset > 0 && delayBetweenBatches > 0) {
        await sleep(delayBetweenBatches);
      }

      // Fetch with retry mechanism
      const data = await retryWithBackoff(
        () =>
          fetchFunction({
            limit: batchSize,
            offset,
            ...additionalParams,
          }),
        maxRetries
      );

      const result = data?.data || [];
      allResults = allResults.concat(result);

      log.info(
        `Batch fetched: ${result.length} records, total so far: ${
          allResults.length
        }, next offset: ${offset + batchSize}`
      );

      page++;
    }

    log.info(`All batches fetched successfully: ${allResults.length} records`);
    return allResults;
  } catch (error) {
    log.error("Error fetching batches:", error);
    throw error;
  }
};

/**
 * Fetch data in batches WITHOUT meta.total (fetch until empty array)
 * Used for APIs that don't return total count
 * @param {Function} fetchFunction - Function to fetch data (should accept { limit, offset })
 * @param {Object} options - Options
 * @param {Number} options.batchSize - Records per batch (default: 100)
 * @param {Number} options.delayBetweenBatches - Delay in ms between batches (default: 500)
 * @param {Number} options.maxRetries - Max retries per batch (default: 3)
 * @param {String} options.dataKey - Key to access data array in response (default: "results")
 * @param {Boolean} options.incrementalOffset - If true, offset increments by 1 (0,1,2,3...), if false by batchSize (0,100,200...) (default: false)
 * @param {Object} options.additionalParams - Additional params for fetchFunction
 * @returns {Promise<Array>} All fetched data
 */
const fetchAllBatchesUntilEmpty = async (fetchFunction, options = {}) => {
  const {
    batchSize = 100,
    delayBetweenBatches = 500,
    maxRetries = 3,
    dataKey = "results",
    incrementalOffset = false,
    additionalParams = {},
  } = options;

  try {
    let allResults = [];
    let offset = 0;
    let hasMore = true;
    let page = 0; // For incremental offset mode

    const offsetMode = incrementalOffset
      ? "incremental (0,1,2,3...)"
      : "batch (0,100,200...)";
    log.info(
      `Starting to fetch data in batches until empty (limit: ${batchSize}, delay: ${delayBetweenBatches}ms, offset mode: ${offsetMode})`
    );

    while (hasMore) {
      log.info(
        `Fetching batch: offset ${offset}, limit ${batchSize}, page ${page}`
      );

      // Add delay between batches (except for the first one)
      if (page > 0 && delayBetweenBatches > 0) {
        await sleep(delayBetweenBatches);
      }

      // Fetch with retry mechanism
      const data = await retryWithBackoff(
        () =>
          fetchFunction({
            limit: batchSize,
            offset,
            ...additionalParams,
          }),
        maxRetries
      );

      const result = data?.[dataKey] || [];

      // Check if we got data
      if (!result || result.length === 0) {
        log.info("No more data to fetch (empty array received)");
        hasMore = false;
        break;
      }

      allResults = allResults.concat(result);

      // Increment offset based on mode
      if (incrementalOffset) {
        // Incremental: 0, 1, 2, 3, 4...
        offset += 1;
      } else {
        // Batch: 0, 100, 200, 300...
        offset += batchSize;
      }
      page += 1;

      log.info(
        `Batch fetched: ${result.length} records, total so far: ${allResults.length}, next offset: ${offset}`
      );
    }

    log.info(
      `All batches fetched successfully: ${allResults.length} records (fetched until empty, ${page} pages)`
    );
    return allResults;
  } catch (error) {
    log.error("Error fetching batches until empty:", error);
    throw error;
  }
};

module.exports = {
  fetchAllBatches,
  fetchAllBatchesUntilEmpty,
  retryWithBackoff,
  sleep,
};
