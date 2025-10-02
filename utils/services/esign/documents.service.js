/**
 * Esign Documents Service
 * Business logic for document management
 */

import {
  uploadEsignDocument,
  downloadEsignDocument,
  checkEsignDocumentExists,
  deleteEsignDocument,
  getEsignDocumentPath,
  generateEsignDocumentUrl,
} from "@/utils/helper/minio-helper";

const Documents = require("@/models/esign/esign-documents.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const crypto = require("crypto");
const { addFooterToPdf, getTotalPages } = require("./pdf.service");

// ==========================================
// DOCUMENT CRUD SERVICES
// ==========================================

/**
 * Create new document
 * @param {Object} data - Document data
 * @param {Object} file - File object
 * @param {String} userId - User ID
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - Created document with file URL
 */
export const createDocument = async (data, file, userId, mc) => {
  const { title, description, is_public = false } = data;

  if (!file) {
    throw new Error("File dokumen wajib diupload");
  }

  // Validate PDF file
  if (file.mimetype !== "application/pdf") {
    throw new Error("File harus berformat PDF");
  }

  // Generate document code first (needed for footer)
  const documentCode = `DOC-${new Date().getFullYear()}-${Date.now()}`;
  let totalPages = 0;

  // Add footer to PDF before upload
  let processedFileBuffer;
  try {
    const pdfWithFooter = await addFooterToPdf(file.buffer, documentCode);
    totalPages = await getTotalPages(pdfWithFooter);
    processedFileBuffer = Buffer.from(pdfWithFooter);
  } catch (error) {
    console.error("Error adding footer to PDF:", error);
    throw new Error("Gagal menambahkan footer ke dokumen PDF");
  }

  // Generate file hash from processed file
  const fileHash = crypto
    .createHash("sha256")
    .update(processedFileBuffer)
    .digest("hex");

  // Generate filename
  const filename = getEsignDocumentPath(documentCode, file.originalname);

  // Upload processed file to Minio
  await uploadEsignDocument(
    mc,
    processedFileBuffer,
    file.originalname,
    documentCode,
    processedFileBuffer.length,
    file.mimetype,
    userId
  );

  // Save document to database
  const document = await Documents.query().insert({
    document_code: documentCode,
    title,
    description,
    file_path: filename,
    file_hash: fileHash,
    file_size: processedFileBuffer.length,
    is_public,
    status: "draft",
    created_by: userId,
    total_pages: totalPages,
  });

  return {
    ...document,
    file_url: generateEsignDocumentUrl(document.file_path),
  };
};

/**
 * Get documents with pagination and filters
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Documents with pagination
 */
export const getDocuments = async (userId, filters = {}) => {
  const { page = 1, limit = 10, status, search, is_public } = filters;

  let query = Documents.query().select([
    "id",
    "document_code",
    "title",
    "description",
    "file_size",
    "is_public",
    "status",
    "created_at",
    "updated_at",
  ]);

  // Filter berdasarkan user (hanya dokumen yang dibuat user)
  query = query.where("created_by", userId);

  if (status) {
    query = query.where("status", status);
  }

  if (is_public !== undefined) {
    query = query.where("is_public", is_public === "true");
  }

  if (search) {
    query = query.where((builder) => {
      builder
        .where("title", "ilike", `%${search}%`)
        .orWhere("description", "ilike", `%${search}%`)
        .orWhere("document_code", "ilike", `%${search}%`);
    });
  }

  const result = await query
    .orderBy("created_at", "desc")
    .withGraphFetched("[user(simpleWithImage)]")
    .page(parseInt(page) - 1, parseInt(limit));

  // Add file URLs to results
  const dataWithUrls = result.results.map((doc) => ({
    ...doc,
    file_url: generateEsignDocumentUrl(doc.file_path),
  }));

  return {
    data: dataWithUrls,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
      totalPages: Math.ceil(result.total / parseInt(limit)),
    },
  };
};

/**
 * Get document by ID
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Document with file URL
 */
export const getDocumentById = async (documentId, userId) => {
  const document = await Documents.query()
    .findById(documentId)
    .withGraphFetched("[signature_requests.[signature_details]]");

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  // Check access permission
  if (document.created_by !== userId && !document.is_public) {
    throw new Error("Tidak memiliki akses ke dokumen ini");
  }

  return {
    ...document,
    file_url: generateEsignDocumentUrl(document.file_path),
  };
};

/**
 * Update document
 * @param {String} documentId - Document ID
 * @param {Object} data - Update data
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Updated document with file URL
 */
export const updateDocument = async (documentId, data, userId) => {
  const { title, description, is_public } = data;

  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk mengubah dokumen ini");
  }

  if (document.status !== "draft") {
    throw new Error("Hanya dokumen dengan status draft yang dapat diubah");
  }

  const updatedDocument = await Documents.query().patchAndFetchById(
    documentId,
    {
      title: title || document.title,
      description: description || document.description,
      is_public: is_public !== undefined ? is_public : document.is_public,
      updated_at: new Date(),
    }
  );

  return {
    ...updatedDocument,
    file_url: generateEsignDocumentUrl(updatedDocument.file_path),
  };
};

/**
 * Delete document
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @param {Object} mc - Minio client
 * @returns {Promise<Boolean>} - Success status
 */
export const deleteDocument = async (documentId, userId, mc) => {
  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk menghapus dokumen ini");
  }

  if (document.status !== "draft") {
    throw new Error("Hanya dokumen dengan status draft yang dapat dihapus");
  }

  // Check if document has signature requests
  const signatureRequests = await SignatureRequests.query().where(
    "document_id",
    documentId
  );
  if (signatureRequests.length > 0) {
    throw new Error(
      "Dokumen tidak dapat dihapus karena sudah memiliki pengajuan TTE"
    );
  }

  // Delete file from Minio
  try {
    await deleteEsignDocument(mc, document.file_path);
  } catch (error) {
    console.log("Error deleting file from Minio:", error);
    // Continue with database deletion even if file deletion fails
  }

  await Documents.query().deleteById(documentId);

  return true;
};

// ==========================================
// FILE OPERATIONS SERVICES
// ==========================================

/**
 * Download document file
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - File data with base64 content
 */
export const downloadDocumentFile = async (documentId, userId, mc) => {
  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  // Check access permission
  if (document.created_by !== userId && !document.is_public) {
    throw new Error("Tidak memiliki akses ke dokumen ini");
  }

  // Check if file exists in Minio
  const fileExists = await checkEsignDocumentExists(mc, document.file_path);
  if (!fileExists) {
    throw new Error("File dokumen tidak ditemukan");
  }

  // Get file as base64 from Minio
  const base64File = await downloadEsignDocument(mc, document.file_path);

  return {
    filename: `${document.document_code}.pdf`,
    content: base64File,
    document_code: document.document_code,
  };
};

/**
 * Preview document file
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @param {Object} mc - Minio client
 * @returns {Promise<Buffer>} - File buffer for preview
 */
export const previewDocumentFile = async (documentId, userId, mc) => {
  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  // Check access permission
  if (document.created_by !== userId && !document.is_public) {
    throw new Error("Tidak memiliki akses ke dokumen ini");
  }

  // Check if file exists in Minio
  const fileExists = await checkEsignDocumentExists(mc, document.file_path);
  if (!fileExists) {
    throw new Error("File dokumen tidak ditemukan");
  }

  // Get file as base64 from Minio and convert to buffer
  const base64File = await downloadEsignDocument(mc, document.file_path);
  const fileBuffer = Buffer.from(base64File, "base64");

  return {
    fileBuffer,
    totalPages: document.total_pages,
  };
};

// ==========================================
// VALIDATION SERVICES
// ==========================================

/**
 * Validate document access
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Document if accessible
 */
export const validateDocumentAccess = async (documentId, userId) => {
  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.created_by !== userId && !document.is_public) {
    throw new Error("Tidak memiliki akses ke dokumen ini");
  }

  return document;
};

/**
 * Validate document can be modified
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Document if modifiable
 */
export const validateDocumentModifiable = async (documentId, userId) => {
  const document = await validateDocumentAccess(documentId, userId);

  if (document.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk mengubah dokumen ini");
  }

  if (document.status !== "draft") {
    throw new Error("Hanya dokumen dengan status draft yang dapat diubah");
  }

  return document;
};

/**
 * Check if document has signature requests
 * @param {String} documentId - Document ID
 * @returns {Promise<Boolean>} - True if has signature requests
 */
export const hasSignatureRequests = async (documentId) => {
  const signatureRequests = await SignatureRequests.query().where(
    "document_id",
    documentId
  );
  return signatureRequests.length > 0;
};

// ==========================================
// UTILITY SERVICES
// ==========================================

/**
 * Generate unique document code
 * @returns {String} - Unique document code
 */
export const generateDocumentCode = () => {
  return `DOC-${new Date().getFullYear()}-${Date.now()}`;
};

/**
 * Get document statistics for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Document statistics
 */
export const getDocumentStats = async (userId) => {
  const stats = await Documents.query()
    .where("created_by", userId)
    .select("status")
    .groupBy("status")
    .count("* as count");

  const result = {
    total: 0,
    draft: 0,
    in_progress: 0,
    signed: 0,
    rejected: 0,
    cancelled: 0,
  };

  stats.forEach((stat) => {
    const status = stat.status;
    const count = parseInt(stat.count);
    result[status] = count;
    result.total += count;
  });

  return result;
};
