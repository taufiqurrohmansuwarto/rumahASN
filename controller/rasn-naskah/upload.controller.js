/**
 * Upload Controller - RASN Naskah
 * Handle document file uploads with parsing
 */

const crypto = require("crypto");
const { handleError } = require("@/utils/helper/controller-helper");
const Documents = require("@/models/rasn-naskah/documents.model");
const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
const DocumentAttachments = require("@/models/rasn-naskah/document-attachments.model");
const DocumentActivities = require("@/models/rasn-naskah/document-activities.model");
const {
  parseDocument,
  isSupportedFile,
  getFileType,
} = require("@/utils/document-services");

// MinIO upload helper
const {
  uploadFileToMinio,
  generatePublicUrl,
} = require("@/utils/helper/minio-helper");

// Background job for AI formatting
const { addFormatMarkdownJob } = require("@/jobs/queue");

const isProduction = process.env.NODE_ENV === "production";
const MINIO_BUCKET = "public";
const NASKAH_FOLDER = "rasn-naskah";

/**
 * Upload document file and extract text
 */
const uploadDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;
    const file = req?.file;

    if (!file) {
      return res.status(400).json({ message: "File wajib diupload" });
    }

    // Check file type
    if (!isSupportedFile(file.originalname)) {
      return res.status(400).json({
        message:
          "Tipe file tidak didukung. Gunakan PDF, DOCX, XLSX, PPTX, atau gambar.",
      });
    }

    // Generate unique filename
    const fileId = crypto.randomBytes(16).toString("hex");
    const ext = file.originalname.split(".").pop();
    const filename = `${NASKAH_FOLDER}/documents/${userId}/${fileId}.${ext}`;

    // Metadata for MinIO
    const metadata = {
      "Content-Type": file.mimetype,
      "uploaded-by": userId,
      "uploaded-at": new Date().toISOString(),
      "original-filename": file.originalname,
      "file-size": file.size.toString(),
    };

    // Upload to MinIO
    await uploadFileToMinio(
      mc,
      MINIO_BUCKET,
      file.buffer,
      filename,
      file.size,
      file.mimetype,
      metadata
    );

    const fileUrl = generatePublicUrl(filename, MINIO_BUCKET);

    // Parse document to extract text
    let extractedText = null;
    let parseMetadata = {};
    let needsFormatting = false;

    try {
      const parseResult = await parseDocument(file.buffer, file.originalname, {
        clean: true,
        removeHeaders: false,
        piiPreset: "none", // Don't redact for internal documents
      });

      if (parseResult.success) {
        extractedText = parseResult.content;
        parseMetadata = {
          pages: parseResult.pages,
          file_type: parseResult.file_type,
          tables: parseResult.tables?.length || 0,
        };

        // Check if content needs AI formatting
        if (extractedText && extractedText.length > 50) {
          needsFormatting = true;
        }
      }
    } catch (parseError) {
      console.warn("Failed to parse document:", parseError.message);
      // Continue without extracted text
    }

    // Determine category from file type
    const fileType = getFileType(file.originalname);

    // Create document record with raw content first
    // AI formatting will happen in background job
    const document = await Documents.query().insert({
      user_id: userId,
      title: file.originalname.replace(/\.[^/.]+$/, ""), // Remove extension
      source_type: "upload",
      original_file_url: fileUrl,
      original_file_name: file.originalname,
      original_file_type: file.mimetype,
      original_file_size: file.size,
      extracted_text: extractedText, // Keep original extracted text
      content: extractedText, // Initially use raw content, will be formatted by background job
      content_status: needsFormatting ? "formatting" : "ready", // Track formatting status
      status: "draft",
    });

    // Create initial version if text was extracted
    if (extractedText) {
      await DocumentVersions.query().insert({
        document_id: document.id,
        version_number: 1,
        content: extractedText,
        change_summary: "Upload awal (raw)",
        created_by: userId,
      });

      await Documents.query()
        .findById(document.id)
        .patch({ revision_count: 1 });
    }

    // Queue background job for AI formatting if needed
    if (needsFormatting) {
      try {
        console.log(
          `📝 [UPLOAD] Queueing AI formatting job for: ${file.originalname}`
        );
        await addFormatMarkdownJob(
          document.id,
          extractedText,
          file.originalname
        );
      } catch (jobError) {
        console.error("Failed to queue formatting job:", jobError.message);
        // Update status to ready since job failed to queue
        await Documents.query()
          .findById(document.id)
          .patch({ content_status: "ready" });
      }
    }

    // Log activity
    await DocumentActivities.log(
      document.id,
      userId,
      "uploaded",
      {
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        ...parseMetadata,
      },
      `File "${file.originalname}" diupload`
    );

    res.status(201).json({
      document,
      extracted: !!extractedText,
      formatting: needsFormatting, // Let client know formatting is in progress
      metadata: parseMetadata,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Upload attachment to existing document
 */
const uploadAttachment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;
    const { documentId } = req?.query;
    const file = req?.file;

    if (!file) {
      return res.status(400).json({ message: "File wajib diupload" });
    }

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Generate unique filename for attachment
    const fileId = crypto.randomBytes(16).toString("hex");
    const ext = file.originalname.split(".").pop();
    const filename = `${NASKAH_FOLDER}/attachments/${documentId}/${fileId}.${ext}`;

    // Metadata for MinIO
    const metadata = {
      "Content-Type": file.mimetype,
      "uploaded-by": userId,
      "uploaded-at": new Date().toISOString(),
      "original-filename": file.originalname,
      "document-id": documentId,
    };

    // Upload to MinIO
    await uploadFileToMinio(
      mc,
      MINIO_BUCKET,
      file.buffer,
      filename,
      file.size,
      file.mimetype,
      metadata
    );

    const fileUrl = generatePublicUrl(filename, MINIO_BUCKET);

    // Create attachment record
    const attachment = await DocumentAttachments.query().insert({
      document_id: documentId,
      file_name: file.originalname,
      file_url: fileUrl,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
    });

    res.status(201).json(attachment);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete attachment
 */
const deleteAttachment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { attachmentId } = req?.query;

    const attachment = await DocumentAttachments.query()
      .findById(attachmentId)
      .withGraphFetched("document");

    if (!attachment) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    if (attachment.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // TODO: Delete from MinIO

    await DocumentAttachments.query().deleteById(attachmentId);

    res.json({ message: "Lampiran berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get document attachments
 */
const getAttachments = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const attachments = await DocumentAttachments.query()
      .where("document_id", documentId)
      .withGraphFetched("uploader(simpleWithImage)")
      .orderBy("created_at", "desc");

    res.json(attachments);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Re-parse uploaded document
 */
const reparseDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (!document.original_file_url) {
      return res.status(400).json({
        message: "Dokumen tidak memiliki file yang dapat di-parse ulang",
      });
    }

    // TODO: Download file from MinIO and re-parse
    // For now, return error
    return res.status(501).json({
      message: "Fitur re-parse belum diimplementasikan",
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  uploadDocument,
  uploadAttachment,
  deleteAttachment,
  getAttachments,
  reparseDocument,
};
