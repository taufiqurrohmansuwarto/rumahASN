import axios from "axios";
import { handleError } from "@/utils/helper/controller-helper";
import {
  analyzeImage,
  changeBackground,
  checkHealth,
  removeBackground,
} from "@/utils/microservices/ocr.services";

import { logger } from "@/utils/logger";
import {
  formatPhotoInsightResponse,
  getBackgroundRequirement,
  urlToBase64,
} from "@/utils/helper/photo-helper";
import {
  identifyColorName,
  validateBackgroundColor,
  generateCompleteInsight,
} from "@/utils/services/ai-services";
import PhotoInsight from "@/models/ai-insight/photo-insight.model";
import {
  generatePublicUrl,
  uploadFileToMinio,
} from "@/utils/helper/minio-helper";

import crypto from "crypto";

/**
 * Generate secure hash for NIP (employee number)
 * Uses SHA-256 with salt for better security
 * @param {string} nip - Employee number
 * @returns {string} - Hashed NIP
 */
const hashNip = (nip) => {
  const salt = process.env.NIP_HASH_SALT || "siasn-bkd-jatim-2024";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${nip}`)
    .digest("hex")
    .substring(0, 16); // Use first 16 chars for shorter filenames
};

export const checkFotoPersonalByNip = async (req, res) => {
  try {
    logger.info("=== checkFotoPersonal START ===");

    const { fetcher } = req;
    const { nip } = req.query;
    const { refresh = false } = req.body;

    logger.info(`NIP: ${nip}, Refresh: ${refresh}`);
    // ========================================
    // 1. CEK CACHE DATABASE (jika tidak refresh)
    // ========================================
    if (!refresh) {
      const cached = await PhotoInsight.query().where("nip", nip).first();
      if (cached) {
        logger.info("✓ Data found in cache");
        return res.json({
          success: true,
          message: "✨ Data ditemukan dari pemeriksaan sebelumnya",
          cached: true,
          data: formatPhotoInsightResponse(cached),
        });
      }

      logger.info("✗ No cache found, generating new insight...");
    } else {
      logger.info("⟳ Force refresh requested");
    }

    // ========================================
    // 2. FETCH DATA PEGAWAI
    // ========================================
    logger.info("Fetching employee data...");
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    const foto = result?.data?.foto;

    const jenisJabatan = result?.data?.jabatan?.jenis_jabatan;
    const eselonId = result?.data?.jabatan?.eselon_id;

    if (!foto) {
      logger.warn("Photo URL not found");
      return res.status(404).json({
        success: false,
        message: "Foto pegawai tidak ditemukan di sistem",
      });
    }

    logger.info(`Jabatan: ${jenisJabatan}, Eselon: ${eselonId || "N/A"}`);

    // ========================================
    // 3. GET BACKGROUND REQUIREMENT
    // ========================================
    const bgRequirement = getBackgroundRequirement(jenisJabatan, eselonId);
    logger.info(
      `Background requirement: ${bgRequirement.label} (${bgRequirement.hex})`
    );

    // ========================================
    // 4. CONVERT URL TO BASE64 & ANALYZE
    // ========================================
    logger.info("Converting URL to base64...");
    const base64 = await urlToBase64(foto);

    logger.info("Analyzing image...");
    const analyzeResult = await analyzeImage({ image: base64 });
    logger.info("Analyze result:", JSON.stringify(analyzeResult, null, 2));

    // ========================================
    // 5. AI: IDENTIFIKASI WARNA BACKGROUND
    // ========================================
    logger.info("AI: Identifying background color...");
    const colorIdentification = await identifyColorName(
      analyzeResult.background_color.hex
    );
    logger.info(
      `AI identified: ${colorIdentification.color_name} (${colorIdentification.description})`
    );

    // ========================================
    // 6. AI: VALIDASI BACKGROUND
    // ========================================
    logger.info("AI: Validating background...");
    const bgValidation = await validateBackgroundColor(
      analyzeResult.background_color.hex,
      colorIdentification.color_name,
      bgRequirement.hex,
      bgRequirement.label
    );
    logger.info(
      `Validation: valid=${bgValidation.is_valid}, needs_improvement=${
        bgValidation.needs_improvement || false
      }`
    );
    logger.info(`Reason: ${bgValidation.reason}`);

    let correctedImageBase64 = null;
    let backgroundFixed = false;

    // ========================================
    // 7. FIX BACKGROUND (jika perlu)
    // ========================================
    const shouldFix = !bgValidation.is_valid || bgValidation.needs_improvement;

    if (shouldFix) {
      logger.info("Background needs correction, fixing...");
      const changeResult = await changeBackground({
        image: base64,
        background_color: bgRequirement.hex,
      });

      logger.info(`Change result: ${JSON.stringify(changeResult, null, 2)}`);

      const imageExtensionFromBase64 = changeResult.result
        .split("data:image/")[1]
        .split(";")[0];

      logger.info(`Image extension from base64: ${imageExtensionFromBase64}`);

      const filename = `${hashNip(nip)}.${imageExtensionFromBase64}`;
      logger.info(`Filename: ${filename}`);

      // Extract base64 data after the comma (remove data:image/jpeg;base64, prefix)
      const base64Data = changeResult.result.split(",")[1];
      const fileBuffer = Buffer.from(base64Data, "base64");

      const fileMetadata = {
        "X-Amz-Meta-Uploaded-By": req?.user?.customId,
        "X-Amz-Meta-Upload-Date": new Date().toISOString(),
        "X-Amz-Meta-Original-Name": filename,
        "X-Amz-Meta-File-Size": fileBuffer.length.toString(),
        "X-Amz-Meta-File-Extension": imageExtensionFromBase64,
        "X-Amz-Meta-File-Type": "image",
        "X-Amz-Meta-File-Hash": hashNip(nip),
      };
      logger.info(`File metadata: ${JSON.stringify(fileMetadata, null, 2)}`);

      await uploadFileToMinio(
        req?.mc,
        "public",
        fileBuffer,
        filename,
        fileBuffer.length,
        "image",
        fileMetadata
      );

      const url = generatePublicUrl(filename, "public");

      correctedImageBase64 = url;
      backgroundFixed = true;
      logger.info("✓ Background successfully changed");
    } else {
      logger.info("✓ Background already correct, no fix needed");
    }

    // ========================================
    // 8. AI: GENERATE COMPLETE INSIGHT
    // ========================================
    logger.info("AI: Generating complete insight...");
    const insight = await generateCompleteInsight(
      analyzeResult,
      colorIdentification,
      bgValidation,
      bgRequirement,
      backgroundFixed
    );

    logger.info(`AI Insight: ${JSON.stringify(insight, null, 2)}`);
    logger.info(`AI Insight score: ${insight.score}`);

    // ========================================
    // 9. SAVE TO DATABASE
    // ========================================
    logger.info("Saving to database...");
    const saved = await PhotoInsight.query()
      .insert({
        nip,
        jenis_jabatan: jenisJabatan,
        eselon_id: eselonId,
        original_photo_url: foto,
        detected_bg_hex: analyzeResult.background_color.hex,
        detected_bg_color: colorIdentification.color_name,
        required_bg_hex: bgRequirement.hex,
        required_bg_label: bgRequirement.label,
        is_bg_valid: bgValidation.is_valid,
        background_fixed: backgroundFixed,
        corrected_image_url: correctedImageBase64,
        ai_insight: insight,
        analysis_data: analyzeResult,
      })
      .onConflict("nip")
      .merge()
      .returning("*");

    // ========================================
    // 10. RESPONSE
    // ========================================
    const message = backgroundFixed
      ? `✨ Background foto berhasil diperbaiki menjadi ${bgRequirement.label}!`
      : `✅ Background foto sudah sesuai standar!`;

    logger.info("=== checkFotoPersonal SUCCESS ===");

    res.json({
      success: true,
      message,
      cached: false,
      data: formatPhotoInsightResponse(saved),
    });
  } catch (error) {
    logger.error("=== checkFotoPersonal ERROR ===");
    logger.error(error);
    handleError(res, error);
  }
};

export const checkFotoPersonal = async (req, res) => {
  try {
    logger.info("=== checkFotoPersonal START ===");

    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const { refresh = false } = req.body;

    logger.info(`NIP: ${nip}, Refresh: ${refresh}`);
    // ========================================
    // 1. CEK CACHE DATABASE (jika tidak refresh)
    // ========================================
    if (!refresh) {
      const cached = await PhotoInsight.query().where("nip", nip).first();
      if (cached) {
        logger.info("✓ Data found in cache");
        return res.json({
          success: true,
          message: "✨ Data ditemukan dari pemeriksaan sebelumnya",
          cached: true,
          data: formatPhotoInsightResponse(cached),
        });
      }

      logger.info("✗ No cache found, generating new insight...");
    } else {
      logger.info("⟳ Force refresh requested");
    }

    // ========================================
    // 2. FETCH DATA PEGAWAI
    // ========================================
    logger.info("Fetching employee data...");
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    const foto = result?.data?.foto;

    const jenisJabatan = result?.data?.jabatan?.jenis_jabatan;
    const eselonId = result?.data?.jabatan?.eselon_id;

    if (!foto) {
      logger.warn("Photo URL not found");
      return res.status(404).json({
        success: false,
        message: "Foto pegawai tidak ditemukan di sistem",
      });
    }

    logger.info(`Jabatan: ${jenisJabatan}, Eselon: ${eselonId || "N/A"}`);

    // ========================================
    // 3. GET BACKGROUND REQUIREMENT
    // ========================================
    const bgRequirement = getBackgroundRequirement(jenisJabatan, eselonId);
    logger.info(
      `Background requirement: ${bgRequirement.label} (${bgRequirement.hex})`
    );

    // ========================================
    // 4. CONVERT URL TO BASE64 & ANALYZE
    // ========================================
    logger.info("Converting URL to base64...");
    const base64 = await urlToBase64(foto);

    logger.info("Analyzing image...");
    const analyzeResult = await analyzeImage({ image: base64 });
    logger.info("Analyze result:", JSON.stringify(analyzeResult, null, 2));

    // ========================================
    // 5. AI: IDENTIFIKASI WARNA BACKGROUND
    // ========================================
    logger.info("AI: Identifying background color...");
    const colorIdentification = await identifyColorName(
      analyzeResult.background_color.hex
    );
    logger.info(
      `AI identified: ${colorIdentification.color_name} (${colorIdentification.description})`
    );

    // ========================================
    // 6. AI: VALIDASI BACKGROUND
    // ========================================
    logger.info("AI: Validating background...");
    const bgValidation = await validateBackgroundColor(
      analyzeResult.background_color.hex,
      colorIdentification.color_name,
      bgRequirement.hex,
      bgRequirement.label
    );
    logger.info(
      `Validation: valid=${bgValidation.is_valid}, needs_improvement=${
        bgValidation.needs_improvement || false
      }`
    );
    logger.info(`Reason: ${bgValidation.reason}`);

    let correctedImageBase64 = null;
    let backgroundFixed = false;

    // ========================================
    // 7. FIX BACKGROUND (jika perlu)
    // ========================================
    const shouldFix = !bgValidation.is_valid || bgValidation.needs_improvement;

    if (shouldFix) {
      logger.info("Background needs correction, fixing...");
      const changeResult = await changeBackground({
        image: base64,
        background_color: bgRequirement.hex,
      });

      logger.info(`Change result: ${JSON.stringify(changeResult, null, 2)}`);

      const imageExtensionFromBase64 = changeResult.result
        .split("data:image/")[1]
        .split(";")[0];

      logger.info(`Image extension from base64: ${imageExtensionFromBase64}`);

      const filename = `${hashNip(nip)}.${imageExtensionFromBase64}`;
      logger.info(`Filename: ${filename}`);

      // Extract base64 data after the comma (remove data:image/jpeg;base64, prefix)
      const base64Data = changeResult.result.split(",")[1];
      const fileBuffer = Buffer.from(base64Data, "base64");

      const fileMetadata = {
        "X-Amz-Meta-Uploaded-By": req?.user?.customId,
        "X-Amz-Meta-Upload-Date": new Date().toISOString(),
        "X-Amz-Meta-Original-Name": filename,
        "X-Amz-Meta-File-Size": fileBuffer.length.toString(),
        "X-Amz-Meta-File-Extension": imageExtensionFromBase64,
        "X-Amz-Meta-File-Type": "image",
        "X-Amz-Meta-File-Hash": hashNip(nip),
      };
      logger.info(`File metadata: ${JSON.stringify(fileMetadata, null, 2)}`);

      await uploadFileToMinio(
        req?.mc,
        "public",
        fileBuffer,
        filename,
        fileBuffer.length,
        "image",
        fileMetadata
      );

      const url = generatePublicUrl(filename, "public");

      correctedImageBase64 = url;
      backgroundFixed = true;
      logger.info("✓ Background successfully changed");
    } else {
      logger.info("✓ Background already correct, no fix needed");
    }

    // ========================================
    // 8. AI: GENERATE COMPLETE INSIGHT
    // ========================================
    logger.info("AI: Generating complete insight...");
    const insight = await generateCompleteInsight(
      analyzeResult,
      colorIdentification,
      bgValidation,
      bgRequirement,
      backgroundFixed
    );

    logger.info(`AI Insight: ${JSON.stringify(insight, null, 2)}`);
    logger.info(`AI Insight score: ${insight.score}`);

    // ========================================
    // 9. SAVE TO DATABASE
    // ========================================
    logger.info("Saving to database...");
    const saved = await PhotoInsight.query()
      .insert({
        nip,
        jenis_jabatan: jenisJabatan,
        eselon_id: eselonId,
        original_photo_url: foto,
        detected_bg_hex: analyzeResult.background_color.hex,
        detected_bg_color: colorIdentification.color_name,
        required_bg_hex: bgRequirement.hex,
        required_bg_label: bgRequirement.label,
        is_bg_valid: bgValidation.is_valid,
        background_fixed: backgroundFixed,
        corrected_image_url: correctedImageBase64,
        ai_insight: insight,
        analysis_data: analyzeResult,
      })
      .onConflict("nip")
      .merge()
      .returning("*");

    // ========================================
    // 10. RESPONSE
    // ========================================
    const message = backgroundFixed
      ? `✨ Background foto berhasil diperbaiki menjadi ${bgRequirement.label}!`
      : `✅ Background foto sudah sesuai standar!`;

    logger.info("=== checkFotoPersonal SUCCESS ===");

    res.json({
      success: true,
      message,
      cached: false,
      data: formatPhotoInsightResponse(saved),
    });
  } catch (error) {
    logger.error("=== checkFotoPersonal ERROR ===");
    logger.error(error);
    handleError(res, error);
  }
};

/**
 * Analyze image using OCR service
 */
export const analyzeImageController = async (req, res) => {
  try {
    const { url, jenis_jabatan } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const base64 = await urlToBase64(url);
    const result = await analyzeImage({ image: base64 });

    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Check OCR service health status
 */
export const healthCheckController = async (req, res) => {
  try {
    const result = await checkHealth();
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Change image background color
 */
export const changeBackgroundController = async (req, res) => {
  try {
    const { url, background_color } = req.body;

    if (!url || !background_color) {
      return res.status(400).json({
        success: false,
        message: "URL and background_color are required",
      });
    }

    const base64 = await urlToBase64(url);
    const result = await changeBackground({
      image: base64,
      background_color,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove image background
 */
export const removeBackgroundController = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const base64 = await urlToBase64(url);
    const result = await removeBackground({ image: base64 });

    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};
