import axios from "axios";
import queryString from "query-string";

const esignBkdApi = axios.create({
  baseURL: "/helpdesk/api/esign-bkd",
});

// ==========================================
// DOCUMENTS SERVICES
// ==========================================

export const getDocuments = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/documents?${queryParams}`);
  return res?.data;
};

export const createDocument = async (formData) => {
  const res = await esignBkdApi.post(`/documents`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res?.data;
};

export const getDocumentById = async (id) => {
  const res = await esignBkdApi.get(`/documents/${id}`);
  return res?.data;
};

export const updateDocument = async (id, data) => {
  const res = await esignBkdApi.put(`/documents/${id}`, data);
  return res?.data;
};

export const deleteDocument = async (id) => {
  const res = await esignBkdApi.delete(`/documents/${id}`);
  return res?.data;
};

export const downloadDocument = async (id) => {
  const res = await esignBkdApi.get(`/documents/${id}/download`);
  return res?.data;
};

export const previewDocument = async (id) => {
  const res = await esignBkdApi.get(`/documents/${id}/preview`, {
    responseType: "blob",
  });
  return res?.data;
};

export const previewDocumentAsBlob = async (id) => {
  try {
    const response = await esignBkdApi.get(`/documents/${id}/preview`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Preview document error:", error);
    throw error;
  }
};

export const previewDocumentAsBase64 = async (id) => {
  try {
    const response = await esignBkdApi.get(
      `/documents/${id}/preview?format=base64`
    );
    return response.data;
  } catch (error) {
    console.error("Preview document base64 error:", error);
    throw error;
  }
};

// ==========================================
// SIGNATURE REQUESTS SERVICES
// ==========================================

export const getSignatureRequests = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/signature-requests?${queryParams}`);
  return res?.data;
};

export const createSignatureRequest = async (data) => {
  const res = await esignBkdApi.post(`/signature-requests`, data);
  return res?.data;
};

export const getSignatureRequestById = async (id) => {
  const res = await esignBkdApi.get(`/signature-requests/${id}`);
  return res?.data;
};

export const updateSignatureRequest = async (id, data) => {
  const res = await esignBkdApi.put(`/signature-requests/${id}`, data);
  return res?.data;
};

export const cancelSignatureRequest = async (id) => {
  const res = await esignBkdApi.post(`/signature-requests/${id}/cancel`);
  return res?.data;
};

export const getWorkflowStatus = async (id) => {
  const res = await esignBkdApi.get(`/signature-requests/${id}/workflow`);
  return res?.data;
};

export const completeSignatureRequest = async (id) => {
  const res = await esignBkdApi.post(`/signature-requests/${id}/complete`);
  return res?.data;
};

export const getSignatureRequestStats = async () => {
  const res = await esignBkdApi.get(`/signature-requests/stats`);
  return res?.data;
};

// ==========================================
// DASHBOARD SERVICES
// ==========================================

export const getPendingDocuments = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/dashboard/pending?${queryParams}`);
  return res?.data;
};

export const getMarkedForTteDocuments = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/dashboard/marked-for-tte?${queryParams}`);
  return res?.data;
};

export const getRejectedDocuments = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/dashboard/rejected?${queryParams}`);
  return res?.data;
};

export const getCompletedDocuments = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/dashboard/completed?${queryParams}`);
  return res?.data;
};

export const getMarkedCount = async () => {
  const res = await esignBkdApi.get(`/dashboard/marked-count`);
  return res?.data;
};

// ==========================================
// WORKFLOW ACTIONS SERVICES
// ==========================================

export const reviewDocument = async (id, data) => {
  const res = await esignBkdApi.post(`/actions/${id}/review`, data);
  return res?.data;
};

export const markForTte = async (id, data) => {
  const res = await esignBkdApi.post(`/actions/${id}/mark-for-tte`, data);
  return res?.data;
};

export const signDocument = async (id, data) => {
  const res = await esignBkdApi.post(`/actions/${id}/sign`, data);
  return res?.data;
};

export const rejectDocument = async (id, data) => {
  const res = await esignBkdApi.post(`/actions/${id}/reject`, data);
  return res?.data;
};

export const updateSignaturePosition = async (id, data) => {
  const res = await esignBkdApi.put(`/actions/${id}/update-position`, data);
  return res?.data;
};

// ==========================================
// DOCUMENT HISTORY SERVICES
// ==========================================

export const getDocumentHistory = async (documentId) => {
  const res = await esignBkdApi.get(`/history/${documentId}`);
  return res?.data;
};

// ==========================================
// BSRE TRANSACTIONS SERVICES
// ==========================================

export const getBsreTransactions = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/bsre-transactions?${queryParams}`);
  return res?.data;
};

export const createBsreTransaction = async (data) => {
  const res = await esignBkdApi.post(`/bsre-transactions`, data);
  return res?.data;
};

export const getBsreTransactionById = async (id) => {
  const res = await esignBkdApi.get(`/bsre-transactions/${id}`);
  return res?.data;
};

export const sendToBsreForSigning = async (id, data) => {
  const res = await esignBkdApi.post(`/bsre-transactions/${id}/sign`, data);
  return res?.data;
};

export const retryBsreTransaction = async (id, data) => {
  const res = await esignBkdApi.post(`/bsre-transactions/${id}/retry`, data);
  return res?.data;
};

export const checkBsreStatus = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(
    `/bsre-transactions/check-status?${queryParams}`
  );
  return res?.data;
};

export const getBsreTransactionStats = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/bsre-transactions/stats?${queryParams}`);
  return res?.data;
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Create FormData for file upload
export const createDocumentFormData = (data, file) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description || "");
  formData.append("is_public", data.is_public || false);

  if (file) {
    formData.append("file", file);
  }

  return formData;
};

// Handle download response
export const handleDownloadResponse = (data, filename) => {
  if (data.data && data.data.content) {
    // Convert base64 to blob for download
    const byteCharacters = atob(data.data.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || data.data.filename || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

// Handle preview response
export const handlePreviewResponse = (blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  return url;
};

// ==========================================
// USERS SERVICES
// ==========================================

export const getUsers = async (params = {}) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  const res = await esignBkdApi.get(`/users?${queryParams}`);
  return res?.data;
};
