/**
 * Helper functions untuk konversi signature placement ke sign_coordinate format
 */

const DEFAULT_SIGNATURE_WIDTH = 50; // pixels - square, sync dengan DraggableSignature
const DEFAULT_SIGNATURE_HEIGHT = 50; // pixels - square, sync dengan DraggableSignature
const PDF_POINTS_PER_PIXEL = 0.75; // Conversion ratio

/**
 * Convert signatures array to sign_coordinate format
 * @param {Array} signatures - Array of {id, page, positionRatio/position, sizeRatio/size, signerName, signerId}
 * @param {Number} pdfPageWidth - PDF page width in pixels
 * @param {Number} pdfPageHeight - PDF page height in pixels
 * @returns {Array} sign_coordinate format
 */
export function signaturesToCoordinates(
  signatures,
  pdfPageWidth = 612,
  pdfPageHeight = 792
) {
  console.log('[signaturesToCoordinates] Input:', {
    signatures,
    pdfPageWidth,
    pdfPageHeight,
  });

  const result = signatures.map((sig) => {
    // Handle both ratio format (new) and pixel format (old)
    let pixelX, pixelY, pixelWidth, pixelHeight;

    if (sig.positionRatio && sig.sizeRatio) {
      // New ratio format - convert to pixels
      pixelX = sig.positionRatio.x * pdfPageWidth;
      pixelY = sig.positionRatio.y * pdfPageHeight;
      pixelWidth = sig.sizeRatio.width * pdfPageWidth;
      pixelHeight = sig.sizeRatio.height * pdfPageHeight;

      console.log('[signaturesToCoordinates] Ratio format conversion:', {
        signature: sig,
        positionRatio: sig.positionRatio,
        sizeRatio: sig.sizeRatio,
        pdfPageWidth,
        pdfPageHeight,
        calculatedPixels: { pixelX, pixelY, pixelWidth, pixelHeight },
      });
    } else {
      // Old pixel format - use directly
      pixelX = sig.position?.x || 0;
      pixelY = sig.position?.y || 0;
      pixelWidth = sig.size?.width || DEFAULT_SIGNATURE_WIDTH;
      pixelHeight = sig.size?.height || DEFAULT_SIGNATURE_HEIGHT;

      console.log('[signaturesToCoordinates] Old pixel format:', {
        signature: sig,
        pixels: { pixelX, pixelY, pixelWidth, pixelHeight },
      });
    }

    // IMPORTANT: Save browser Y as-is (BSrE API handles Cartesian conversion internally)
    // DO NOT flip Y here - API expects browser coordinates (top-left origin)

    // Convert pixel position to PDF points
    const originX = Math.round(pixelX * PDF_POINTS_PER_PIXEL);
    const originY = Math.round(pixelY * PDF_POINTS_PER_PIXEL);

    console.log('🔴 [signaturesToCoordinates] SAVE:', {
      browserY: pixelY,
      originY_PDF_POINTS: originY,
      pageHeight: pdfPageHeight,
      iconHeight: pixelHeight,
      NOTE: 'NO Y-FLIP - BSrE API expects browser coordinates',
    });

    const converted = {
      page: sig.page,
      tag: "$", // Keep tag for BSrE compatibility
      originX: originX,
      originY: originY,
      found: true,
      pageWidth: pdfPageWidth,
      pageHeight: pdfPageHeight,
      signatureWidth: Math.round(pixelWidth * PDF_POINTS_PER_PIXEL),
      signatureHeight: Math.round(pixelHeight * PDF_POINTS_PER_PIXEL),
      signerName: sig.signerName,
      signerId: sig.signerId || "self",
      signerAvatar: sig.signerAvatar,
    };

    console.log('[signaturesToCoordinates] Final coordinate:', converted);
    return converted;
  });

  console.log('[signaturesToCoordinates] All coordinates:', result);
  return result;
}

/**
 * Convert sign_coordinate format back to signatures array (with ratio format)
 * @param {Array} coordinates - sign_coordinate array
 * @param {Number} pdfPageWidth - PDF page width for ratio calculation
 * @param {Number} pdfPageHeight - PDF page height for ratio calculation
 * @returns {Array} signatures array with ratio format
 */
export function coordinatesToSignatures(coordinates, pdfPageWidth = 612, pdfPageHeight = 792) {
  if (!coordinates || !Array.isArray(coordinates)) return [];

  return coordinates
    .filter((coord) => coord.found)
    .map((coord, index) => {
      // Convert PDF points to pixels
      const pixelX = Math.round((coord.originX || 0) / PDF_POINTS_PER_PIXEL);
      const pixelY = Math.round((coord.originY || 0) / PDF_POINTS_PER_PIXEL);
      const pixelWidth = Math.round(
        (coord.signatureWidth || DEFAULT_SIGNATURE_WIDTH * PDF_POINTS_PER_PIXEL) / PDF_POINTS_PER_PIXEL
      );
      const pixelHeight = Math.round(
        (coord.signatureHeight || DEFAULT_SIGNATURE_HEIGHT * PDF_POINTS_PER_PIXEL) / PDF_POINTS_PER_PIXEL
      );

      // Convert pixels to ratio (0-1)
      const positionRatio = {
        x: pdfPageWidth > 0 ? pixelX / pdfPageWidth : 0,
        y: pdfPageHeight > 0 ? pixelY / pdfPageHeight : 0,
      };

      const sizeRatio = {
        width: pdfPageWidth > 0 ? pixelWidth / pdfPageWidth : 0,
        height: pdfPageHeight > 0 ? pixelHeight / pdfPageHeight : 0,
      };

      return {
        id: `sig_${coord.page}_${index}`,
        page: coord.page,
        positionRatio,
        sizeRatio,
        signerName: coord.signerName || "Unknown",
        signerId: coord.signerId || "self",
        signerAvatar: coord.signerAvatar,
      };
    });
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

  console.log('[coordinatesToPixelFormat] Input coordinates:', coordinates);

  const result = coordinates.map((coord) => {
    // Convert size dari PDF points ke pixels
    const pixelHeight = Math.round(coord.signatureHeight / PDF_POINTS_PER_PIXEL);

    // Logo BSrE harus SQUARE (width = height) agar tidak distorsi
    // Gunakan height sebagai patokan untuk ukuran square
    const squareSize = pixelHeight;

    const converted = {
      page: coord.page,
      originX: Math.round(coord.originX / PDF_POINTS_PER_PIXEL),
      originY: Math.round(coord.originY / PDF_POINTS_PER_PIXEL),
      width: squareSize,
      height: squareSize,
      signerId: coord.signerId || "self",
      signerName: coord.signerName,
    };

    console.log('[coordinatesToPixelFormat] Converted:', { input: coord, output: converted });
    return converted;
  });

  console.log('[coordinatesToPixelFormat] Final result:', result);
  return result;
}

/**
 * Convert signatures to sign_coordinate format in PIXELS (for form submission)
 * Format: [{page, originX, originY, width, height}]
 * @param {Array} signatures - Array of {id, page, positionRatio/position, sizeRatio/size, signerName, signerId}
 * @param {Number} pdfPageWidth - PDF page width for ratio conversion
 * @param {Number} pdfPageHeight - PDF page height for ratio conversion
 * @returns {Array} sign_coordinate in pixels
 */
export function signaturesToPixelCoordinates(signatures, pdfPageWidth = 612, pdfPageHeight = 792) {
  if (!signatures || !Array.isArray(signatures)) return [];

  console.log('[signaturesToPixelCoordinates] Input:', { signatures, pdfPageWidth, pdfPageHeight });

  return signatures.map((sig) => {
    let pixelX, pixelY, pixelWidth, pixelHeight;

    // Handle ratio format (new), pixel format (old), or coordinate format
    if (sig.positionRatio && sig.sizeRatio) {
      // New ratio format - convert to pixels
      pixelX = sig.positionRatio.x * pdfPageWidth;
      pixelY = sig.positionRatio.y * pdfPageHeight;
      pixelWidth = sig.sizeRatio.width * pdfPageWidth;
      pixelHeight = sig.sizeRatio.height * pdfPageHeight;

      console.log('[signaturesToPixelCoordinates] Ratio conversion:', {
        positionRatio: sig.positionRatio,
        sizeRatio: sig.sizeRatio,
        calculatedPixels: { pixelX, pixelY, pixelWidth, pixelHeight }
      });
    } else if (sig.position && sig.size) {
      // Old pixel format
      pixelX = sig.position.x;
      pixelY = sig.position.y;
      pixelWidth = sig.size.width;
      pixelHeight = sig.size.height;
    } else {
      // Already converted coordinate format (BSrE Y, from bottom)
      // Need to convert back to browser Y for consistent handling
      const bsreY = Math.round((sig.originY || 0) / PDF_POINTS_PER_PIXEL);
      pixelX = Math.round((sig.originX || 0) / PDF_POINTS_PER_PIXEL);
      pixelHeight = Math.round((sig.signatureHeight || DEFAULT_SIGNATURE_HEIGHT * PDF_POINTS_PER_PIXEL) / PDF_POINTS_PER_PIXEL);
      pixelWidth = pixelHeight;
      // Convert BSrE Y (from bottom) to browser Y (from top)
      pixelY = pdfPageHeight - bsreY - pixelHeight;
    }

    // IMPORTANT: Save browser Y as-is (BSrE API handles conversion)
    console.log('🟢 [signaturesToPixelCoordinates] SAVE:', {
      browserY: pixelY,
      originY_PIXELS: Math.round(pixelY),
      pageHeight: pdfPageHeight,
      iconHeight: pixelHeight,
      NOTE: 'NO Y-FLIP - BSrE API expects browser coordinates',
    });

    // Logo BSrE harus SQUARE - gunakan height sebagai patokan
    const squareSize = Math.round(pixelHeight || DEFAULT_SIGNATURE_HEIGHT);

    const result = {
      page: sig.page,
      originX: Math.round(pixelX),
      originY: Math.round(pixelY), // Use browser Y coordinate (no flip)
      width: squareSize,
      height: squareSize,
      signerId: sig.signerId || "self",
      signerName: sig.signerName,
    };

    console.log('[signaturesToPixelCoordinates] Final result:', result);
    return result;
  });
}
