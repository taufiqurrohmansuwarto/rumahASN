import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws/admin/proxy",
});

// ==================== SYNC OPERATIONS ====================

/**
 * Sync Proxy Pangkat (Kenaikan Pangkat)
 * @param {boolean} force - Force re-sync (default: false)
 * @returns {Promise} Job info { success, jobId, status, message }
 */
export const syncProxyPangkat = async (force = false) => {
  const url = force ? "/pangkat/sync?force=true" : "/pangkat/sync";
  const { data } = await api.get(url);
  return data;
};

/**
 * Sync Proxy Pensiun (Pemberhentian)
 * @param {boolean} force - Force re-sync (default: false)
 * @returns {Promise} Job info { success, jobId, status, message }
 */
export const syncProxyPensiun = async (force = false) => {
  const url = force ? "/pensiun/sync?force=true" : "/pensiun/sync";
  const { data } = await api.get(url);
  return data;
};

/**
 * Sync Proxy PG Akademik (Peremajaan Gelar Akademik)
 * @param {boolean} force - Force re-sync (default: false)
 * @returns {Promise} Job info { success, jobId, status, message }
 */
export const syncProxyPgAkademik = async (force = false) => {
  const url = force ? "/pg-akademik/sync?force=true" : "/pg-akademik/sync";
  const { data } = await api.get(url);
  return data;
};

/**
 * Sync Proxy PG Profesi (Peremajaan Gelar Profesi)
 * @param {boolean} force - Force re-sync (default: false)
 * @returns {Promise} Job info { success, jobId, status, message }
 */
export const syncProxyPgProfesi = async (force = false) => {
  const url = force ? "/pg-profesi/sync?force=true" : "/pg-profesi/sync";
  const { data } = await api.get(url);
  return data;
};

/**
 * Sync Proxy SKK (Surat Keterangan Kerja)
 * @param {boolean} force - Force re-sync (default: false)
 * @returns {Promise} Job info { success, jobId, status, message }
 */
export const syncProxySkk = async (force = false) => {
  const url = force ? "/skk/sync?force=true" : "/skk/sync";
  const { data } = await api.get(url);
  return data;
};

// ==================== JOB MANAGEMENT ====================

/**
 * Get Proxy Sync Job Status
 * @param {string} jobId - Job ID (e.g., "proxy-pangkat-1234567890")
 * @returns {Promise} Job status { success, jobId, type, state, progress, progressInfo, result }
 */
export const getProxySyncStatus = async (jobId) => {
  const { data } = await api.get(`/status?jobId=${jobId}`);
  return data;
};

/**
 * Debug Queue - Get all jobs info
 * @returns {Promise} All jobs info with summary
 */
export const debugProxyQueue = async () => {
  const { data } = await api.get("/debug");
  return data;
};

/**
 * Cleanup Proxy Queue
 * @param {Object} options - Cleanup options
 * @param {Array<string>} options.states - States to clean (e.g., ["completed", "failed"])
 * @param {string} options.type - Optional: specific proxy type (e.g., "pangkat")
 * @returns {Promise} Cleanup result
 */
export const cleanupProxyQueue = async (options = {}) => {
  const { data } = await api.post("/cleanup", options);
  return data;
};

// ==================== DATA FETCHING ====================

/**
 * Get Proxy Pangkat List
 * @param {Object} params - Query parameters { page, limit, nip, nama, periode, skpd_id }
 * @returns {Promise} Paginated data
 */
export const getProxyPangkatList = async (params) => {
  const query = queryString.stringify(params);
  const { data } = await api.get(`/pangkat?${query}`);
  return data;
};

/**
 * Get Proxy Pensiun List
 * @param {Object} params - Query parameters { page, limit, nip, nama, periode, skpd_id }
 * @returns {Promise} Paginated data
 */
export const getProxyPensiunList = async (params) => {
  const query = queryString.stringify(params);
  const { data } = await api.get(`/pensiun?${query}`);
  return data;
};

/**
 * Get Proxy PG Akademik List
 * @param {Object} params - Query parameters { page, limit, nip, nama, skpd_id }
 * @returns {Promise} Paginated data
 */
export const getProxyPgAkademikList = async (params) => {
  const query = queryString.stringify(params);
  const { data } = await api.get(`/pg-akademik?${query}`);
  return data;
};

/**
 * Get Proxy PG Profesi List
 * @param {Object} params - Query parameters { page, limit, nip, nama, skpd_id }
 * @returns {Promise} Paginated data
 */
export const getProxyPgProfesiList = async (params) => {
  const query = queryString.stringify(params);
  const { data } = await api.get(`/pg-profesi?${query}`);
  return data;
};

/**
 * Get Proxy SKK List
 * @param {Object} params - Query parameters { page, limit, nip, nama, skpd_id }
 * @returns {Promise} Paginated data
 */
export const getProxySkkList = async (params) => {
  const query = queryString.stringify(params);
  const { data } = await api.get(`/skk?${query}`);
  return data;
};

// ==================== UTILITIES ====================

/**
 * Sync All Proxy Types (for admin convenience)
 * @param {boolean} force - Force re-sync all
 * @returns {Promise<Object>} All job results
 */
export const syncAllProxy = async (force = false) => {
  const results = await Promise.allSettled([
    syncProxyPangkat(force),
    syncProxyPensiun(force),
    syncProxyPgAkademik(force),
    syncProxyPgProfesi(force),
    syncProxySkk(force),
  ]);

  return {
    pangkat: results[0],
    pensiun: results[1],
    pg_akademik: results[2],
    pg_profesi: results[3],
    skk: results[4],
  };
};

/**
 * Poll job status until completed/failed
 * @param {string} jobId - Job ID to poll
 * @param {Object} options - Polling options
 * @param {number} options.interval - Poll interval in ms (default: 2000)
 * @param {number} options.maxAttempts - Max poll attempts (default: 150 = 5 minutes)
 * @param {Function} options.onProgress - Callback on each poll (receives status)
 * @returns {Promise} Final job status
 */
export const pollJobStatus = async (
  jobId,
  { interval = 2000, maxAttempts = 150, onProgress } = {}
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getProxySyncStatus(jobId);

    if (onProgress) {
      onProgress(status);
    }

    // Job completed or failed
    if (
      status.state === "completed" ||
      status.state === "failed" ||
      status.progress === 100
    ) {
      return status;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error("Polling timeout: Job did not complete in time");
};

export default api;
