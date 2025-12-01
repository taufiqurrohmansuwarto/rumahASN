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

// ==========================================
// ADMIN - DASHBOARD
// ==========================================

/**
 * Get admin dashboard summary
 */
export const getAdminDashboardSummary = async () => {
  return api.get("/admin/dashboard").then((res) => res?.data);
};

// ==========================================
// ADMIN - ADVOKASI
// ==========================================

/**
 * Get all advokasi (admin)
 * @param {Object} params - { page, limit, status, search, sortField, sortOrder, startDate, endDate }
 */
export const getAdminAdvokasi = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/admin/advokasi?${query}`).then((res) => res?.data);
};

/**
 * Get advokasi by ID (admin)
 * @param {String} id - Advokasi ID
 */
export const getAdminAdvokasiById = async (id) => {
  return api.get(`/admin/advokasi/${id}`).then((res) => res?.data);
};

/**
 * Update advokasi status (admin)
 * @param {String} id - Advokasi ID
 * @param {Object} data - { status, alasan_tolak, catatan }
 */
export const updateAdminAdvokasiStatus = async (id, data) => {
  return api.patch(`/admin/advokasi/${id}`, data).then((res) => res?.data);
};

/**
 * Get jadwal advokasi (admin)
 * @param {Object} params - { month, year }
 */
export const getAdminJadwalAdvokasi = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/admin/advokasi/jadwal?${query}`).then((res) => res?.data);
};

/**
 * Create or update jadwal advokasi (admin)
 * @param {Object} data - { id?, tanggal_konsultasi, waktu_mulai, waktu_selesai, kuota_maksimal, status }
 */
export const upsertAdminJadwalAdvokasi = async (data) => {
  return api.post("/admin/advokasi/jadwal", data).then((res) => res?.data);
};

/**
 * Get jadwal detail (admin)
 * @param {String} id - Jadwal ID
 */
export const getAdminJadwalDetail = async (id) => {
  return api.get(`/admin/advokasi/jadwal/${id}`).then((res) => res?.data);
};

/**
 * Update kuota jadwal (admin)
 * @param {String} id - Jadwal ID
 * @param {Object} data - { kuota_maksimal }
 */
export const updateAdminJadwalKuota = async (id, data) => {
  return api
    .patch(`/admin/advokasi/jadwal/${id}`, data)
    .then((res) => res?.data);
};

/**
 * Export advokasi to Excel (admin)
 * @param {Object} params - { status, startDate, endDate }
 */
export const exportAdminAdvokasi = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/admin/advokasi?${query}`, { responseType: "blob" });
};

// ==========================================
// ADMIN - KONSULTASI HUKUM
// ==========================================

/**
 * Get all konsultasi hukum (admin)
 * @param {Object} params - { page, limit, status, jenis, search, sortField, sortOrder, startDate, endDate }
 */
export const getAdminKonsultasiHukum = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/admin/konsultasi-hukum?${query}`).then((res) => res?.data);
};

/**
 * Get konsultasi hukum by ID (admin)
 * @param {String} id - Konsultasi ID
 */
export const getAdminKonsultasiHukumById = async (id) => {
  return api.get(`/admin/konsultasi-hukum/${id}`).then((res) => res?.data);
};

/**
 * Update konsultasi hukum status (admin)
 * @param {String} id - Konsultasi ID
 * @param {Object} data - { status, respon }
 */
export const updateAdminKonsultasiHukumStatus = async (id, data) => {
  return api
    .patch(`/admin/konsultasi-hukum/${id}`, data)
    .then((res) => res?.data);
};

/**
 * Get threads for a konsultasi (admin)
 * @param {String} id - Konsultasi ID
 */
export const getAdminKonsultasiHukumThreads = async (id) => {
  return api
    .get(`/admin/konsultasi-hukum/${id}/threads`)
    .then((res) => res?.data);
};

/**
 * Send message to konsultasi thread (admin)
 * @param {String} id - Konsultasi ID
 * @param {Object} data - { message }
 */
export const sendAdminKonsultasiHukumMessage = async (id, data) => {
  return api
    .post(`/admin/konsultasi-hukum/${id}/threads`, data)
    .then((res) => res?.data);
};

/**
 * Export konsultasi hukum to Excel (admin)
 * @param {Object} params - { status, jenis, startDate, endDate }
 */
export const exportAdminKonsultasiHukum = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/admin/konsultasi-hukum?${query}`, { responseType: "blob" });
};

// ==========================================
// ADMIN - PENDAMPINGAN HUKUM
// ==========================================

/**
 * Get all pendampingan hukum (admin)
 * @param {Object} params - { page, limit, status, jenisPerkara, bentuk, search, sortField, sortOrder, startDate, endDate }
 */
export const getAdminPendampinganHukum = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/admin/pendampingan-hukum?${query}`).then((res) => res?.data);
};

/**
 * Get pendampingan hukum by ID (admin)
 * @param {String} id - Pendampingan ID
 */
export const getAdminPendampinganHukumById = async (id) => {
  return api.get(`/admin/pendampingan-hukum/${id}`).then((res) => res?.data);
};

/**
 * Update pendampingan hukum status (admin)
 * @param {String} id - Pendampingan ID
 * @param {Object} data - { status, catatan, alasan_tolak }
 */
export const updateAdminPendampinganHukumStatus = async (id, data) => {
  return api
    .patch(`/admin/pendampingan-hukum/${id}`, data)
    .then((res) => res?.data);
};

/**
 * Export pendampingan hukum to Excel (admin)
 * @param {Object} params - { status, jenisPerkara, bentuk, startDate, endDate }
 */
export const exportAdminPendampinganHukum = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/admin/pendampingan-hukum?${query}`, {
    responseType: "blob",
  });
};

// ==========================================
// USERS - PROFILE
// ==========================================

/**
 * Get profile for current user
 */
export const getProfile = async () => {
  return api.get("/users/profile").then((res) => res?.data);
};
