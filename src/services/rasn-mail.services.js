import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/rasn-mail",
});

// upload
export const uploadSingleFile = async (file, onProgress = null) => {
  console.log("📤 uploadSingleFile service called:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    onProgressProvided: !!onProgress,
  });

  const formData = new FormData();
  formData.append("file", file);

  console.log("📋 FormData created:", {
    fileAppended: formData.has("file"),
    formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
      key,
      value instanceof File ? `File: ${value.name}` : value,
    ]),
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
      console.log("📊 Upload progress event:", {
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percentCompleted,
      });
      onProgress(percentCompleted);
    };
  }

  console.log("🌐 Making API request to:", "/upload/single", {
    config,
    baseURL: api.defaults.baseURL,
  });

  try {
    const response = await api.post("/upload/single", formData, config);
    console.log("✅ API Response success:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response.data;
  } catch (error) {
    console.error("💥 API Request failed:", {
      error,
      message: error.message,
      response: error.response,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      stack: error.stack,
    });
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files, onProgress = null) => {
  const formData = new FormData();
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

// Validation functions
export const validateFileSize = (file, maxSizeMB = 25) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

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

// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

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

export const isImageFile = (mimeType) => {
  return mimeType && mimeType.startsWith("image/");
};
