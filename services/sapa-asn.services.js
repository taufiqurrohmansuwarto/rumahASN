import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/sapa-asn",
});

// ==========================================
// ADVOKASI
// ==========================================

/**
 * Get all advokasi for current user
 * @param {Object} params - { page, limit, status, search, sortField, sortOrder }
 */
export const getAdvokasi = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/users/advokasi?${query}`).then((res) => res?.data);
};

/**
 * Get advokasi by ID
 * @param {String} id - Advokasi ID
 */
export const getAdvokasiById = async (id) => {
  return api.get(`/users/advokasi/${id}`).then((res) => res?.data);
};

/**
 * Create new advokasi
 * @param {Object} data - Form data
 */
export const createAdvokasi = async (data) => {
  return api.post("/users/advokasi", data).then((res) => res?.data);
};

/**
 * Cancel advokasi
 * @param {String} id - Advokasi ID
 */
export const cancelAdvokasi = async (id) => {
  return api.delete(`/users/advokasi/${id}`).then((res) => res?.data);
};

/**
 * Get available jadwal for advokasi
 */
export const getJadwalAdvokasi = async () => {
  return api.get("/users/advokasi/jadwal").then((res) => res?.data);
};

// ==========================================
// KONSULTASI HUKUM
// ==========================================

/**
 * Get all konsultasi hukum for current user
 * @param {Object} params - { page, limit, status, jenis, search, sortField, sortOrder }
 */
export const getKonsultasiHukum = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/users/konsultasi-hukum?${query}`).then((res) => res?.data);
};

/**
 * Get konsultasi hukum by ID
 * @param {String} id - Konsultasi ID
 */
export const getKonsultasiHukumById = async (id) => {
  return api.get(`/users/konsultasi-hukum/${id}`).then((res) => res?.data);
};

/**
 * Create new konsultasi hukum with file upload
 * @param {FormData} formData - Form data with files
 */
export const createKonsultasiHukum = async (formData) => {
  return api
    .post("/users/konsultasi-hukum", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res?.data);
};

/**
 * Get thread detail (konsultasi + messages)
 * @param {String} id - Konsultasi ID
 */
export const getKonsultasiHukumThreads = async (id) => {
  return api
    .get(`/users/konsultasi-hukum/${id}/threads`)
    .then((res) => res?.data);
};

/**
 * Send message to thread
 * @param {String} id - Konsultasi ID
 * @param {Object} data - { message }
 */
export const sendMessageKonsultasiHukum = async (id, data) => {
  return api
    .post(`/users/konsultasi-hukum/${id}/threads`, data)
    .then((res) => res?.data);
};

/**
 * Delete uploaded file
 * @param {String} id - Konsultasi ID
 * @param {String} filePath - File path in minio
 */
export const deleteFileKonsultasiHukum = async (id, filePath) => {
  const query = queryString.stringify({ filePath });
  return api
    .delete(`/users/konsultasi-hukum/${id}/file?${query}`)
    .then((res) => res?.data);
};

// ==========================================
// PENDAMPINGAN HUKUM
// ==========================================

/**
 * Get all pendampingan hukum for current user
 * @param {Object} params - { page, limit, status, jenisPerkara, bentuk, search, sortField, sortOrder }
 */
export const getPendampinganHukum = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/users/pendampingan-hukum?${query}`).then((res) => res?.data);
};

/**
 * Get pendampingan hukum by ID
 * @param {String} id - Pendampingan ID
 */
export const getPendampinganHukumById = async (id) => {
  return api.get(`/users/pendampingan-hukum/${id}`).then((res) => res?.data);
};

/**
 * Create new pendampingan hukum with file upload
 * @param {FormData} formData - Form data with files
 */
export const createPendampinganHukum = async (formData) => {
  return api
    .post("/users/pendampingan-hukum", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res?.data);
};

/**
 * Update pendampingan hukum with file upload
 * @param {String} id - Pendampingan ID
 * @param {FormData} formData - Form data with files
 */
export const updatePendampinganHukum = async (id, formData) => {
  return api
    .put(`/users/pendampingan-hukum/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res?.data);
};

/**
 * Cancel pendampingan hukum
 * @param {String} id - Pendampingan ID
 */
export const cancelPendampinganHukum = async (id) => {
  return api.delete(`/users/pendampingan-hukum/${id}`).then((res) => res?.data);
};

/**
 * Delete uploaded file
 * @param {String} id - Pendampingan ID
 * @param {String} filePath - File path in minio
 */
export const deleteFilePendampinganHukum = async (id, filePath) => {
  const query = queryString.stringify({ filePath });
  return api
    .delete(`/users/pendampingan-hukum/${id}/file?${query}`)
    .then((res) => res?.data);
};

// ==========================================
// DASHBOARD
// ==========================================

/**
 * Get dashboard summary for current user
 */
export const getDashboardSummary = async () => {
  return api.get("/users/dashboard").then((res) => res?.data);
};

/**
 * Get notifications for current user
 * @param {Object} params - { page, limit, unreadOnly }
 */
export const getNotifications = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api
    .get(`/users/dashboard/notifications?${query}`)
    .then((res) => res?.data);
};

/**
 * Mark notification as read
 * @param {String} id - Notification ID or "all" to mark all as read
 */
export const markNotificationRead = async (id) => {
  return api
    .patch(`/users/dashboard/notifications?id=${id}`)
    .then((res) => res?.data);
};
