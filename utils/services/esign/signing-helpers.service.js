/**
 * Signing Helper Functions
 * Helper functions untuk proses signing dokumen
 */

const path = require("path");
const fs = require("fs");

const { log } = require("@/utils/logger");

/**
 * Retrieve PDF file from Minio as base64
 * @param {Object} mc - Minio client
 * @param {String} filePath - File path in Minio
 * @returns {Promise<String>} - Base64 file content
 */
export const retrievePdfFromMinio = async (mc, filePath) => {
  log.info("   [retrievePdfFromMinio] START");
  log.info("   [retrievePdfFromMinio] mc:", mc ? "EXISTS" : "UNDEFINED");
  log.info("   [retrievePdfFromMinio] mc type:", typeof mc);
  log.info("   [retrievePdfFromMinio] filePath:", filePath);

  const { downloadEsignDocument } = require("@/utils/helper/minio-helper");

  try {
    log.info("   [retrievePdfFromMinio] Calling downloadEsignDocument...");

    // Set timeout untuk debugging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Download timeout after 30s")), 30000);
    });

    const downloadPromise = downloadEsignDocument(mc, filePath);

    const result = await Promise.race([downloadPromise, timeoutPromise]);

    log.info("   [retrievePdfFromMinio] Success, file size:", result?.length);
    return result;
  } catch (error) {
    log.error("   [retrievePdfFromMinio] Error:", error.message);
    log.error("   [retrievePdfFromMinio] Error stack:", error.stack);
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
  log.info("   Loading signature logo from:", logoPath);
  const imageBase64 = fs.readFileSync(logoPath, "base64");
  log.info("   Logo loaded, size:", imageBase64.length);
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

  log.info("      [callBsreSignApi] Response received:");
  log.info("      - Success:", result.success);

  // Check if signing failed (success: false)
  if (!result.success) {
    const errorData = result.data;
    log.info("      [callBsreSignApi] ✗ FAILED");
    log.info(
      "      - Error message:",
      errorData?.response?.data?.message || errorData?.message
    );
    log.info("      - Status code:", errorData?.response?.status);

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
    log.info("      [callBsreSignApi] ✗ FAILED - No signed file in response");

    const error = new Error(
      "File hasil tanda tangan tidak ditemukan dalam response BSrE"
    );
    error.bsreResponse = result.data;
    error.isBusinessError = true;
    throw error;
  }

  log.info("      [callBsreSignApi] ✓ SUCCESS");
  log.info("      - Output file size:", signedFileBase64.length, "bytes");
  log.info(
    "      - Size difference:",
    signedFileBase64.length - base64File.length,
    "bytes",
    `(${signedFileBase64.length > base64File.length ? "+" : ""}${(
      ((signedFileBase64.length - base64File.length) / base64File.length) *
      100
    ).toFixed(2)}%)`
  );

  return { signedFileBase64, result };
};

/**
 * Sign document sequentially page by page using detected coordinates
 * BSrE only supports 1 page per request, so we sign page by page
 * @param {Object} params - Signing parameters
 * @param {Array} params.signCoordinates - Array of coordinate objects [{page, originX, originY, ...}]
 * @returns {Promise<Object>} - Final signed file and logs
 */
export const signDocumentSequential = async (params) => {
  const {
    nik,
    passphrase,
    initialBase64,
    signCoordinates, // NEW: Use coordinates instead of pages + tag
    imageBase64,
  } = params;

  let currentBase64 = initialBase64;
  const pageLogs = [];
  const pageResponses = [];
  const totalPages = signCoordinates.length;

  log.info(
    `[Sequential Sign] Starting signing for ${totalPages} pages with coordinates`
  );

  // Log coordinates
  signCoordinates.forEach((coord, idx) => {
    log.info(
      `[Sequential Sign] ${idx + 1}. Page ${coord.page}: bottom-left (${
        coord.originX
      }, ${coord.originY})`
    );
  });

  for (let i = 0; i < totalPages; i++) {
    const coord = signCoordinates[i];
    const page = coord.page;
    const step = i + 1;
    const startTime = Date.now();

    log.info(
      `[Sequential Sign] Step ${step}/${totalPages}: Signing page ${page} at (${coord.originX}, ${coord.originY})...`
    );

    const pageLog = {
      page,
      step,
      status: "pending",
      started_at: new Date().toISOString(),
      file_size_before: currentBase64.length,
    };

    try {
      // Coordinates from frontend are ALREADY in PDF points (converted with 0.75 factor)
      // Position is correct, just adjust size slightly smaller if needed
      const sizeAdjustment = 0.8; // Make signature 80% of frontend size (adjust as needed: 0.7=70%, 0.9=90%)

      const signatureProperties = [
        {
          tampilan: "VISIBLE",
          page: page,
          originX: coord.originX, // Keep position as-is
          originY: coord.originY, // Keep position as-is
          width: coord.width, // Slightly smaller
          height: coord.height, // Slightly smaller
          imageBase64,
        },
      ];

      log.info(
        `[Sequential Sign] Position exact, size adjusted to ${
          sizeAdjustment * 100
        }%:`
      );
      log.info(`  Page: ${page}`);
      log.info(`  Position: (${coord.originX}, ${coord.originY})`);
      log.info(
        `  Size: ${coord.width}x${coord.height} → ${signatureProperties[0].width}x${signatureProperties[0].height}`
      );

      log.info(
        "signatureProperties",
        JSON.stringify(
          {
            ...signatureProperties[0],
            imageBase64: `[REDACTED_${imageBase64?.length || 0}_bytes]`,
          },
          null,
          2
        )
      );

      // Sign this page
      const { signedFileBase64, result } = await callBsreSignApi({
        nik,
        passphrase,
        base64File: currentBase64,
        signatureProperties,
      });

      log.info("result", result);

      const duration = Date.now() - startTime;

      // Update log with success
      pageLog.status = "completed";
      pageLog.completed_at = new Date().toISOString();
      pageLog.duration_ms = duration;
      pageLog.file_size_after = signedFileBase64.length;

      // Store signatureProperties without imageBase64 for audit
      pageLog.bsre_payload = signatureProperties.map((sp) => ({
        tampilan: sp.tampilan,
        nik,
        page: sp.page,
        originX: sp.originX,
        originY: sp.originY,
        width: sp.width,
        height: sp.height,
        // imageBase64 excluded - too large
      }));

      // tanpa menyimpan file base64 karena terlalu besar jika di log
      const {
        data: { time },
        success,
      } = result;

      // Store response
      pageResponses.push({
        page,
        step,
        success: true,
        bsre_response: {
          success,
          time,
        },
      });

      // Update current base64 for next iteration
      currentBase64 = signedFileBase64;

      log.info(`[Sequential Sign] ✓ Page ${page} completed in ${duration}ms`);
      log.info(
        `[Sequential Sign]   File size changed: ${pageLog.file_size_before} → ${
          pageLog.file_size_after
        } bytes (${
          pageLog.file_size_after > pageLog.file_size_before ? "+" : ""
        }${pageLog.file_size_after - pageLog.file_size_before})`
      );
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update log with failure
      pageLog.status = "failed";
      pageLog.completed_at = new Date().toISOString();
      pageLog.duration_ms = duration;
      pageLog.error = error.message;

      // Store signatureProperties that was attempted (without imageBase64)
      pageLog.bsre_payload = [
        {
          tampilan: "VISIBLE",
          page: page,
          originX: coord.originX,
          originY: coord.originY,
          width: coord.width,
          height: coord.height,
          // imageBase64 excluded - too large
        },
      ];

      // Store error response
      pageResponses.push({
        page,
        step,
        success: false,
        error: error.message,
        bsre_response: error.bsreResponse || null,
      });

      log.error(
        `[Sequential Sign] ✗ Page ${page} failed in ${duration}ms:`,
        error.message
      );

      // Push failed log
      pageLogs.push(pageLog);

      // Create error with context
      const sequentialError = new Error(
        `Gagal menandatangani halaman ${page}: ${error.message}`
      );
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

  log.info(
    `[Sequential Sign] ✓ All ${totalPages} pages completed successfully`
  );
  log.info(`[Sequential Sign] Final file size: ${currentBase64.length} bytes`);
  log.info(
    `[Sequential Sign] Total size change: ${initialBase64.length} → ${
      currentBase64.length
    } (${currentBase64.length > initialBase64.length ? "+" : ""}${
      currentBase64.length - initialBase64.length
    })`
  );

  return {
    finalBase64: currentBase64,
    pageLogs,
    pageResponses,
    totalPages,
    completedPages: totalPages,
  };
};
