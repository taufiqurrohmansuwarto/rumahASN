/**
 * Import proxy controller sync functions
 * Pattern untuk semua proxy types
 */
const {
  syncProxyPangkat,
} = require("@/controller/siasn/proxy-siasn/proxy-pangkat.controller");

const {
  syncProxyPensiun,
} = require("@/controller/siasn/proxy-siasn/proxy-pensiun.controller");

const {
  syncProxyPgAkademik,
} = require("@/controller/siasn/proxy-siasn/proxy-pg-akademik.controller");

const {
  syncProxyPgProfesi,
} = require("@/controller/siasn/proxy-siasn/proxy-pg-profesi.controller");

const {
  syncProxySkk,
} = require("@/controller/siasn/proxy-siasn/proxy-skk.controller");

/**
 * Map proxy types to sync functions
 * Pattern: Semua proxy sync handler
 */
const PROXY_SYNC_HANDLERS = {
  pangkat: syncProxyPangkat,
  pensiun: syncProxyPensiun,
  pg_akademik: syncProxyPgAkademik,
  pg_profesi: syncProxyPgProfesi,
  skk: syncProxySkk,
};

/**
 * Process proxy sync job (Generic untuk semua types)
 * @param {Object} job - Bull job object
 * @returns {Promise<Object>} Sync result
 */
const processProxySync = async (job) => {
  const { type, token, requestedBy } = job.data;

  console.log(
    `📋 [PROXY PROCESSOR] Received job ${job.id} (type: ${type}, user: ${requestedBy?.username})`
  );

  // Validate type
  if (!PROXY_SYNC_HANDLERS[type]) {
    const availableTypes = Object.keys(PROXY_SYNC_HANDLERS).join(", ");
    console.error(
      `❌ [PROXY PROCESSOR] Unknown type: ${type}. Available: ${availableTypes}`
    );
    throw new Error(
      `Unknown proxy type: ${type}. Available: ${availableTypes}`
    );
  }

  try {
    let result = null;

    // Mock req/res untuk controller function
    const mockReq = {
      token,
      user: requestedBy,
    };

    const mockRes = {
      json: (data) => {
        result = data;
      },
      status: (code) => ({
        json: (data) => {
          result = { ...data, statusCode: code };
        },
      }),
    };

    // Call appropriate sync handler with job parameter
    const syncHandler = PROXY_SYNC_HANDLERS[type];
    await syncHandler(mockReq, mockRes, job);

    console.log(
      `✅ [PROXY PROCESSOR] Completed ${type} sync job ${job.id} | Total: ${result?.total}, Inserted: ${result?.inserted}, Duplicates: ${result?.duplicates_removed}`
    );

    return result;
  } catch (error) {
    console.error(
      `❌ [PROXY PROCESSOR] Failed ${type} sync job ${job.id}:`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  processProxySync,
};
