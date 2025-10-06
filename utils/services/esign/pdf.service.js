const pdfLib = require("pdf-lib");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
// pdfjs-dist v5.x uses ESM, need dynamic import in Node.js
let pdfjsLib = null;

// Development logging helper
const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devLog(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devError(...args);
  }
};

// Async function to load pdfjs-dist (ESM module)
const loadPdfjsLib = async () => {
  if (pdfjsLib) return pdfjsLib; // Already loaded

  try {
    // Dynamic import for ESM module in CommonJS
    const pdfjs = await import('pdfjs-dist');
    pdfjsLib = pdfjs;
    devLog("[pdf.service] pdfjs-dist v5.x loaded successfully via ESM");
    return pdfjsLib;
  } catch (error) {
    devError("[pdf.service] Error loading pdfjs-dist:", error.message);
    throw new Error("pdfjs-dist not available. Coordinate detection unavailable.");
  }
};
require("dotenv").config();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DEFAULT_SIGNATURE_WIDTH = 20;
const DEFAULT_SIGNATURE_HEIGHT = 20;

// Approximate glyph widths (Helvetica, units where 1000 = font size)

// Constants
const isProduction = process.env.NODE_ENV === "production";
const checkDocument = isProduction
  ? "https://siasn.bkd.jatimprov.go.id/helpdesk/public/check-qr/esign"
  : "http://localhost:3088/helpdesk/public/check-qr/esign";

const footerText = `Sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, surat ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Besar Sertifikasi Elektronik Badan Siber dan Sandi Negara (BSrE-BSSN). Legalitas berkas secara digital diatur oleh Dinas Komunikasi dan Informatika Provinsi Jawa Timur. Untuk mengetahui keabsahan berkas dapat dilakukan dengan memindai qrcode yang tersedia.`;

/**
 * Add footer with BSrE logo, text, and QR code to all pages of PDF
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {String} documentId - Document ID for QR code
 * @param {Boolean} isAddFooter - Whether to add footer text and logo (default: false, only QR)
 * @returns {Promise<Buffer>} - Modified PDF buffer
 */
module.exports.addFooterToPdf = async (
  pdfBuffer,
  documentId,
  isAddFooter = false
) => {
  try {
    devLog("[addFooterToPdf] Starting...");
    devLog("[addFooterToPdf] documentId:", documentId);
    devLog(
      "[addFooterToPdf] isAddFooter:",
      isAddFooter,
      "type:",
      typeof isAddFooter
    );

    // Load PDF document
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Load BSrE logo image only if footer is enabled
    let bsreImage = null;
    if (isAddFooter) {
      let bsreImageBytes;
      const logoPath = path.join(
        process.cwd(),
        "utils",
        "services",
        "esign",
        "bsre.png"
      );

      try {
        bsreImageBytes = fs.readFileSync(logoPath);
      } catch (error) {
        console.warn("BSrE logo not found, skipping logo in footer");
        bsreImageBytes = null;
      }

      // Embed BSrE logo if available
      if (bsreImageBytes) {
        try {
          bsreImage = await pdfDoc.embedPng(bsreImageBytes);
        } catch (error) {
          console.warn("Error embedding BSrE logo:", error.message);
          bsreImage = null;
        }
      }
    }

    // Generate QR code with modern design
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${checkDocument}/${documentId}`,
      {
        width: 150,
        margin: 2,
        color: {
          dark: "#1a365d", // Dark blue instead of black
          light: "#ffffff",
        },
        errorCorrectionLevel: "M", // Medium error correction
      }
    );

    // Convert QR code data URL to buffer and embed
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);

    // Get pages and add footer to each page
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width } = page.getSize();

      // Footer configuration - horizontal layout
      const footerHeight = 60;
      const footerY = 5; // Keep lower position
      const margin = 15;

      // Calculate center positions for horizontal layout
      const pageCenter = width / 2;

      // Logo configuration
      const logoScale = 0.025;
      const logoWidth = bsreImage ? bsreImage.width * logoScale : 0;
      const logoHeight = bsreImage ? bsreImage.height * logoScale : 0;

      // Text area configuration (wide for horizontal layout)
      const qrCodeSize = 50;
      const qrMargin = 80; // Space reserved for QR code on right
      const textAreaWidth = width - logoWidth - margin * 3 - qrMargin; // Use most of page width

      // Calculate horizontal layout positions
      const contentWidth = logoWidth + textAreaWidth + 10;
      const contentStartX = pageCenter - contentWidth / 2;

      // Draw footer (logo and text) only if isAddFooter is true
      if (isAddFooter) {
        // Draw BSrE logo (left side)
        if (bsreImage) {
          const logoY = footerY + (footerHeight - logoHeight) / 2;

          page.drawImage(bsreImage, {
            x: contentStartX,
            y: logoY,
            width: logoWidth,
            height: logoHeight,
          });
        }

        // Calculate text area (horizontal layout, wide)
        const textStartX = contentStartX + logoWidth + 10;

        // Draw footer text (horizontal, single line or few lines)
        const fontSize = 5;
        const textLines = wrapText(footerText, textAreaWidth, fontSize);
        const lineHeight = 6;
        const totalTextHeight = textLines.length * lineHeight;

        // Center text vertically in footer
        const textStartY =
          footerY +
          (footerHeight - totalTextHeight) / 2 +
          totalTextHeight -
          lineHeight;

        for (let j = 0; j < textLines.length; j++) {
          page.drawText(textLines[j], {
            x: textStartX,
            y: textStartY - j * lineHeight,
            size: fontSize,
            color: pdfLib.rgb(0.3, 0.3, 0.3),
            maxWidth: textAreaWidth,
          });
        }
      }

      // QR code configuration - bottom right corner
      const qrX = width - qrCodeSize - 15; // Use existing qrCodeSize
      const qrY = 15;

      // Draw subtle background/border for QR code
      page.drawRectangle({
        x: qrX - 3,
        y: qrY - 3,
        width: qrCodeSize + 6,
        height: qrCodeSize + 6,
        color: pdfLib.rgb(0.95, 0.95, 0.95), // Light gray background
      });

      // Draw border
      page.drawRectangle({
        x: qrX - 2,
        y: qrY - 2,
        width: qrCodeSize + 4,
        height: qrCodeSize + 4,
        borderColor: pdfLib.rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      });

      // Draw QR code
      page.drawImage(qrCodeImage, {
        x: qrX,
        y: qrY,
        width: qrCodeSize,
        height: qrCodeSize,
      });
    }

    // Save and return modified PDF
    return await pdfDoc.save();
  } catch (error) {
    devError("Error adding footer to PDF:", error);
    throw new Error("Failed to add footer to PDF");
  }
};

/**
 * Wrap text to fit within specified width
 * @param {String} text - Text to wrap
 * @param {Number} maxWidth - Maximum width
 * @param {Number} fontSize - Font size
 * @returns {Array} - Array of text lines
 */
function wrapText(text, maxWidth, fontSize) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  // Rough estimation: 1 character ≈ fontSize * 0.6 pixels
  const charWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, force break
        lines.push(word);
        currentLine = "";
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Add digital signature to PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} signatureData - Signature data
 * @returns {Promise<Buffer>} - Signed PDF buffer
 */
module.exports.addSignatureToPdf = async (pdfBuffer, signatureData) => {
  // Implementation for adding signature
  // This would integrate with BSrE or other signature services
  devLog(
    `Adding signature for: ${signatureData?.documentId || "unknown"}`
  );
  return pdfBuffer;
};

module.exports.getTotalPages = async (pdfBuffer) => {
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
  return pdfDoc.getPages().length;
};

/**
 * Get coordinates of tag in PDF pages
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} signatureDetails - Array of signature detail objects
 * @returns {Promise<Array>} - Array of coordinates for each signer and page
 *
 * Example signatureDetails: [{id: "1", sign_pages: [1,2,3], tag_coordinate: '$'}]
 *
 * Returns: [
 *   {
 *     id: "1",
 *     coordinates: [
 *       {
 *         page: 1,
 *         tag: '$',
 *         originX: 100,
 *         originY: 620,             // bottom-left coordinate for BSrE helper
 *         originYTopLeft: 200,      // optional top-left reference
 *         originYBottomLeft: 620,
 *         found: true
 *       },
 *       { page: 2, tag: '$', originX: 150, originY: 250, found: true },
 *       { page: 3, tag: '$', originX: null, originY: null, found: false }
 *     ]
 *   }
 * ]
 */
module.exports.getCoordinates = async (pdfBuffer, signatureDetails) => {
  try {
    devLog("[getCoordinates] Starting...");
    devLog("[getCoordinates] Signature details count:", signatureDetails?.length);

    // Load PDF document
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    devLog("[getCoordinates] Total pages in PDF:", pages.length);

    const pdfJsTextMap = await extractTextMapWithPdfJs(pdfBuffer);

    const results = [];

    // Process each signature detail
    for (const detail of signatureDetails) {
      const { id, sign_pages, tag_coordinate } = detail;

      devLog(`[getCoordinates] Processing detail ID: ${id}`);
      devLog(`[getCoordinates] - Pages to check: ${sign_pages?.join(', ')}`);
      devLog(`[getCoordinates] - Tag to find: "${tag_coordinate}"`);

      const coordinates = [];

      // Check each page for this signature detail
      for (const pageNumber of sign_pages || []) {
        const pageIndex = pageNumber - 1; // Convert to 0-based index

        if (pageIndex < 0 || pageIndex >= pages.length) {
          console.warn(`[getCoordinates] Page ${pageNumber} out of range, skipping...`);
          coordinates.push({
            page: pageNumber,
            tag: tag_coordinate,
            originX: null,
            originY: null,
            found: false,
            error: "Page out of range"
          });
          continue;
        }

        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        devLog(`[getCoordinates] Searching in page ${pageNumber} (${width}x${height})...`);

        try {
          // Get page text content with positions from pdfjs-dist cache
          const pageTextData = pdfJsTextMap.get(pageNumber) || {
            items: [],
            viewportWidth: width,
            viewportHeight: height,
          };
          const textContent = pageTextData.items;

          devLog(
            `[getCoordinates]   Text items fetched: ${textContent.length}`
          );

          // Find tag coordinate in text content
          const tagPosition = findTagInText(textContent, tag_coordinate);

          if (tagPosition) {
            // BSrE API expects TOP-LEFT origin. Our signing helper converts from
            // bottom-left before calling BSrE, so we provide bottom-left values here.
            const tagXTopLeft = tagPosition.xTopLeft;
            const tagYTopLeft = tagPosition.yTopLeft;
            const tagWidth = tagPosition.width || 0;
            const tagHeight = tagPosition.height || 0;

            const signatureWidth = DEFAULT_SIGNATURE_WIDTH;
            const signatureHeight = DEFAULT_SIGNATURE_HEIGHT;

            const estimatedTagWidth = tagWidth > 0 ? tagWidth : Math.max(tagHeight * 0.6, 6);
            const estimatedTagHeight = tagHeight > 0 ? tagHeight : Math.max(estimatedTagWidth, 6);

            const tagCenterX = tagXTopLeft + estimatedTagWidth / 2;
            const tagCenterYTop = tagYTopLeft + estimatedTagHeight / 2;

            const signatureBoxX = clamp(
              Math.round(tagCenterX - signatureWidth / 2),
              0,
              Math.max(width - signatureWidth, 0)
            );
            const signatureBoxYTopLeft = clamp(
              Math.round(tagCenterYTop - signatureHeight / 2),
              0,
              Math.max(height - signatureHeight, 0)
            );
            const signatureBoxYBottomLeft = height - signatureBoxYTopLeft - signatureHeight;

            devLog(`[getCoordinates] ✓ Tag "${tag_coordinate}" found at page ${pageNumber}`);
            devLog(`  • Tag top-left          : (${tagXTopLeft}, ${tagYTopLeft})`);
            devLog(`  • Tag approx size       : ${estimatedTagWidth} x ${estimatedTagHeight}`);
            devLog(`  • Signature top-left    : (${signatureBoxX}, ${signatureBoxYTopLeft})`);
            devLog(`  • Signature bottom-left : (${signatureBoxX}, ${signatureBoxYBottomLeft})`);
            devLog(`  • Page size             : ${width} x ${height}`);

            coordinates.push({
              page: pageNumber,
              tag: tag_coordinate,
              originX: Math.round(signatureBoxX),
              originY: Math.round(signatureBoxYBottomLeft), // bottom-left for downstream conversion
              originYTopLeft: Math.round(signatureBoxYTopLeft),
              originYBottomLeft: Math.round(signatureBoxYBottomLeft),
              found: true,
              pageWidth: width,
              pageHeight: height,
              coordinate_system: "bottom-left",
              signatureWidth,
              signatureHeight,
            });
          } else {
            console.warn(`[getCoordinates] ✗ Tag "${tag_coordinate}" not found in page ${pageNumber}`);

            coordinates.push({
              page: pageNumber,
              tag: tag_coordinate,
              originX: null,
              originY: null,
              found: false,
              error: "Tag not found in page"
            });
          }
        } catch (error) {
          devError(`[getCoordinates] Error processing page ${pageNumber}:`, error.message);

          coordinates.push({
            page: pageNumber,
            tag: tag_coordinate,
            originX: null,
            originY: null,
            found: false,
            error: error.message
          });
        }
      }

      results.push({
        id,
        tag_coordinate,
        coordinates
      });
    }

    devLog("[getCoordinates] ✓ Completed");
    return results;

  } catch (error) {
    devError("[getCoordinates] Error:", error);
    throw new Error(`Failed to get coordinates: ${error.message}`);
  }
};

/**
 * Extract text items for all pages using pdfjs-dist with glyph-level granularity
 * @param {Buffer} pdfBuffer
 * @returns {Promise<Map<number, {items:Array, viewportWidth:number, viewportHeight:number}>>}
 */
async function extractTextMapWithPdfJs(pdfBuffer) {
  const textMap = new Map();
  let pdfDocument;

  try {
    // Load pdfjs-dist dynamically (ESM module)
    const pdfjs = await loadPdfjsLib();

    const loadingTask = pdfjs.getDocument({
      data: pdfBuffer,
      useSystemFonts: true,
    });

    pdfDocument = await loadingTask.promise;

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent({
        disableCombineTextItems: true,
      });

      const items = [];

      for (const item of textContent.items) {
        const text = item.str;

        if (typeof text !== "string" || text.length === 0) {
          continue;
        }

        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4] || 0;
        const yBottomLeft = transform[5] || 0;

        const derivedHeight = Math.hypot(transform[2] || 0, transform[3] || 0);
        const derivedWidth = Math.hypot(transform[0] || 0, transform[1] || 0);

        const height = item.height || derivedHeight;
        const width = item.width || derivedWidth;
        const yTopLeft = viewport.height - yBottomLeft - height;

        items.push({
          text,
          x,
          yTopLeft,
          yBottomLeft,
          width,
          height,
          page: pageNumber,
        });
      }

      textMap.set(pageNumber, {
        items,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
      });

      page.cleanup();
    }
  } catch (error) {
    devError("[extractTextMapWithPdfJs] Error extracting text:", error);
    throw error;
  } finally {
    if (pdfDocument) {
      pdfDocument.cleanup();
      pdfDocument.destroy();
    }
  }

  return textMap;
}

/**
 * Find tag coordinate in text content
 * @param {Array} textContent - Array of text items with positions
 * @param {String} tag - Tag to find
 * @returns {Object|null} - Position object or null if not found
 */
function findTagInText(textContent, tag) {
  if (!textContent || textContent.length === 0) {
    devLog(`[findTagInText] ✗ No text content provided`);
    return null;
  }

  devLog(`[findTagInText] Searching for tag: "${tag}" in ${textContent.length} items`);

  // Debug: Show first 10 text items
  devLog(`[findTagInText] Sample text items (first 10):`);
  textContent.slice(0, 10).forEach((item, idx) => {
    devLog(
      `  [${idx}] "${item.text}" TL(${item.x}, ${item.yTopLeft}) BL(${item.x}, ${item.yBottomLeft})`
    );
  });

  // Exact match first
  for (const item of textContent) {
    if (item.text && item.text === tag) {
      devLog(
        `[findTagInText] ✓ Exact match found: "${item.text}" TL(${item.x}, ${item.yTopLeft}) BL(${item.x}, ${item.yBottomLeft})`
      );
      return {
        xTopLeft: item.x,
        yTopLeft: item.yTopLeft,
        yBottomLeft: item.yBottomLeft,
        text: item.text,
        width: item.width,
        height: item.height
      };
    }
  }

  // If no exact match, try includes
  for (const item of textContent) {
    if (item.text && item.text.includes(tag)) {
      devLog(
        `[findTagInText] ✓ Partial match found: "${item.text}" TL(${item.x}, ${item.yTopLeft}) BL(${item.x}, ${item.yBottomLeft})`
      );
      const charIndex = item.text.indexOf(tag);
      const baseLength = item.text.length || 1;
      const precedingRatio = charIndex >= 0 ? charIndex / baseLength : 0;
      const tagRatio = tag.length / baseLength;

      const xOffset = (item.width || 0) * precedingRatio;
      const tagApproxWidth = (item.width || 0) * tagRatio;

      return {
        xTopLeft: item.x + (isNaN(xOffset) ? 0 : xOffset),
        yTopLeft: item.yTopLeft,
        yBottomLeft: item.yBottomLeft,
        text: item.text,
        width: tagApproxWidth > 0 ? tagApproxWidth : item.width,
        height: item.height
      };
    }
  }

  devLog(`[findTagInText] ✗ Tag "${tag}" not found`);
  devLog(`[findTagInText] All unique texts in page:`, [...new Set(textContent.map(t => t.text))].slice(0, 20).join(', '));
  return null;
}
