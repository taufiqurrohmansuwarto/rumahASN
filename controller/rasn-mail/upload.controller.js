// controller/rasn-mail/upload.controller.js
import { handleError } from "@/utils/helper/controller-helper";
import { nanoid } from "nanoid";
import path from "path";
require("dotenv").config();

// Konfigurasi upload
const UPLOAD_CONFIG = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedMimeTypes: [
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
  ],
  bucketName: "public", // Fixed bucket name
  emailsFolder: "emails",
};

// Utility untuk generate safe filename dengan structure folder
const generateSafeFilename = (originalName, userId) => {
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9\-_]/g, "_")
    .substring(0, 50);

  const timestamp = Date.now();
  const uniqueId = nanoid(8); // Gunakan nanoid

  // Structure: emails/userId/timestamp_uniqueId_filename.ext
  return `${UPLOAD_CONFIG.emailsFolder}/${userId}/${timestamp}_${uniqueId}_${safeName}${extension}`;
};

// MinIO upload utility
const uploadToMinio = (
  mc,
  fileBuffer,
  filename,
  size,
  mimetype,
  metadata = {}
) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      UPLOAD_CONFIG.bucketName,
      filename,
      fileBuffer,
      size,
      {
        "Content-Type": mimetype,
        ...metadata,
      },
      function (err, info) {
        if (err) {
          console.error("MinIO upload error:", err);
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

// MinIO delete utility
const deleteFromMinio = (mc, filename) => {
  return new Promise((resolve, reject) => {
    mc.removeObject(UPLOAD_CONFIG.bucketName, filename, function (err) {
      if (err) {
        console.error("MinIO delete error:", err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// Generate MinIO public URL
const generateMinioUrl = (filename) => {
  const baseUrl =
    process.env.MINIO_PUBLIC_URL ||
    `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
  return `${baseUrl}/${UPLOAD_CONFIG.bucketName}/${filename}`;
};

// Utility untuk format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Upload single file
export const uploadFile = async (req, res) => {
  try {
    const { customId: userId, username, department } = req.user;
    const mc = req.mc; // MinIO client dari auth middleware

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;

    // Validasi ukuran file
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File terlalu besar. Maksimal ${formatFileSize(
          UPLOAD_CONFIG.maxFileSize
        )}`,
      });
    }

    // Validasi tipe file
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Tipe file tidak didukung",
      });
    }

    // Generate safe filename dengan path structure
    const minioFilename = generateSafeFilename(file.originalname, userId);

    // Metadata untuk MinIO
    const metadata = {
      "X-Amz-Meta-Uploaded-By": userId,
      "X-Amz-Meta-Username": username || "unknown",
      "X-Amz-Meta-Department": department || "unknown",
      "X-Amz-Meta-Original-Name": file.originalname,
      "X-Amz-Meta-Upload-Date": new Date().toISOString(),
    };

    // Upload ke MinIO
    await uploadToMinio(
      mc,
      file.buffer,
      minioFilename,
      file.size,
      file.mimetype,
      metadata
    );

    // Generate URL untuk akses file
    const fileUrl = generateMinioUrl(minioFilename);

    // Simpan info file ke database
    const Attachment = require("@/models/rasn_mail/attachments.model");
    const attachment = await Attachment.query().insert({
      file_name: file.originalname,
      file_url: fileUrl,
      file_path: minioFilename, // Store MinIO path untuk deletion
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: userId,
      upload_status: "completed",
    });

    res.status(201).json({
      success: true,
      data: {
        id: attachment.id,
        filename: file.originalname,
        url: fileUrl,
        path: minioFilename,
        size: file.size,
        mimetype: file.mimetype,
        formatted_size: formatFileSize(file.size),
      },
      message: "File berhasil diunggah",
    });
  } catch (error) {
    console.error("Upload error:", error);
    handleError(res, error);
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    const { customId: userId, username, department } = req.user;
    const mc = req.mc; // MinIO client dari auth middleware

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const files = req.files;
    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validasi per file
        if (file.size > UPLOAD_CONFIG.maxFileSize) {
          errors.push({
            filename: file.originalname,
            error: `File terlalu besar. Maksimal ${formatFileSize(
              UPLOAD_CONFIG.maxFileSize
            )}`,
          });
          continue;
        }

        if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
          errors.push({
            filename: file.originalname,
            error: "Tipe file tidak didukung",
          });
          continue;
        }

        // Process file
        const minioFilename = generateSafeFilename(file.originalname, userId);

        // Metadata untuk MinIO
        const metadata = {
          "X-Amz-Meta-Uploaded-By": userId,
          "X-Amz-Meta-Username": username || "unknown",
          "X-Amz-Meta-Department": department || "unknown",
          "X-Amz-Meta-Original-Name": file.originalname,
          "X-Amz-Meta-Upload-Date": new Date().toISOString(),
        };

        // Upload ke MinIO
        await uploadToMinio(
          mc,
          file.buffer,
          minioFilename,
          file.size,
          file.mimetype,
          metadata
        );

        const fileUrl = generateMinioUrl(minioFilename);

        // Simpan ke database
        const Attachment = require("@/models/rasn_mail/attachments.model");
        const attachment = await Attachment.query().insert({
          file_name: file.originalname,
          file_url: fileUrl,
          file_path: minioFilename,
          file_size: file.size,
          mime_type: file.mimetype,
          uploaded_by: userId,
          upload_status: "completed",
        });

        uploadedFiles.push({
          id: attachment.id,
          filename: file.originalname,
          url: fileUrl,
          path: minioFilename,
          size: file.size,
          mimetype: file.mimetype,
          formatted_size: formatFileSize(file.size),
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: "Gagal memproses file",
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        uploaded: uploadedFiles,
        errors: errors,
        total_uploaded: uploadedFiles.length,
        total_errors: errors.length,
      },
      message: `${uploadedFiles.length} file berhasil diunggah${
        errors.length > 0 ? `, ${errors.length} file gagal` : ""
      }`,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    handleError(res, error);
  }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customId: userId } = req.user;
    const mc = req.mc; // MinIO client dari auth middleware

    const Attachment = require("@/models/rasn_mail/attachments.model");
    const attachment = await Attachment.query()
      .findById(id)
      .where("uploaded_by", userId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // Cek apakah file sudah digunakan di email
    if (attachment.email_id) {
      return res.status(400).json({
        success: false,
        message: "File tidak dapat dihapus karena sudah digunakan dalam email",
      });
    }

    // Hapus file dari MinIO
    try {
      if (attachment.file_path) {
        await deleteFromMinio(mc, attachment.file_path);
      }
    } catch (minioError) {
      console.warn("Could not delete file from MinIO:", minioError);
      // Continue dengan database deletion meski MinIO delete gagal
    }

    // Hapus dari database
    await attachment.$query().delete();

    res.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete attachment error:", error);
    handleError(res, error);
  }
};

// Get attachment info
export const getAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customId: userId } = req.user;

    const Attachment = require("@/models/rasn_mail/attachments.model");
    const attachment = await Attachment.query()
      .findById(id)
      .where("uploaded_by", userId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        id: attachment.id,
        filename: attachment.file_name,
        url: attachment.file_url,
        path: attachment.file_path,
        size: attachment.file_size,
        mimetype: attachment.mime_type,
        formatted_size: formatFileSize(attachment.file_size),
        uploaded_at: attachment.created_at,
        is_used: !!attachment.email_id,
        status: attachment.upload_status,
      },
    });
  } catch (error) {
    console.error("Get attachment error:", error);
    handleError(res, error);
  }
};

// Get user's uploaded files (unused files)
export const getUserUploads = async (req, res) => {
  try {
    const { customId: userId } = req.user;
    const {
      page = 1,
      limit = 20,
      search = "",
      include_used = false,
    } = req.query;

    const Attachment = require("@/models/rasn_mail/attachments.model");

    let query = Attachment.query().where("uploaded_by", userId);

    // Filter berdasarkan include_used
    if (!include_used || include_used === "false") {
      query = query.whereNull("email_id"); // Hanya file yang belum digunakan
    }

    // Search filter
    if (search) {
      query = query.where("file_name", "ilike", `%${search}%`);
    }

    const result = await query
      .orderBy("created_at", "desc")
      .page(parseInt(page) - 1, parseInt(limit));

    const files = result.results.map((attachment) => ({
      id: attachment.id,
      filename: attachment.file_name,
      url: attachment.file_url,
      path: attachment.file_path,
      size: attachment.file_size,
      mimetype: attachment.mime_type,
      formatted_size: formatFileSize(attachment.file_size),
      uploaded_at: attachment.created_at,
      is_used: !!attachment.email_id,
      status: attachment.upload_status,
    }));

    res.json({
      success: true,
      data: {
        files,
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get user uploads error:", error);
    handleError(res, error);
  }
};

// Generate presigned URL untuk download (optional, untuk security)
export const getDownloadUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { customId: userId } = req.user;
    const mc = req.mc;

    const Attachment = require("@/models/rasn_mail/attachments.model");
    const attachment = await Attachment.query()
      .findById(id)
      .where("uploaded_by", userId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // Generate presigned URL (expires in 1 hour)
    const presignedUrl = await new Promise((resolve, reject) => {
      mc.presignedGetObject(
        UPLOAD_CONFIG.bucketName,
        attachment.file_path,
        60 * 60,
        (err, url) => {
          if (err) reject(err);
          else resolve(url);
        }
      );
    });

    res.json({
      success: true,
      data: {
        download_url: presignedUrl,
        filename: attachment.file_name,
        expires_in: 3600, // 1 hour in seconds
      },
    });
  } catch (error) {
    console.error("Get download URL error:", error);
    handleError(res, error);
  }
};
