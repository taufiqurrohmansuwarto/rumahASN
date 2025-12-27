import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/rasn-naskah",
});

// ==========================================
// DOCUMENTS
// ==========================================

export const getDocuments = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/documents?${qs}`);
  return data;
};

export const getDocument = async (documentId) => {
  const { data } = await api.get(`/documents/${documentId}`);
  return data;
};

export const getDocumentDetail = async (documentId) => {
  const { data } = await api.get(`/documents/${documentId}`);
  return data;
};

export const createDocument = async (payload) => {
  const { data } = await api.post("/documents", payload);
  return data;
};

export const updateDocument = async ({ documentId, ...payload }) => {
  const { data } = await api.patch(`/documents/${documentId}`, payload);
  return data;
};

export const deleteDocument = async (documentId) => {
  const { data } = await api.delete(`/documents/${documentId}`);
  return data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000, // 5 minutes for large files
  });
  return data;
};

export const getBookmarkedDocuments = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/documents/bookmarks?${qs}`);
  return data;
};

export const getBookmarks = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/documents/bookmarks?${qs}`);
  return data;
};

export const toggleBookmark = async ({ documentId, note }) => {
  const { data } = await api.post(`/documents/${documentId}/bookmark`, {
    note,
  });
  return data;
};

export const addBookmark = async (documentId, notes = "") => {
  const { data } = await api.post(`/documents/${documentId}/bookmark`, {
    notes,
  });
  return data;
};

export const removeBookmark = async (documentId) => {
  const { data } = await api.delete(`/documents/${documentId}/bookmark`);
  return data;
};

export const getDocumentVersions = async (documentId) => {
  const { data } = await api.get(`/documents/${documentId}/versions`);
  return data;
};

export const getDocumentActivities = async (documentId, limit = 50) => {
  const { data } = await api.get(
    `/documents/${documentId}/activities?limit=${limit}`
  );
  return data;
};

// ==========================================
// ATTACHMENTS
// ==========================================

export const getAttachments = async (documentId) => {
  const { data } = await api.get(`/documents/${documentId}/attachments`);
  return data;
};

export const uploadAttachment = async ({ documentId, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(
    `/documents/${documentId}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const deleteAttachment = async ({ documentId, attachmentId }) => {
  const { data } = await api.delete(
    `/documents/${documentId}/attachments/${attachmentId}`
  );
  return data;
};

// ==========================================
// REVIEWS
// ==========================================

export const requestReview = async (documentId) => {
  const { data } = await api.post(`/documents/${documentId}/review`);
  return data;
};

export const startReview = async (documentId) => {
  const { data } = await api.post(`/documents/${documentId}/review`);
  return data;
};

export const getDocumentReviews = async (documentId, full = false) => {
  const { data } = await api.get(
    `/documents/${documentId}/review?full=${full}`
  );
  return data;
};

export const getDocumentReview = async (documentId) => {
  // Get full review data with issues
  const { data } = await api.get(`/documents/${documentId}/review?full=true`);
  return data;
};

export const getReview = async (reviewId) => {
  const { data } = await api.get(`/reviews/${reviewId}`);
  return data;
};

export const getReviewStatus = async (reviewId) => {
  const { data } = await api.get(`/reviews/${reviewId}/status`);
  return data;
};

export const getReviewIssues = async (reviewId, params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/reviews/${reviewId}/issues?${qs}`);
  return data;
};

export const resolveIssue = async ({ reviewId, issueId }) => {
  const { data } = await api.post(
    `/reviews/${reviewId}/issues/${issueId}/resolve`
  );
  return data;
};

export const bulkResolveIssues = async ({ reviewId, issueIds }) => {
  const { data } = await api.post(`/reviews/${reviewId}/issues/bulk-resolve`, {
    issue_ids: issueIds,
  });
  return data;
};

export const getReviewStats = async () => {
  const { data } = await api.get("/reviews/stats");
  return data;
};

export const cancelReview = async (reviewId) => {
  const { data } = await api.post(`/reviews/${reviewId}/cancel`);
  return data;
};

export const retryReview = async (reviewId) => {
  const { data } = await api.post(`/reviews/${reviewId}/retry`);
  return data;
};

// ==========================================
// TEMPLATES
// ==========================================

export const getTemplates = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/templates?${qs}`);
  return data;
};

export const getTemplate = async (templateId) => {
  const { data } = await api.get(`/templates/${templateId}`);
  return data;
};

export const getTemplateDetail = async (templateId) => {
  const { data } = await api.get(`/templates/${templateId}`);
  return data;
};

export const createTemplate = async (payload) => {
  const { data } = await api.post("/templates", payload);
  return data;
};

export const updateTemplate = async ({ templateId, ...payload }) => {
  const { data } = await api.patch(`/templates/${templateId}`, payload);
  return data;
};

export const deleteTemplate = async (templateId) => {
  const { data } = await api.delete(`/templates/${templateId}`);
  return data;
};

export const duplicateTemplate = async ({ templateId, name }) => {
  const { data } = await api.post(`/templates/${templateId}/duplicate`, {
    name,
  });
  return data;
};

export const getTemplateCategories = async () => {
  const { data } = await api.get("/templates/categories");
  return data;
};

// ==========================================
// PREFERENCES
// ==========================================

export const getPreferences = async () => {
  const { data } = await api.get("/preferences");
  return data;
};

export const updatePreferences = async (payload) => {
  const { data } = await api.put("/preferences", payload);
  return data;
};

export const addCustomRule = async ({ name, description, severity }) => {
  const { data } = await api.post("/preferences/custom-rules", {
    name,
    description,
    severity,
  });
  return data;
};

export const removeCustomRule = async (ruleId) => {
  const { data } = await api.delete(`/preferences/custom-rules/${ruleId}`);
  return data;
};

export const deleteCustomRule = async (ruleId) => {
  const { data } = await api.delete(`/preferences/custom-rules/${ruleId}`);
  return data;
};

export const addForbiddenWord = async ({ word, replacement, reason }) => {
  const { data } = await api.post("/preferences/forbidden-words", {
    word,
    replacement,
    reason,
  });
  return data;
};

export const removeForbiddenWord = async (wordId) => {
  const { data } = await api.delete(`/preferences/forbidden-words/${wordId}`);
  return data;
};

export const deleteForbiddenWord = async (wordId) => {
  const { data } = await api.delete(`/preferences/forbidden-words/${wordId}`);
  return data;
};

export const addPreferredTerm = async ({ original, preferred, context }) => {
  const { data } = await api.post("/preferences/preferred-terms", {
    original,
    preferred,
    context,
  });
  return data;
};

export const removePreferredTerm = async (termId) => {
  const { data } = await api.delete(`/preferences/preferred-terms/${termId}`);
  return data;
};

export const deletePreferredTerm = async (termId) => {
  const { data } = await api.delete(`/preferences/preferred-terms/${termId}`);
  return data;
};

export const getLanguageStyles = async () => {
  const { data } = await api.get("/preferences/language-styles");
  return data;
};

// ==========================================
// ADMIN - PERGUB
// ==========================================

export const getPergubs = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/admin/pergub?${qs}`);
  return data;
};

export const getPergubList = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/admin/pergub?${qs}`);
  return data;
};

export const getPergub = async (pergubId) => {
  const { data } = await api.get(`/admin/pergub/${pergubId}`);
  return data;
};

export const getPergubDetail = async (pergubId) => {
  const { data } = await api.get(`/admin/pergub/${pergubId}`);
  return data;
};

export const createPergub = async (payload) => {
  const { data } = await api.post("/admin/pergub", payload);
  return data;
};

export const updatePergub = async ({ pergubId, ...payload }) => {
  const { data } = await api.patch(`/admin/pergub/${pergubId}`, payload);
  return data;
};

export const deletePergub = async (pergubId) => {
  const { data } = await api.delete(`/admin/pergub/${pergubId}`);
  return data;
};

// ==========================================
// ADMIN - PERGUB RULES
// ==========================================

export const getPergubRules = async (pergubId, params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const { data } = await api.get(`/admin/pergub/${pergubId}/rules?${qs}`);
  return data;
};

export const createPergubRule = async ({ pergubId, ...payload }) => {
  const { data } = await api.post(`/admin/pergub/${pergubId}/rules`, payload);
  return data;
};

export const getPergubRule = async (ruleId) => {
  const { data } = await api.get(`/admin/rules/${ruleId}`);
  return data;
};

export const updatePergubRule = async ({ ruleId, ...payload }) => {
  const { data } = await api.patch(`/admin/rules/${ruleId}`, payload);
  return data;
};

export const deletePergubRule = async (ruleId) => {
  const { data } = await api.delete(`/admin/rules/${ruleId}`);
  return data;
};

export const syncRulesToQdrant = async (pergubId = null, force = false) => {
  const { data } = await api.post("/admin/rules/sync-qdrant", {
    pergubId,
    force,
  });
  return data;
};

export const getRuleTypes = async () => {
  const { data } = await api.get("/admin/rules/types");
  return data;
};

// ==========================================
// SUPERIOR PREFERENCES
// ==========================================

export const getSuperiorPreferences = async () => {
  const { data } = await api.get("/preferences/superiors");
  return data;
};

export const getSuperiorPreference = async (superiorId) => {
  const { data } = await api.get(`/preferences/superiors/${superiorId}`);
  return data;
};

export const createSuperiorPreference = async (payload) => {
  const { data } = await api.post("/preferences/superiors", payload);
  return data;
};

export const updateSuperiorPreference = async ({ superiorId, ...payload }) => {
  const { data } = await api.patch(`/preferences/superiors/${superiorId}`, payload);
  return data;
};

export const deleteSuperiorPreference = async (superiorId) => {
  const { data } = await api.delete(`/preferences/superiors/${superiorId}`);
  return data;
};

// ==========================================
// REVIEWS - Enhanced with targetSuperiorId
// ==========================================

export const requestReviewWithOptions = async (documentId, options = {}) => {
  const { data } = await api.post(`/documents/${documentId}/review`, options);
  return data;
};

export const getReviewIssuesGrouped = async (reviewId) => {
  const { data } = await api.get(`/reviews/${reviewId}/issues/grouped`);
  return data;
};
