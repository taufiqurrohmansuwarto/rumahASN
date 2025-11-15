const queryString = require("query-string");
const { default: axios } = require("axios");

// Constants
const BASE_URL = "https://api-siasn.bkn.go.id";
const INSTANSI_INDUK_ID = "A5EB03E23CCCF6A0E040640A040252AD";

/**
 * Creates an axios instance with authentication token
 * @param {string} token - Bearer token for authentication
 * @returns {import('axios').AxiosInstance} Configured axios instance
 */
const createFetcher = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 60000, // 1 minute
  });
};

/**
 * Builds query parameters for kenaikan pangkat monitoring
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
const buildKenaikanPangkatParams = (params = {}) => {
  const defaultParams = {
    nip: "",
    nama: "",
    detail_layanan: "",
    sub_layanan: "",
    jenis_layanan_nama: "",
    status_usulan: "",
    limit: 10,
    offset: 0,
    periode: "",
    instansi_induk_id: INSTANSI_INDUK_ID,
    tgl_usulan: "",
  };

  return queryString.stringify({ ...defaultParams, ...params });
};

/**
 * Fetches kenaikan pangkat monitoring data
 * @param {string} token - Bearer token for authentication
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Monitoring data
 */
module.exports.getKenaikanPangkatProxy = async (token, params = {}) => {
  const fetcher = createFetcher(token);
  const queryParams = buildKenaikanPangkatParams(params);
  const url = `/siasn-instansi/kp/usulan/monitoring?${queryParams}`;

  const response = await fetcher.get(url);
  return response.data;
};

/**
 * Builds body parameters for pemberhentian inbox filter
 * @param {Object} params - Query parameters
 * @returns {Object} Body object for POST request
 */
const buildPemberhentianParams = (params = {}) => {
  const defaultParams = {
    nip: "",
    nama: "",
    detail_layanan: "",
    sub_layanan: "",
    jenis_layanan_nama: "",
    status_usulan: "",
    limit: 10,
    offset: 0,
    periode: "",
    instansi_induk_id: INSTANSI_INDUK_ID,
    tgl_usulan: "",
  };

  return { ...defaultParams, ...params };
};

/**
 * Fetches pemberhentian/pensiun inbox data (POST method)
 * Response format: { meta: { total }, page: { total }, data: [...] }
 * @param {string} token - Bearer token for authentication
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Inbox data with meta and data array
 */
module.exports.getPemberhentianProxy = async (token, params = {}) => {
  // Create fetcher with extended timeout for pemberhentian API
  const fetcher = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 120000, // 2 minutes timeout (extended for slow API)
  });

  const bodyParams = buildPemberhentianParams(params);
  const url = `/siasn-instansi/pemberhentian/inbox-filter?limit=${bodyParams.limit}&offset=${bodyParams.offset}`;

  const response = await fetcher.post(url, bodyParams);
  return response.data;
};

/**
 * Builds query parameters for peremajaan gelar akademik
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
const buildPeremajaanGelarParams = (params = {}) => {
  const defaultParams = {
    offset: 0,
    limit: 10,
    detail_layanan: "328", // Pencantuman Gelar Pendidikan
    instansi_kerja_id: INSTANSI_INDUK_ID,
  };

  return queryString.stringify({ ...defaultParams, ...params });
};

/**
 * Fetches peremajaan gelar akademik data
 * Response format: { results: [...] } (NO meta.total, fetch until empty array)
 * @param {string} token - Bearer token for authentication
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Results array
 */
module.exports.getPeremajaanGelarProxy = async (token, params = {}) => {
  const fetcher = createFetcher(token);
  const queryParams = buildPeremajaanGelarParams(params);
  const url = `/siasn-instansi/api/peremajaan/inbox-usul-instansi?${queryParams}`;

  const response = await fetcher.get(url);
  return response.data;
};

/**
 * Builds query parameters for peremajaan gelar profesi
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
const buildPeremajaanProfesiParams = (params = {}) => {
  const defaultParams = {
    offset: 0,
    limit: 10,
    detail_layanan: "125", // Gelar Profesi
    instansi_kerja_id: INSTANSI_INDUK_ID,
  };

  return queryString.stringify({ ...defaultParams, ...params });
};

/**
 * Fetches peremajaan gelar profesi data
 * Response format: { results: [...] } (NO meta.total, fetch until empty array)
 * @param {string} token - Bearer token for authentication
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Results array
 */
module.exports.getPeremajaanProfesiProxy = async (token, params = {}) => {
  const fetcher = createFetcher(token);
  const queryParams = buildPeremajaanProfesiParams(params);
  const url = `/siasn-instansi/api/peremajaan/inbox-usul-instansi?${queryParams}`;

  const response = await fetcher.get(url);
  return response.data;
};

/**
 * Builds query parameters for SKK monitoring
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
const buildSKKParams = (params = {}) => {
  const defaultParams = {
    nip: "",
    nama: "",
    tgl_usulan: "",
    sub_layanan: "",
    detail_layanan_id: "",
    status_usulan: "",
    limit: 10,
    offset: 0,
  };

  return queryString.stringify({ ...defaultParams, ...params });
};

/**
 * Fetches SKK usulan monitoring data
 * Response format: { meta: { total }, page: { ... }, data: [...] }
 * @param {string} token - Bearer token for authentication
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Object>} Monitoring data
 */
module.exports.getSKKProxy = async (token, params = {}) => {
  const fetcher = createFetcher(token);
  const queryParams = buildSKKParams(params);
  const url = `/siasn-instansi/skk/usulan/monitoring?${queryParams}`;

  const response = await fetcher.get(url);
  return response.data;
};
