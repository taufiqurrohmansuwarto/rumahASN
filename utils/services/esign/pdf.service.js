const pdfLib = require("pdf-lib");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
require("dotenv").config();

// Constants
const isProduction = process.env.NODE_ENV === "production";
const checkDocument = isProduction
  ? "https://siasn.bkd.jatimprov.go.id/helpdesk/check-qr/esign"
  : "http://localhost:3088/helpdesk/check-qr/esign";

const footerText = `Sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, surat ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Besar Sertifikasi Elektronik Badan Siber dan Sandi Negara (BSrE-BSSN). Legalitas berkas secara digital diatur oleh Dinas Komunikasi dan Informatika Provinsi Jawa Timur. Untuk mengetahui keabsahan berkas dapat dilakukan dengan memindai qrcode yang tersedia.`;

const logoBkd = path.join(
  process.cwd(),
  "utils",
  "services",
  "esign",
  "bkd.png"
);

/**
 * Add footer with BSrE logo, text, and QR code to all pages of PDF
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {String} documentId - Document ID for QR code
 * @returns {Promise<Buffer>} - Modified PDF buffer
 */
module.exports.addFooterToPdf = async (pdfBuffer, documentId) => {
  try {
    // Load PDF document
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Load BSrE logo image
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

    // Load BKD logo image for QR code center
    let bkdImageBytes;
    try {
      bkdImageBytes = fs.readFileSync(logoBkd);
    } catch (error) {
      console.warn("BKD logo not found, skipping logo in QR code");
      bkdImageBytes = null;
    }

    // Embed BSrE logo if available
    let bsreImage = null;
    if (bsreImageBytes) {
      try {
        bsreImage = await pdfDoc.embedPng(bsreImageBytes);
      } catch (error) {
        console.warn("Error embedding BSrE logo:", error.message);
        bsreImage = null;
      }
    }

    // Embed BKD logo if available
    let bkdImage = null;
    if (bkdImageBytes) {
      try {
        bkdImage = await pdfDoc.embedPng(bkdImageBytes);
      } catch (error) {
        console.warn("Error embedding BKD logo:", error.message);
        bkdImage = null;
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

      // Draw BKD logo in center of QR code (transparent background)
      if (bkdImage) {
        const logoSizeInQR = qrCodeSize * 0.15; // Smaller logo (15% of QR code size)
        const logoXInQR = qrX + (qrCodeSize - logoSizeInQR) / 2;
        const logoYInQR = qrY + (qrCodeSize - logoSizeInQR) / 2;

        // No background - logo will be transparent
        page.drawImage(bkdImage, {
          x: logoXInQR,
          y: logoYInQR,
          width: logoSizeInQR,
          height: logoSizeInQR,
        });
      }
    }

    // Save and return modified PDF
    return await pdfDoc.save();
  } catch (error) {
    console.error("Error adding footer to PDF:", error);
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
  console.log(
    `Adding signature for: ${signatureData?.documentId || "unknown"}`
  );
  return pdfBuffer;
};

module.exports.getTotalPages = async (pdfBuffer) => {
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
  return pdfDoc.getPages().length;
};
