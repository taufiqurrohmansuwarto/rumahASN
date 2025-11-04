import axios from "axios";
import { handleError } from "@/utils/helper/controller-helper";
import {
  analyzeImage,
  changeBackground,
  checkHealth,
  removeBackground,
} from "@/utils/microservices/ocr.services";

/**
 * Convert image URL to base64 string
 * @param {string} url - Image URL
 * @returns {Promise<string>} Base64 encoded image
 */
const urlToBase64 = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data).toString("base64");
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
