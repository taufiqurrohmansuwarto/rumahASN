import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/rasn-mail",
});

export const getEmailStats = async () => {
  return api.get("/stats").then((res) => res?.data);
};

export const getTrash = async (userId) => {
  return api
    .get(`/trash?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const deleteTrash = async (userId) => {
  return api
    .delete(`/trash?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const emptyTrash = async (userId) => {
  return api
    .delete(`/trash/empty?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const bulkDelete = async ({ emailIds, permanent = false }) => {
  return api
    .post(`/bulk-delete`, { emailIds, permanent })
    .then((res) => res?.data);
};

export const restoreEmail = async (emailId) => {
  return api.put(`/emails/${emailId}/delete`).then((res) => res?.data);
};

export const deleteEmail = async ({ emailId, permanent = false }) => {
  return api
    .patch(`/emails/${emailId}/delete`, { permanent })
    .then((res) => res?.data);
};

export const sendEmail = async (data) => {
  return api.post("/emails", data).then((res) => res?.data);
};

// New functions for inbox
export const getInboxEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "inbox" })}`)
    .then((res) => res?.data);
};

export const getSentEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "sent" })}`)
    .then((res) => res?.data);
};

export const getDraftsEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "drafts" })}`)
    .then((res) => res?.data);
};

export const getTrashEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "trash" })}`)
    .then((res) => res?.data);
};

export const getArchiveEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "archive" })}`)
    .then((res) => res?.data);
};

export const getSpamEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "spam" })}`)
    .then((res) => res?.data);
};

export const getSnoozedEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "snoozed" })}`)
    .then((res) => res?.data);
};

export const getStarredEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "starred" })}`)
    .then((res) => res?.data);
};

export const getImportantEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "important" })}`)
    .then((res) => res?.data);
};

export const getEmailById = async (emailId) => {
  return api.get(`/emails/${emailId}`).then((res) => res?.data);
};

export const markAsRead = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "read" })
    .then((res) => res?.data);
};

export const markAsUnread = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "unread" })
    .then((res) => res?.data);
};

export const toggleStar = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "star" })
    .then((res) => res?.data);
};

export const moveToFolder = async (emailId, folder) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: folder })
    .then((res) => res?.data);
};

export const updatePriority = async (emailId, priority) => {
  return api
    .put(`/emails/${emailId}`, { action: "priority", value: priority })
    .then((res) => res?.data);
};

export const searchEmails = async (params) => {
  return api
    .get(`/search?${queryString.stringify(params)}`)
    .then((res) => res?.data);
};

// drafts

// save draft
export const saveDraft = async (data) => {
  return api.post("/drafts", data).then((res) => res?.data);
};

// udpate draft
export const updateDraft = async ({ id, data }) => {
  return api.put(`/drafts/${id}`, data).then((res) => res?.data);
};

// delete draft
export const deleteDraft = async (id) => {
  return api.delete(`/drafts/${id}`).then((res) => res?.data);
};

// get draft
export const getDraft = async (id) => {
  return api.get(`/drafts/${id}`).then((res) => res?.data);
};

// send draft
export const sendDraft = async (id) => {
  return api.post(`/drafts/${id}/send`).then((res) => res?.data);
};

// search users
export const searchUsers = async (q) => {
  return api.get(`/search/users?q=${q}`).then((res) => res?.data);
};

// labels
export const getUserLabels = async () => {
  return api.get("/labels").then((res) => res?.data);
};

export const createLabel = async (data) => {
  return api.post("/labels", data).then((res) => res?.data);
};

export const deleteLabel = async (id) => {
  return api.delete(`/labels/${id}`).then((res) => res?.data);
};

export const updateLabel = async (id, data) => {
  return api.put(`/labels/${id}`, data).then((res) => res?.data);
};

// assign label to email
export const assignLabelToEmail = async (emailId, labelId) => {
  return api
    .post(`/emails/${emailId}/labels/${labelId}`)
    .then((res) => res?.data);
};

// get email labels
export const getEmailLabels = async (emailId) => {
  return api.get(`/emails/${emailId}/labels`).then((res) => res?.data);
};

// remove label from email
export const removeLabelFromEmail = async (emailId, labelId) => {
  return api
    .delete(`/emails/${emailId}/labels/${labelId}`)
    .then((res) => res?.data);
};

// ✅ TAMBAHKAN ACTION SERVICES
export const archiveEmail = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "archive" })
    .then((res) => res?.data);
};

export const markAsSpam = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "spam" })
    .then((res) => res?.data);
};

export const markAsNotSpam = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "inbox" })
    .then((res) => res?.data);
};

export const getLabelEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "label" })}`)
    .then((res) => res?.data);
};

// reply to email
export const replyToEmail = async (emailId, data) => {
  return api.post(`/emails/${emailId}/reply`, data).then((res) => res?.data);
};

// get email with thread
export const getEmailWithThread = async (emailId) => {
  return api.get(`/emails/${emailId}/thread`).then((res) => res?.data);
};

// upload
export const uploadSingleFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }

  return api.post("/upload/single", formData, config).then((res) => res?.data);
};

// Upload multiple files
export const uploadMultipleFiles = async (files, onProgress = null) => {
  const formData = new FormData();

  // Append all files
  files.forEach((file) => {
    formData.append("files", file);
  });

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }

  return api
    .post("/upload/multiple", formData, config)
    .then((res) => res?.data);
};

// Get attachment info
export const getAttachment = async (attachmentId) => {
  return api
    .get(`/upload/attachments/${attachmentId}`)
    .then((res) => res?.data);
};

// Delete attachment
export const deleteAttachment = async (attachmentId) => {
  return api
    .delete(`/upload/attachments/${attachmentId}`)
    .then((res) => res?.data);
};

// Get user uploads
export const getUserUploads = async (params = {}) => {
  const queryParams = {
    page: 1,
    limit: 20,
    search: "",
    include_used: false,
    mime_type: null,
    ...params,
  };

  return api
    .get(`/upload/attachments?${queryString.stringify(queryParams)}`)
    .then((res) => res?.data);
};

// Get download URL (presigned)
export const getDownloadUrl = async (attachmentId) => {
  return api.get(`/upload/download/${attachmentId}`).then((res) => res?.data);
};

// Get upload statistics
export const getUploadStats = async () => {
  return api.get("/upload/stats").then((res) => res?.data);
};

// Cleanup unused files (admin)
export const cleanupUnusedFiles = async (days = 7) => {
  return api.post(`/upload/cleanup?days=${days}`).then((res) => res?.data);
};

// ==========================================
// UPLOAD UTILITY FUNCTIONS
// ==========================================

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Get file icon type
export const getFileIcon = (mimeType, fileName = "") => {
  if (!mimeType && fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return "image";
    } else if (["pdf"].includes(ext)) {
      return "pdf";
    } else if (["doc", "docx"].includes(ext)) {
      return "word";
    } else if (["xls", "xlsx"].includes(ext)) {
      return "excel";
    } else if (["ppt", "pptx"].includes(ext)) {
      return "powerpoint";
    } else if (["zip", "rar", "7z"].includes(ext)) {
      return "archive";
    }
    return "file";
  }

  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("word")) return "word";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "excel";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "powerpoint";
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("7z")
    )
      return "archive";
    if (mimeType.includes("text")) return "text";
  }

  return "file";
};

// Check if file is image
export const isImageFile = (mimeType) => {
  return mimeType && mimeType.startsWith("image/");
};

// Validate file size
export const validateFileSize = (file, maxSizeMB = 25) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Validate file type
export const validateFileType = (file, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(file.type);
};

// Default allowed file types
export const DEFAULT_ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];
