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
 * @param {String} filePath - Original file path
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
  const { uploadEsignDocument } = require("@/utils/helper/minio-helper");
  const signedFileBuffer = Buffer.from(signedFileBase64, "base64");
  const filename = filePath.split("/").pop();

  await uploadEsignDocument(
    mc,
    signedFileBuffer,
    filename,
    documentCode,
    signedFileBuffer.length,
    "application/pdf",
    userId
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
 * Call BSrE API to sign document
 * @param {Object} params - Signing parameters
 * @returns {Promise<Object>} - Signed file result
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

  if (!result.success) {
    throw new Error(result.message || "Gagal menandatangani dokumen");
  }

  console.log("result", result);

  const signedFileBase64 = result.data?.file?.[0];
  if (!signedFileBase64) {
    throw new Error("File hasil tanda tangan tidak ditemukan");
  }

  return { signedFileBase64, result };
};
