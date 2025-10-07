/**
 * Helper functions untuk konversi signature placement ke sign_coordinate format
 */

const DEFAULT_SIGNATURE_WIDTH = 50; // pixels - square, sync dengan DraggableSignature
const DEFAULT_SIGNATURE_HEIGHT = 50; // pixels - square, sync dengan DraggableSignature
const PDF_POINTS_PER_PIXEL = 0.75; // Conversion ratio

/**
 * Convert signatures array to sign_coordinate format
 * @param {Array} signatures - Array of {id, page, position: {x, y}, size: {width, height}, signerName, signerId}
 * @param {Number} pdfPageWidth - PDF page width in pixels
 * @param {Number} pdfPageHeight - PDF page height in pixels
 * @returns {Array} sign_coordinate format
 */
export function signaturesToCoordinates(
  signatures,
  pdfPageWidth = 612,
  pdfPageHeight = 792
) {
  return signatures.map((sig) => {
    // Convert pixel position to PDF points
    const originX = Math.round(sig.position.x * PDF_POINTS_PER_PIXEL);
    const originY = Math.round(sig.position.y * PDF_POINTS_PER_PIXEL);

    // Get size from signature or use default
    const width = sig.size?.width || DEFAULT_SIGNATURE_WIDTH;
    const height = sig.size?.height || DEFAULT_SIGNATURE_HEIGHT;

    return {
      page: sig.page,
      tag: "$", // Keep tag for BSrE compatibility
      originX: originX,
      originY: originY,
      found: true,
      pageWidth: pdfPageWidth,
      pageHeight: pdfPageHeight,
      signatureWidth: Math.round(width * PDF_POINTS_PER_PIXEL),
      signatureHeight: Math.round(height * PDF_POINTS_PER_PIXEL),
      signerName: sig.signerName,
      signerId: sig.signerId || "self", // ADD THIS LINE
      signerAvatar: sig.signerAvatar, // ADD THIS LINE
    };
  });
}

/**
 * Convert sign_coordinate format back to signatures array
 * @param {Array} coordinates - sign_coordinate array
 * @returns {Array} signatures array
 */
export function coordinatesToSignatures(coordinates) {
  if (!coordinates || !Array.isArray(coordinates)) return [];

  return coordinates
    .filter((coord) => coord.found)
    .map((coord, index) => ({
      id: `sig_${coord.page}_${index}`,
      page: coord.page,
      position: {
        x: Math.round((coord.originX || 0) / PDF_POINTS_PER_PIXEL),
        y: Math.round((coord.originY || 0) / PDF_POINTS_PER_PIXEL),
      },
      size: {
        width: Math.round(
          (coord.signatureWidth ||
            DEFAULT_SIGNATURE_WIDTH * PDF_POINTS_PER_PIXEL) /
            PDF_POINTS_PER_PIXEL
        ),
        height: Math.round(
          (coord.signatureHeight ||
            DEFAULT_SIGNATURE_HEIGHT * PDF_POINTS_PER_PIXEL) /
            PDF_POINTS_PER_PIXEL
        ),
      },
      signerName: coord.signerName || "Unknown",
      signerId: coord.signerId || "self", // ADD THIS LINE
      signerAvatar: coord.signerAvatar, // ADD THIS LINE
    }));
}

/**
 * Group signatures by page for statistics
 * @param {Array} signatures
 * @returns {Object} { page1: 2, page2: 1, ... }
 */
export function getSignatureCountByPage(signatures) {
  const counts = {};

  signatures.forEach((sig) => {
    const pageKey = `page${sig.page}`;
    counts[pageKey] = (counts[pageKey] || 0) + 1;
  });

  return counts;
}

/**
 * Get total signature count
 * @param {Array} signatures
 * @returns {Number}
 */
export function getTotalSignatureCount(signatures) {
  return signatures.length;
}

/**
 * Validate signatures - ensure all required fields exist
 * @param {Array} signatures
 * @returns {Boolean}
 */
export function validateSignatures(signatures) {
  if (!signatures || !Array.isArray(signatures) || signatures.length === 0) {
    return false;
  }

  return signatures.every(
    (sig) =>
      sig.page &&
      sig.position &&
      typeof sig.position.x === "number" &&
      typeof sig.position.y === "number" &&
      (!sig.size ||
        (typeof sig.size.width === "number" &&
          typeof sig.size.height === "number"))
  );
}

/**
 * Convert coordinate format to simple pixel format for API submission
 * Format: [{page, originX, originY, width, height}]
 * @param {Array} coordinates - Array dari Zustand store (sudah dalam format koordinat)
 * @returns {Array} sign_coordinate in pixels for API
 */
export function coordinatesToPixelFormat(coordinates) {
  if (!coordinates || !Array.isArray(coordinates)) return [];

  return coordinates.map((coord) => {
    // Convert size dari PDF points ke pixels
    const pixelHeight = Math.round(coord.signatureHeight / PDF_POINTS_PER_PIXEL);

    // Logo BSrE harus SQUARE (width = height) agar tidak distorsi
    // Gunakan height sebagai patokan untuk ukuran square
    const squareSize = pixelHeight;

    return {
      page: coord.page,
      originX: Math.round(coord.originX / PDF_POINTS_PER_PIXEL),
      originY: Math.round(coord.originY / PDF_POINTS_PER_PIXEL),
      width: squareSize,
      height: squareSize,
      signerId: coord.signerId || "self",
      signerName: coord.signerName,
    };
  });
}

/**
 * Convert signatures to sign_coordinate format in PIXELS (for form submission)
 * Format: [{page, originX, originY, width, height}]
 * @param {Array} signatures - Array of {id, page, position: {x, y}, size: {width, height}, signerName, signerId}
 * @returns {Array} sign_coordinate in pixels
 */
export function signaturesToPixelCoordinates(signatures) {
  if (!signatures || !Array.isArray(signatures)) return [];

  return signatures.map((sig) => {
    // Handle both formats: raw signatures or already-converted coordinates
    if (sig.position && sig.size) {
      // Raw signature format
      // Logo BSrE harus SQUARE - gunakan height sebagai patokan
      const squareSize = sig.size?.height || DEFAULT_SIGNATURE_HEIGHT;

      return {
        page: sig.page,
        originX: Math.round(sig.position.x),
        originY: Math.round(sig.position.y),
        width: squareSize,
        height: squareSize,
        signerId: sig.signerId || "self",
        signerName: sig.signerName,
      };
    } else {
      // Already converted coordinate format
      const pixelHeight = Math.round((sig.signatureHeight || DEFAULT_SIGNATURE_HEIGHT * PDF_POINTS_PER_PIXEL) / PDF_POINTS_PER_PIXEL);

      return {
        page: sig.page,
        originX: Math.round(sig.originX / PDF_POINTS_PER_PIXEL),
        originY: Math.round(sig.originY / PDF_POINTS_PER_PIXEL),
        width: pixelHeight,
        height: pixelHeight,
        signerId: sig.signerId || "self",
        signerName: sig.signerName,
      };
    }
  });
}
