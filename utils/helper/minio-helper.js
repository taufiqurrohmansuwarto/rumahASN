// Minio Helper Functions for Rumahasn Application

/**
 * Minio Helper Functions for Rumahasn Application
 * mc = minio client middleware from req.mc
 *
 * Base URL: https://siasn.bkd.jatimprov.go.id:9000
 *
 * Example URLs:
 * - Public: https://siasn.bkd.jatimprov.go.id:9000/public/rasn-signin-page.png
 * - BKD: https://siasn.bkd.jatimprov.go.id:9000/bkd/sk_pns/SK_01072025_123456.pdf
 * - Esign Documents: https://siasn.bkd.jatimprov.go.id:9000/public/esign/documents/DOC-2024-123_filename.pdf
 * - Signed Documents: https://siasn.bkd.jatimprov.go.id:9000/public/esign/signed/DOC-2024-123_filename.pdf
 */

// ==========================================
// UPLOAD FUNCTIONS
// ==========================================

/**
 * Upload file to Minio bucket with buffer
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - File name with path
 * @param {Number} size - File size
 * @param {String} mimetype - File MIME type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise}
 */
export const uploadFileToMinio = (mc, bucket, fileBuffer, filename, size, mimetype, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const defaultMetadata = {
      "Content-Type": mimetype,
      ...metadata
    };

    mc.putObject(
      bucket,
      filename,
      fileBuffer,
      size,
      defaultMetadata,
      function (err, info) {
        if (err) {
          console.error("Minio upload error:", err);
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

/**
 * Upload file to public bucket (default)
 * @param {Object} mc - Minio client
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - File name with path
 * @param {Number} size - File size
 * @param {String} mimetype - File MIME type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise}
 */
export const uploadFilePublic = (mc, fileBuffer, filename, size, mimetype, metadata = {}) => {
  return uploadFileToMinio(mc, "public", fileBuffer, filename, size, mimetype, metadata);
};

/**
 * Upload file to bkd bucket
 * @param {Object} mc - Minio client
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - File name with path
 * @param {Number} size - File size
 * @param {String} mimetype - File MIME type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise}
 */
export const uploadFileBkd = (mc, fileBuffer, filename, size, mimetype, metadata = {}) => {
  return uploadFileToMinio(mc, "bkd", fileBuffer, filename, size, mimetype, metadata);
};

/**
 * Upload esign document
 * @param {Object} mc - Minio client
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - Original filename
 * @param {String} documentCode - Document code
 * @param {Number} size - File size
 * @param {String} mimetype - File MIME type
 * @param {String} userId - User ID for metadata
 * @returns {Promise}
 */
export const uploadEsignDocument = (mc, fileBuffer, filename, documentCode, size, mimetype, userId) => {
  const esignPath = `esign/documents/${documentCode}_${filename}`;
  const metadata = {
    "Content-Type": mimetype,
    "uploaded-by": userId,
    "document-code": documentCode,
    "upload-date": new Date().toISOString()
  };

  return uploadFileToMinio(mc, "public", fileBuffer, esignPath, size, mimetype, metadata);
};

/**
 * Upload signed document
 * @param {Object} mc - Minio client
 * @param {Buffer} fileBuffer - Signed file buffer
 * @param {String} originalPath - Original document path
 * @param {String} signatureId - Signature ID
 * @param {String} userId - User who signed
 * @returns {Promise}
 */
export const uploadSignedDocument = (mc, fileBuffer, originalPath, signatureId, userId) => {
  const signedPath = originalPath.replace("esign/documents/", "esign/signed/");
  const metadata = {
    "Content-Type": "application/pdf",
    "signed-by": userId,
    "signature-id": signatureId,
    "signed-date": new Date().toISOString(),
    "original-path": originalPath
  };

  return uploadFileToMinio(mc, "public", fileBuffer, signedPath, fileBuffer.length, "application/pdf", metadata);
};

// ==========================================
// DOWNLOAD FUNCTIONS
// ==========================================

/**
 * Download file from Minio as base64
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<String>} - Base64 string
 */
export const downloadFileAsBase64 = (mc, bucket, filename) => {
  return new Promise((resolve, reject) => {
    console.log(`      [downloadFileAsBase64] Getting object from bucket: ${bucket}, file: ${filename}`);

    mc.getObject(bucket, filename, function (err, dataStream) {
      if (err) {
        console.error("      [downloadFileAsBase64] Minio download error:", err);
        reject(err);
      } else {
        console.log("      [downloadFileAsBase64] Stream received, reading data...");
        let fileBuffer = [];
        let chunkCount = 0;

        dataStream.on("data", function (chunk) {
          chunkCount++;
          fileBuffer.push(chunk);
          if (chunkCount % 10 === 0) {
            console.log(`      [downloadFileAsBase64] Received ${chunkCount} chunks...`);
          }
        });

        dataStream.on("end", function () {
          console.log(`      [downloadFileAsBase64] Stream ended. Total chunks: ${chunkCount}`);
          const chunks = Buffer.concat(fileBuffer);
          console.log(`      [downloadFileAsBase64] Buffer size: ${chunks.length} bytes`);
          const base64 = Buffer.from(chunks).toString("base64");
          console.log(`      [downloadFileAsBase64] Base64 size: ${base64.length} chars`);
          resolve(base64);
        });

        dataStream.on("error", function(streamErr) {
          console.error("      [downloadFileAsBase64] Stream error:", streamErr);
          reject(streamErr);
        });
      }
    });
  });
};

/**
 * Download file from Minio as Buffer
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<Buffer>} - File buffer
 */
export const downloadFileAsBuffer = (mc, bucket, filename) => {
  return new Promise((resolve, reject) => {
    mc.getObject(bucket, filename, function (err, dataStream) {
      if (err) {
        console.error("Minio download error:", err);
        reject(err);
      } else {
        let fileBuffer = [];
        dataStream.on("data", function (chunk) {
          fileBuffer.push(chunk);
        });
        dataStream.on("end", function () {
          const buffer = Buffer.concat(fileBuffer);
          resolve(buffer);
        });
        dataStream.on("error", reject);
      }
    });
  });
};

/**
 * Download file from public bucket as base64
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise<String>} - Base64 string
 */
export const downloadFilePublic = (mc, filename) => {
  return downloadFileAsBase64(mc, "public", filename);
};

/**
 * Download file from bkd bucket as base64
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise<String>} - Base64 string
 */
export const downloadFileBkd = (mc, filename) => {
  return downloadFileAsBase64(mc, "bkd", filename);
};

/**
 * Get file stream from Minio
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<Object>} - File stream
 */
export const getFileStream = async (mc, bucket, filename) => {
  try {
    const stream = await mc.getObject(bucket, filename);
    return stream;
  } catch (error) {
    console.error("Error getting file stream:", error);
    throw error;
  }
};

// ==========================================
// FILE OPERATIONS
// ==========================================

/**
 * Check if file exists in Minio
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<Object|null>} - File stat or null if not found
 */
export const checkFileExists = (mc, bucket, filename) => {
  return new Promise((resolve, reject) => {
    mc.statObject(bucket, filename, function (err, stat) {
      if (err) {
        if (err.code === "NotFound" || err.code === "NoSuchKey") {
          resolve(null);
        } else {
          reject(err);
        }
      } else {
        resolve(stat);
      }
    });
  });
};

/**
 * Check if file exists in public bucket
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise<Object|null>} - File stat or null if not found
 */
export const checkFileExistsPublic = (mc, filename) => {
  return checkFileExists(mc, "public", filename);
};

/**
 * Check if file exists in bkd bucket
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise<Object|null>} - File stat or null if not found
 */
export const checkFileExistsBkd = (mc, filename) => {
  return checkFileExists(mc, "bkd", filename);
};

/**
 * Delete file from Minio
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise}
 */
export const deleteFile = (mc, bucket, filename) => {
  return new Promise((resolve, reject) => {
    mc.removeObject(bucket, filename, function (err) {
      if (err) {
        console.error("Minio delete error:", err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Delete file from public bucket
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise}
 */
export const deleteFilePublic = (mc, filename) => {
  return deleteFile(mc, "public", filename);
};

/**
 * Delete file from bkd bucket
 * @param {Object} mc - Minio client
 * @param {String} filename - File path
 * @returns {Promise}
 */
export const deleteFileBkd = (mc, filename) => {
  return deleteFile(mc, "bkd", filename);
};

/**
 * Copy file within Minio
 * @param {Object} mc - Minio client
 * @param {String} sourceBucket - Source bucket
 * @param {String} sourceFile - Source file path
 * @param {String} destBucket - Destination bucket
 * @param {String} destFile - Destination file path
 * @returns {Promise}
 */
export const copyFile = (mc, sourceBucket, sourceFile, destBucket, destFile) => {
  return new Promise((resolve, reject) => {
    const copyConditions = new mc.CopyConditions();

    mc.copyObject(
      destBucket,
      destFile,
      `/${sourceBucket}/${sourceFile}`,
      copyConditions,
      function (err, data) {
        if (err) {
          console.error("Minio copy error:", err);
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

/**
 * Move file within Minio (copy + delete)
 * @param {Object} mc - Minio client
 * @param {String} sourceBucket - Source bucket
 * @param {String} sourceFile - Source file path
 * @param {String} destBucket - Destination bucket
 * @param {String} destFile - Destination file path
 * @returns {Promise}
 */
export const moveFile = async (mc, sourceBucket, sourceFile, destBucket, destFile) => {
  try {
    // Copy file to destination
    await copyFile(mc, sourceBucket, sourceFile, destBucket, destFile);

    // Delete source file
    await deleteFile(mc, sourceBucket, sourceFile);

    return true;
  } catch (error) {
    console.error("Error moving file:", error);
    throw error;
  }
};

// ==========================================
// ESIGN SPECIFIC FUNCTIONS
// ==========================================

/**
 * Get esign document path
 * @param {String} documentCode - Document code
 * @param {String} filename - Original filename
 * @returns {String} - Full path
 */
export const getEsignDocumentPath = (documentCode, filename) => {
  return `esign/documents/${documentCode}_${filename}`;
};

/**
 * Get signed document path
 * @param {String} documentCode - Document code
 * @param {String} filename - Original filename
 * @returns {String} - Full path
 */
export const getSignedDocumentPath = (documentCode, filename) => {
  return `esign/signed/${documentCode}_${filename}`;
};

/**
 * Download esign document
 * @param {Object} mc - Minio client
 * @param {String} documentPath - Document path
 * @returns {Promise<String>} - Base64 string
 */
export const downloadEsignDocument = (mc, documentPath) => {
  return downloadFileAsBase64(mc, "public", documentPath);
};

/**
 * Check if esign document exists
 * @param {Object} mc - Minio client
 * @param {String} documentPath - Document path
 * @returns {Promise<Object|null>} - File stat or null
 */
export const checkEsignDocumentExists = (mc, documentPath) => {
  return checkFileExists(mc, "public", documentPath);
};

/**
 * Delete esign document
 * @param {Object} mc - Minio client
 * @param {String} documentPath - Document path
 * @returns {Promise}
 */
export const deleteEsignDocument = (mc, documentPath) => {
  return deleteFile(mc, "public", documentPath);
};

/**
 * Move document to signed folder
 * @param {Object} mc - Minio client
 * @param {String} originalPath - Original document path
 * @param {String} signedPath - Signed document path
 * @returns {Promise}
 */
export const moveToSignedFolder = (mc, originalPath, signedPath) => {
  return moveFile(mc, "public", originalPath, "public", signedPath);
};

// ==========================================
// BATCH OPERATIONS
// ==========================================

/**
 * Upload multiple files
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {Array} files - Array of file objects {buffer, filename, size, mimetype}
 * @param {String} basePath - Base path for files
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFiles = async (mc, bucket, files, basePath = "") => {
  const uploadPromises = files.map((file, index) => {
    const filename = basePath ? `${basePath}/${file.filename}` : file.filename;
    return uploadFileToMinio(mc, bucket, file.buffer, filename, file.size, file.mimetype, {
      "batch-upload": "true",
      "batch-index": index.toString()
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error in batch upload:", error);
    throw error;
  }
};

/**
 * Delete multiple files
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {Array} filenames - Array of file paths
 * @returns {Promise<Array>} - Array of delete results
 */
export const deleteMultipleFiles = async (mc, bucket, filenames) => {
  const deletePromises = filenames.map(filename => deleteFile(mc, bucket, filename));

  try {
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error("Error in batch delete:", error);
    throw error;
  }
};

// ==========================================
// URL GENERATION FUNCTIONS
// ==========================================

/**
 * Generate public URL for Minio file
 * @param {String} filename - File path
 * @param {String} bucket - Bucket name (default: 'public')
 * @returns {String} - Public URL
 */
export const generatePublicUrl = (filename, bucket = "public") => {
  const baseUrl = "https://siasn.bkd.jatimprov.go.id:9000";
  return `${baseUrl}/${bucket}/${filename}`;
};

/**
 * Generate public URL for esign document
 * @param {String} documentPath - Document path (from database)
 * @returns {String} - Public URL
 */
export const generateEsignDocumentUrl = (documentPath) => {
  return generatePublicUrl(documentPath, "public");
};

/**
 * Generate public URL for signed document
 * @param {String} signedPath - Signed document path
 * @returns {String} - Public URL
 */
export const generateSignedDocumentUrl = (signedPath) => {
  return generatePublicUrl(signedPath, "public");
};

/**
 * Generate public URL for BKD bucket
 * @param {String} filename - File path
 * @returns {String} - Public URL
 */
export const generateBkdUrl = (filename) => {
  return generatePublicUrl(filename, "bkd");
};

/**
 * Generate public URL with custom base URL
 * @param {String} filename - File path
 * @param {String} bucket - Bucket name
 * @param {String} baseUrl - Custom base URL
 * @returns {String} - Public URL
 */
export const generateCustomUrl = (filename, bucket, baseUrl) => {
  return `${baseUrl}/${bucket}/${filename}`;
};

/**
 * Get filename from public URL
 * @param {String} url - Full Minio URL
 * @returns {String} - Filename/path only
 */
export const getFilenameFromUrl = (url) => {
  const baseUrl = "https://siasn.bkd.jatimprov.go.id:9000";
  if (url.startsWith(baseUrl)) {
    // Remove base URL and bucket name
    const pathPart = url.replace(baseUrl, "");
    const parts = pathPart.split("/").filter(part => part.length > 0);
    if (parts.length > 1) {
      // Remove bucket name (first part) and return the rest
      return parts.slice(1).join("/");
    }
  }
  return url;
};

/**
 * Parse Minio URL to get bucket and filename
 * @param {String} url - Full Minio URL
 * @returns {Object} - {bucket, filename, baseUrl}
 */
export const parseMinioUrl = (url) => {
  const baseUrl = "https://siasn.bkd.jatimprov.go.id:9000";
  if (url.startsWith(baseUrl)) {
    const pathPart = url.replace(baseUrl, "");
    const parts = pathPart.split("/").filter(part => part.length > 0);
    if (parts.length > 1) {
      return {
        baseUrl,
        bucket: parts[0],
        filename: parts.slice(1).join("/")
      };
    }
  }
  return null;
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get file metadata
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<Object>} - File metadata
 */
export const getFileMetadata = async (mc, bucket, filename) => {
  try {
    const stat = await checkFileExists(mc, bucket, filename);
    if (!stat) {
      throw new Error("File not found");
    }
    return {
      size: stat.size,
      etag: stat.etag,
      lastModified: stat.lastModified,
      metadata: stat.metaData || {}
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw error;
  }
};

/**
 * Generate presigned URL for file access
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @param {Number} expiry - URL expiry in seconds (default: 1 hour)
 * @returns {Promise<String>} - Presigned URL
 */
export const generatePresignedUrl = (mc, bucket, filename, expiry = 3600) => {
  return new Promise((resolve, reject) => {
    mc.presignedGetObject(bucket, filename, expiry, function (err, presignedUrl) {
      if (err) {
        console.error("Error generating presigned URL:", err);
        reject(err);
      } else {
        resolve(presignedUrl);
      }
    });
  });
};

/**
 * List files in bucket/prefix
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} prefix - File prefix/folder
 * @param {Boolean} recursive - Recursive listing
 * @returns {Promise<Array>} - Array of file objects
 */
export const listFiles = (mc, bucket, prefix = "", recursive = false) => {
  return new Promise((resolve, reject) => {
    const files = [];
    const stream = mc.listObjectsV2(bucket, prefix, recursive);

    stream.on('data', function(obj) {
      files.push({
        name: obj.name,
        size: obj.size,
        etag: obj.etag,
        lastModified: obj.lastModified
      });
    });

    stream.on('error', function(err) {
      console.error("Error listing files:", err);
      reject(err);
    });

    stream.on('end', function() {
      resolve(files);
    });
  });
};

/**
 * Get file size
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @param {String} filename - File path
 * @returns {Promise<Number>} - File size in bytes
 */
export const getFileSize = async (mc, bucket, filename) => {
  try {
    const stat = await checkFileExists(mc, bucket, filename);
    return stat ? stat.size : 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Check bucket exists
 * @param {Object} mc - Minio client
 * @param {String} bucket - Bucket name
 * @returns {Promise<Boolean>} - True if bucket exists
 */
export const checkBucketExists = (mc, bucket) => {
  return new Promise((resolve, reject) => {
    mc.bucketExists(bucket, function (err, exists) {
      if (err) {
        console.error("Error checking bucket:", err);
        reject(err);
      } else {
        resolve(exists);
      }
    });
  });
};

// ==========================================
// BACKWARD COMPATIBILITY
// ==========================================

// Existing function aliases for backward compatibility
export const uploadFileMinio = uploadFilePublic;
export const downloadFileSK = downloadFileBkd;
export const checkFileMinioSK = checkFileExistsBkd;
export const deleteFileMinio = deleteFilePublic;

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * Example usage in controllers:
 *
 * // Import functions
 * import {
 *   uploadEsignDocument,
 *   generateEsignDocumentUrl,
 *   downloadEsignDocument,
 *   deleteEsignDocument
 * } from "@/utils/helper/minio-helper";
 *
 * // Upload esign document
 * const documentCode = "DOC-2024-123";
 * const filename = "contract.pdf";
 * await uploadEsignDocument(mc, fileBuffer, filename, documentCode, fileSize, "application/pdf", userId);
 *
 * // Generate public URL
 * const documentPath = "esign/documents/DOC-2024-123_contract.pdf";
 * const publicUrl = generateEsignDocumentUrl(documentPath);
 * // Result: https://siasn.bkd.jatimprov.go.id:9000/public/esign/documents/DOC-2024-123_contract.pdf
 *
 * // Download document as base64
 * const base64Content = await downloadEsignDocument(mc, documentPath);
 *
 * // Generate URLs for different buckets
 * const publicImageUrl = generatePublicUrl("images/logo.png");
 * // Result: https://siasn.bkd.jatimprov.go.id:9000/public/images/logo.png
 *
 * const bkdFileUrl = generateBkdUrl("sk_pns/SK_01072025_123456.pdf");
 * // Result: https://siasn.bkd.jatimprov.go.id:9000/bkd/sk_pns/SK_01072025_123456.pdf
 *
 * // Parse existing URL
 * const urlInfo = parseMinioUrl("https://siasn.bkd.jatimprov.go.id:9000/public/rasn-signin-page.png");
 * // Result: { baseUrl: "https://siasn.bkd.jatimprov.go.id:9000", bucket: "public", filename: "rasn-signin-page.png" }
 */