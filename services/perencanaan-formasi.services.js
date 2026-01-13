import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/perencanaan-formasi",
});

// ==========================================
// FORMASI
// ==========================================

/**
 * Get all formasi
 * @param {Object} params - { page, limit, search, status, tahun, sortField, sortOrder }
 */
export const getFormasi = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/formasi?${query}`).then((res) => res?.data);
};

/**
 * Get formasi by ID
 * @param {String} id - Formasi ID
 */
export const getFormasiById = async (id) => {
  return api.get(`/formasi/${id}`).then((res) => res?.data);
};

/**
 * Create new formasi
 * @param {Object} data - { deskripsi, tahun, status }
 */
export const createFormasi = async (data) => {
  return api.post("/formasi", data).then((res) => res?.data);
};

/**
 * Update formasi
 * @param {String} id - Formasi ID
 * @param {Object} data - { deskripsi, tahun, status }
 */
export const updateFormasi = async (id, data) => {
  return api.patch(`/formasi/${id}`, data).then((res) => res?.data);
};

/**
 * Delete formasi
 * @param {String} id - Formasi ID
 */
export const deleteFormasi = async (id) => {
  return api.delete(`/formasi/${id}`).then((res) => res?.data);
};

/**
 * Export formasi to Excel
 * @param {Object} params - { status, tahun, search }
 */
export const exportFormasi = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/formasi?${query}`, { responseType: "blob" });
};

// ==========================================
// USULAN
// ==========================================

/**
 * Get all usulan
 * @param {Object} params - { page, limit, search, status, formasi_id, jenis_jabatan, unit_kerja, sortField, sortOrder }
 */
export const getUsulan = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/usulan?${query}`).then((res) => res?.data);
};

/**
 * Get usulan by ID
 * @param {String} id - Usulan ID
 */
export const getUsulanById = async (id) => {
  return api.get(`/usulan/${id}`).then((res) => res?.data);
};

/**
 * Create new usulan
 * @param {Object} data - { formasi_id, jenis_jabatan, jabatan_id, kualifikasi_pendidikan, alokasi, unit_kerja, lampiran_id }
 */
export const createUsulan = async (data) => {
  return api.post("/usulan", data).then((res) => res?.data);
};

/**
 * Update usulan
 * @param {String} id - Usulan ID
 * @param {Object} data - { jenis_jabatan, jabatan_id, kualifikasi_pendidikan, alokasi, unit_kerja, lampiran_id, alasan_perbaikan }
 */
export const updateUsulan = async (id, data) => {
  return api.patch(`/usulan/${id}`, data).then((res) => res?.data);
};

/**
 * Update usulan status (verifikasi)
 * @param {String} id - Usulan ID
 * @param {Object} data - { status, alasan_perbaikan }
 */
export const updateUsulanStatus = async (id, data) => {
  return api.patch(`/usulan/${id}/status`, data).then((res) => res?.data);
};

/**
 * Delete usulan
 * @param {String} id - Usulan ID
 */
export const deleteUsulan = async (id) => {
  return api.delete(`/usulan/${id}`).then((res) => res?.data);
};

/**
 * Export usulan to Excel
 * @param {Object} params - { status, formasi_id, jenis_jabatan, unit_kerja, search }
 */
export const exportUsulan = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/usulan?${query}`, { responseType: "blob" });
};

// ==========================================
// LAMPIRAN
// ==========================================

/**
 * Get all lampiran
 * @param {Object} params - { page, limit, search, usulan_id, unit_kerja, sortField, sortOrder }
 */
export const getLampiran = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/lampiran?${query}`).then((res) => res?.data);
};

/**
 * Get lampiran by ID
 * @param {String} id - Lampiran ID
 */
export const getLampiranById = async (id) => {
  return api.get(`/lampiran/${id}`).then((res) => res?.data);
};

/**
 * Upload lampiran file
 * @param {FormData} formData - Form data with file and { usulan_id, unit_kerja }
 */
export const uploadLampiran = async (formData) => {
  return api
    .post("/lampiran", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res?.data);
};

/**
 * Update lampiran metadata
 * @param {String} id - Lampiran ID
 * @param {Object} data - { file_name, unit_kerja, usulan_id }
 */
export const updateLampiran = async (id, data) => {
  // Check if data is FormData (for file upload)
  const isFormData = data instanceof FormData;
  const config = isFormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  return api.patch(`/lampiran/${id}`, data, config).then((res) => res?.data);
};

/**
 * Delete lampiran
 * @param {String} id - Lampiran ID
 */
export const deleteLampiran = async (id) => {
  return api.delete(`/lampiran/${id}`).then((res) => res?.data);
};

/**
 * Download lampiran file
 * @param {String} id - Lampiran ID
 */
export const downloadLampiran = async (id) => {
  return api.get(`/lampiran/${id}/download`, {
    responseType: "blob",
  });
};

// ==========================================
// RIWAYAT AUDIT
// ==========================================

/**
 * Get all riwayat audit
 * @param {Object} params - { page, limit, search, formasi_id, usulan_id, aksi, sortField, sortOrder, startDate, endDate }
 */
export const getRiwayatAudit = async (params = {}) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/riwayat-audit?${query}`).then((res) => res?.data);
};

/**
 * Get riwayat audit by ID
 * @param {String} id - Riwayat Audit ID
 */
export const getRiwayatAuditById = async (id) => {
  return api.get(`/riwayat-audit/${id}`).then((res) => res?.data);
};

/**
 * Get riwayat audit by usulan_id
 * @param {String} usulan_id - Usulan ID
 * @param {Object} params - { page, limit, aksi, sortField, sortOrder }
 */
export const getRiwayatAuditByUsulanId = async (usulan_id, params = {}) => {
  const query = queryString.stringify(
    { usulan_id, ...params },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/riwayat-audit?${query}`).then((res) => res?.data);
};

/**
 * Get riwayat audit by formasi_id
 * @param {String} formasi_id - Formasi ID
 * @param {Object} params - { page, limit, aksi, sortField, sortOrder }
 */
export const getRiwayatAuditByFormasiId = async (formasi_id, params = {}) => {
  const query = queryString.stringify(
    { formasi_id, ...params },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/riwayat-audit?${query}`).then((res) => res?.data);
};

/**
 * Export riwayat audit to Excel
 * @param {Object} params - { formasi_id, usulan_id, aksi, startDate, endDate }
 */
export const exportRiwayatAudit = async (params = {}) => {
  const query = queryString.stringify(
    { ...params, limit: -1 },
    {
      skipEmptyString: true,
      skipNull: true,
    }
  );
  return api.get(`/riwayat-audit?${query}`, { responseType: "blob" });
};

// ==========================================
// REFERENSI
// ==========================================

/**
 * Get jabatan fungsional (JFT)
 * @returns {Promise<Array>} - Array of { id, nama, value, label }
 */
export const getJabatanFungsional = async () => {
  return api.get("/referensi?type=jft").then((res) => res?.data);
};

/**
 * Get jabatan pelaksana (JFU)
 * @returns {Promise<Array>} - Array of { id, nama, value, label }
 */
export const getJabatanPelaksana = async () => {
  return api.get("/referensi?type=jfu").then((res) => res?.data);
};

/**
 * Get pendidikan
 * @returns {Promise<Array>} - Array of { id, nama, value, label }
 */
export const getPendidikan = async () => {
  return api.get("/referensi?type=pendidikan").then((res) => res?.data);
};
