/**
 * Signing Helper Functions
 * Helper functions untuk proses signing dokumen
 */

const path = require("path");
const fs = require("fs");

/**
 * Retrieve PDF file from Minio as base64
 * @param {Object} mc - Minio client
 * @param {String} filePath - File path in Minio
 * @returns {Promise<String>} - Base64 file content
 */
export const retrievePdfFromMinio = async (mc, filePath) => {
  console.log("   [retrievePdfFromMinio] START");
  console.log("   [retrievePdfFromMinio] mc:", mc ? "EXISTS" : "UNDEFINED");
  console.log("   [retrievePdfFromMinio] mc type:", typeof mc);
  console.log("   [retrievePdfFromMinio] filePath:", filePath);

  const { downloadEsignDocument } = require("@/utils/helper/minio-helper");

  try {
    console.log("   [retrievePdfFromMinio] Calling downloadEsignDocument...");

    // Set timeout untuk debugging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Download timeout after 30s")), 30000);
    });

    const downloadPromise = downloadEsignDocument(mc, filePath);

    const result = await Promise.race([downloadPromise, timeoutPromise]);

    console.log(
      "   [retrievePdfFromMinio] Success, file size:",
      result?.length
    );
    return result;
  } catch (error) {
    console.error("   [retrievePdfFromMinio] Error:", error.message);
    console.error("   [retrievePdfFromMinio] Error stack:", error.stack);
    throw error;
  }
};

/**
 * Upload signed PDF back to Minio (overwrite)
 * @param {Object} mc - Minio client
 * @param {String} signedFileBase64 - Signed file in base64
 * @param {String} filePath - Original file path (full path in Minio)
 * @param {String} documentCode - Document code
 * @param {String} userId - User ID
 * @returns {Promise<void>}
 */
export const uploadSignedPdfToMinio = async (
  mc,
  signedFileBase64,
  filePath,
  documentCode,
  userId
) => {
  const { uploadFileToMinio } = require("@/utils/helper/minio-helper");
  const signedFileBuffer = Buffer.from(signedFileBase64, "base64");

  const metadata = {
    "Content-Type": "application/pdf",
    "signed-by": userId,
    "document-code": documentCode,
    "upload-date": new Date().toISOString(),
    "file-type": "signed",
  };

  // Upload langsung ke path yang sama (overwrite)
  await uploadFileToMinio(
    mc,
    "public",
    signedFileBuffer,
    filePath, // Pakai full path langsung
    signedFileBuffer.length,
    "application/pdf",
    metadata
  );
};

/**
 * Load logo image for signature
 * @returns {String} - Base64 encoded logo
 */
export const loadSignatureLogo = () => {
  const logoPath = path.join(
    process.cwd(),
    "utils",
    "services",
    "esign",
    "logo.png"
  );
  console.log("   Loading signature logo from:", logoPath);
  const imageBase64 = fs.readFileSync(logoPath, "base64");
  console.log("   Logo loaded, size:", imageBase64.length);
  return imageBase64;
};

/**
 * Prepare signature properties for BSrE API
 * @param {Array} signPages - Pages to sign
 * @param {String} tagCoordinate - Tag coordinate
 * @param {String} imageBase64 - Logo image in base64
 * @returns {Array} - Signature properties array
 */
export const prepareSignatureProperties = (
  signPages,
  tagCoordinate,
  imageBase64
) => {
  return signPages?.map((page) => ({
    tampilan: "VISIBLE",
    page,
    width: 20,
    height: 20,
    imageBase64,
    tag: tagCoordinate || "$",
  }));
};

/**
 * Call BSrE API to sign document (single page)
 * @param {Object} params - Signing parameters
 * @returns {Promise<Object>} - Signed file result
 * @throws {Error} - Throws error if signing fails
 */
export const callBsreSignApi = async (params) => {
  const { signWithCoordinate } = require("@/utils/esign-utils");
  const { nik, passphrase, base64File, signatureProperties } = params;

  const result = await signWithCoordinate({
    nik,
    passphrase,
    file: [base64File],
    signatureProperties,
  });

  console.log("BSrE Sign Result:", result);

  // Check if signing failed (success: false)
  if (!result.success) {
    const errorData = result.data;
    const error = new Error(
      errorData?.response?.data?.message ||
      errorData?.response?.data?.error ||
      errorData?.message ||
      "Gagal menandatangani dokumen"
    );
    error.bsreResponse = errorData?.response?.data;
    error.statusCode = errorData?.response?.status;
    error.isNetworkError = !!errorData?.response;
    error.isBusinessError = !errorData?.response; // Business error if no HTTP response
    throw error;
  }

  // Check if signed file exists
  const signedFileBase64 = result.data?.file?.[0];
  if (!signedFileBase64) {
    const error = new Error("File hasil tanda tangan tidak ditemukan dalam response BSrE");
    error.bsreResponse = result.data;
    error.isBusinessError = true;
    throw error;
  }

  return { signedFileBase64, result };
};

/**
 * Sign document sequentially page by page
 * BSrE only supports 1 page 1 tag per request, so we need to sign page by page
 * @param {Object} params - Signing parameters
 * @returns {Promise<Object>} - Final signed file and logs
 */
export const signDocumentSequential = async (params) => {
  const {
    nik,
    passphrase,
    initialBase64,
    signPages,
    tagCoordinate,
    imageBase64,
  } = params;

  let currentBase64 = initialBase64;
  const pageLogs = [];
  const pageResponses = [];
  const totalPages = signPages.length;

  console.log(`[Sequential Sign] Starting signing for ${totalPages} pages:`, signPages);

  for (let i = 0; i < totalPages; i++) {
    const page = signPages[i];
    const step = i + 1;
    const startTime = Date.now();

    console.log(`[Sequential Sign] Step ${step}/${totalPages}: Signing page ${page}...`);

    const pageLog = {
      page,
      step,
      status: "pending",
      started_at: new Date().toISOString(),
      file_size_before: currentBase64.length,
    };

    try {
      // Prepare signature properties for THIS page only
      const signatureProperties = [{
        tampilan: "VISIBLE",
        page,
        width: 20,
        height: 20,
        imageBase64,
        tag: tagCoordinate || "$",
      }];

      // Sign this page
      const { signedFileBase64, result } = await callBsreSignApi({
        nik,
        passphrase,
        base64File: currentBase64,
        signatureProperties,
      });

      const duration = Date.now() - startTime;

      // Update log with success
      pageLog.status = "completed";
      pageLog.completed_at = new Date().toISOString();
      pageLog.duration_ms = duration;
      pageLog.file_size_after = signedFileBase64.length;

      // Store response
      pageResponses.push({
        page,
        step,
        success: true,
        bsre_response: result,
      });

      // Update current base64 for next iteration
      currentBase64 = signedFileBase64;

      console.log(`[Sequential Sign] ✓ Page ${page} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update log with failure
      pageLog.status = "failed";
      pageLog.completed_at = new Date().toISOString();
      pageLog.duration_ms = duration;
      pageLog.error = error.message;

      // Store error response
      pageResponses.push({
        page,
        step,
        success: false,
        error: error.message,
        bsre_response: error.bsreResponse || null,
      });

      console.error(`[Sequential Sign] ✗ Page ${page} failed in ${duration}ms:`, error.message);

      // Push failed log
      pageLogs.push(pageLog);

      // Create error with context
      const sequentialError = new Error(`Gagal menandatangani halaman ${page}: ${error.message}`);
      sequentialError.failedAtPage = page;
      sequentialError.failedAtStep = step;
      sequentialError.completedPages = i; // Pages completed before this
      sequentialError.pageLogs = pageLogs;
      sequentialError.pageResponses = pageResponses;
      sequentialError.originalError = error;

      throw sequentialError;
    }

    // Push success log
    pageLogs.push(pageLog);
  }

  console.log(`[Sequential Sign] ✓ All ${totalPages} pages completed successfully`);

  return {
    finalBase64: currentBase64,
    pageLogs,
    pageResponses,
    totalPages,
    completedPages: totalPages,
  };
};
