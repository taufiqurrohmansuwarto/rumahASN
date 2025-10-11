const { handleError } = require("@/utils/helper/controller-helper");
const { convertHtmlToPng } = require("@/utils/helper/gotenberg-helper");
const {
  generateSpecimenHtml,
  validateSpecimenData,
} = require("@/utils/helper/specimen-template");
const { log } = require("@/utils/logger");

/**
 * Generate specimen PNG (text-only, no file upload)
 * POST /api/esign-bkd/spesimen/generate
 *
 * Body:
 * - name: string (required) - Nama lengkap dengan gelar
 * - nip: string (required, 18 digits) - NIP 18 digit
 * - position: string (required) - Jabatan
 * - rank: string (required) - Pangkat
 *
 * Query:
 * - format: string (optional) - 'base64' or undefined (default: buffer)
 *
 * Response:
 * - PNG file as buffer with Content-Type: image/png (default)
 * - or JSON with base64 if query param format=base64
 */
exports.generate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { name, nip, position, rank } = req.body;
    const { format } = req.query; // 'base64' or undefined (default: buffer)

    log.info("[Spesimen] Generate request from user:", userId);
    log.info("[Spesimen] Data:", { name, nip, position, rank });

    // Prepare specimen data (text-only, no signature file)
    // Logo will be loaded from URL in template: https://siasn.bkd.jatimprov.go.id:9000/public/logojatim.png
    const specimenData = {
      name,
      nip,
      position,
      rank,
      logoBase64: null, // Logo loaded from URL in template
    };

    // Validate data
    const validation = validateSpecimenData(specimenData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: validation.errors,
      });
    }

    log.info("[Spesimen] Generating HTML template...");

    // Generate HTML
    const html = generateSpecimenHtml(specimenData);

    log.info("[Spesimen] Converting HTML to PNG with Gotenberg...");

    // Convert to PNG using Gotenberg (compact landscape format)
    const pngBuffer = await convertHtmlToPng(html, {
      width: 6, // Compact width
      height: 3.375, // 16:9 ratio (6 * 9/16 = 3.375)
      quality: 90,
      optimizeSize: true,
    });

    log.info(
      "[Spesimen] PNG generated successfully, size:",
      (pngBuffer.length / 1024).toFixed(2),
      "KB"
    );

    // Return as base64 or buffer
    if (format === "base64") {
      const base64Data = pngBuffer.toString("base64");
      return res.json({
        success: true,
        message: "Spesimen berhasil dibuat",
        data: {
          content: base64Data,
          contentType: "image/png",
          size: pngBuffer.length,
          filename: `spesimen_${nip}_${Date.now()}.png`,
        },
      });
    } else {
      // Return as PNG buffer (default)
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="spesimen_${nip}_${Date.now()}.png"`
      );
      res.setHeader("Content-Length", pngBuffer.length);
      return res.send(pngBuffer);
    }
  } catch (error) {
    log.error("[Spesimen] Generation error:", error);
    handleError(res, error);
  }
};

/**
 * Preview specimen HTML (for debugging)
 * POST /api/esign/spesimen/preview
 *
 * Same body as generate, returns HTML instead of PNG
 */
exports.preview = async (req, res) => {
  try {
    const { name, nip, position, rank } = req.body;

    const specimenData = {
      name,
      nip,
      position,
      rank,
      logoBase64: null, // Logo loaded from URL in template
    };

    const html = generateSpecimenHtml(specimenData);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Test Gotenberg connection
 * GET /api/esign/spesimen/test
 */
exports.test = async (req, res) => {
  try {
    const { testGotenbergConnection } = require("@/utils/helper/gotenberg-helper");
    const isConnected = await testGotenbergConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: "Gotenberg connection successful",
        gotenbergUrl: process.env.GOTENBERG_URL || "http://localhost:3000",
      });
    } else {
      res.status(503).json({
        success: false,
        message: "Gotenberg service unavailable",
        gotenbergUrl: process.env.GOTENBERG_URL || "http://localhost:3000",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};
