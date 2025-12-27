const { default: axios } = require("axios");
const FormData = require("form-data");

// Base URL untuk document service
const DOC_SERVICE_URL = process.env.DOC_SERVICE_URL || "http://localhost:5151";

// Create axios instance dengan default config
const docServiceClient = axios.create({
  baseURL: DOC_SERVICE_URL,
  timeout: 120000, // 2 menit timeout untuk file besar
});

/**
 * PII Redaction Presets
 * @typedef {'minimal'|'asn'|'kontak'|'keuangan'|'identitas'|'lengkap'|'semua'|'none'} PIIPreset
 */

/**
 * Health check untuk document service
 * @returns {Promise<{status: string, service: string}>}
 */
const healthCheck = async () => {
  const response = await docServiceClient.get("/health");
  return response.data;
};

/**
 * Parse dokumen dengan auto-detect format
 * Mendukung: PDF, DOCX, XLSX, PPTX, dan gambar
 *
 * @param {Buffer|ReadStream} file - File buffer atau stream
 * @param {string} filename - Nama file dengan ekstensi
 * @param {Object} options - Opsi parsing
 * @param {boolean} [options.clean=true] - Bersihkan HTML entities
 * @param {boolean} [options.removeHeaders=false] - Hapus markdown headers
 * @param {PIIPreset} [options.piiPreset='asn'] - Preset PII redaction
 * @returns {Promise<{success: boolean, filename: string, file_type: string, content: string, tables: Array, metadata: Object, pages: number}>}
 */
const parseDocument = async (file, filename, options = {}) => {
  const { clean = true, removeHeaders = false, piiPreset = "asn" } = options;

  const formData = new FormData();
  formData.append("file", file, filename);

  const params = new URLSearchParams();
  params.append("clean", clean);
  params.append("remove_headers", removeHeaders);
  params.append("pii_preset", piiPreset);

  const response = await docServiceClient.post(
    `/parse?${params.toString()}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  return response.data;
};

/**
 * Parse dokumen dari URL
 *
 * @param {string} url - URL dokumen
 * @param {Object} options - Opsi parsing
 * @param {boolean} [options.clean=true] - Bersihkan HTML entities
 * @param {boolean} [options.removeHeaders=false] - Hapus markdown headers
 * @param {PIIPreset} [options.piiPreset='asn'] - Preset PII redaction
 * @returns {Promise<{success: boolean, filename: string, file_type: string, content: string, tables: Array, metadata: Object, pages: number}>}
 */
const parseDocumentFromUrl = async (url, options = {}) => {
  const { clean = true, removeHeaders = false, piiPreset = "asn" } = options;

  const params = new URLSearchParams();
  params.append("clean", clean);
  params.append("remove_headers", removeHeaders);
  params.append("pii_preset", piiPreset);

  const response = await docServiceClient.post(
    `/parse/url?${params.toString()}`,
    { url },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * OCR khusus untuk gambar (tanpa post-processing)
 * Mendukung: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
 *
 * @param {Buffer|ReadStream} file - File gambar buffer atau stream
 * @param {string} filename - Nama file dengan ekstensi
 * @returns {Promise<{success: boolean, text: string, confidence: number}>}
 */
const ocrImage = async (file, filename) => {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await docServiceClient.post("/ocr", formData, {
    headers: {
      ...formData.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

/**
 * OCR gambar dari URL
 *
 * @param {string} url - URL gambar
 * @returns {Promise<{success: boolean, text: string, confidence: number}>}
 */
const ocrImageFromUrl = async (url) => {
  const response = await docServiceClient.post(
    "/ocr/url",
    { url },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Konversi dokumen Word (DOCX) ke PDF
 *
 * @param {Buffer|ReadStream} file - File DOCX buffer atau stream
 * @param {string} filename - Nama file dengan ekstensi .docx
 * @returns {Promise<Buffer>} - PDF buffer
 */
const convertDocxToPdf = async (file, filename) => {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await docServiceClient.post(
    "/convert/docx-to-pdf",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  return Buffer.from(response.data);
};

/**
 * Ekstrak hanya tabel dari dokumen
 *
 * @param {Buffer|ReadStream} file - File buffer atau stream
 * @param {string} filename - Nama file dengan ekstensi
 * @returns {Promise<{success: boolean, tables: Array}>}
 */
const extractTables = async (file, filename) => {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await docServiceClient.post("/extract-tables", formData, {
    headers: {
      ...formData.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

/**
 * Helper: Cek apakah file adalah gambar berdasarkan ekstensi
 *
 * @param {string} filename - Nama file
 * @returns {boolean}
 */
const isImageFile = (filename) => {
  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".tiff",
    ".tif",
    ".webp",
  ];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return imageExtensions.includes(ext);
};

/**
 * Helper: Cek apakah file didukung oleh service
 *
 * @param {string} filename - Nama file
 * @returns {boolean}
 */
const isSupportedFile = (filename) => {
  const supportedExtensions = [
    ".pdf",
    ".docx",
    ".xlsx",
    ".xls",
    ".pptx",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".tiff",
    ".tif",
    ".webp",
  ];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return supportedExtensions.includes(ext);
};

/**
 * Helper: Get file type dari filename
 *
 * @param {string} filename - Nama file
 * @returns {string|null}
 */
const getFileType = (filename) => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  const typeMap = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".xlsx": "xlsx",
    ".xls": "xls",
    ".pptx": "pptx",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".gif": "image",
    ".bmp": "image",
    ".tiff": "image",
    ".tif": "image",
    ".webp": "image",
  };
  return typeMap[ext] || null;
};

module.exports = {
  // Main functions
  healthCheck,
  parseDocument,
  parseDocumentFromUrl,
  ocrImage,
  ocrImageFromUrl,
  convertDocxToPdf,
  extractTables,

  // Helper functions
  isImageFile,
  isSupportedFile,
  getFileType,

  // Export client untuk custom usage
  docServiceClient,
};
