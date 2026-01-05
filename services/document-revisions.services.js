import axios from "axios";
import qs from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/pengadaan/document-revisions",
});

const adminApi = axios.create({
  baseURL: "/helpdesk/api/pengadaan/admin/document-revisions",
});

// ===== USER SERVICES =====

/**
 * Get reference data for revision form (revision_types, document_types, tmt_list)
 */
export const getDocumentRevisionReferences = async () => {
  return api.get("/references").then((res) => res.data);
};

/**
 * Create new document revision request
 */
export const createDocumentRevision = async (data) => {
  return api.post("", data).then((res) => res.data);
};

/**
 * Get my document revision requests
 */
export const getMyDocumentRevisions = async (query) => {
  const queryString = qs.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return api.get(`/my?${queryString}`).then((res) => res.data);
};

/**
 * Get document revision detail
 */
export const getDocumentRevision = async (id) => {
  return api.get(`/${id}`).then((res) => res.data);
};

/**
 * Cancel document revision request (only if pending)
 */
export const cancelDocumentRevision = async (id) => {
  return api.delete(`/${id}`).then((res) => res.data);
};

// ===== ADMIN SERVICES =====

/**
 * Get all document revision requests (Admin)
 */
export const getAllDocumentRevisions = async (query) => {
  const queryString = qs.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return adminApi.get(`?${queryString}`).then((res) => res.data);
};

/**
 * Get document revision detail (Admin)
 */
export const getDocumentRevisionAdmin = async (id) => {
  return adminApi.get(`/${id}`).then((res) => res.data);
};

/**
 * Update document revision status (Admin)
 */
export const updateDocumentRevisionStatus = async (id, data) => {
  return adminApi.patch(`/${id}`, data).then((res) => res.data);
};
