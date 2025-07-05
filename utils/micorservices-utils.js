const { default: axios } = require("axios");

// Konfigurasi untuk microservice Excel converter berbasis Rust
const EXCEL_CONVERTER_SERVICE_PORT = 3333;
const EXCEL_CONVERTER_SERVICE_URL = `http://localhost:${EXCEL_CONVERTER_SERVICE_PORT}`;

/**
 * Mengkonversi data ke format Excel menggunakan microservice Rust yang di-dockerisasi
 * @param {Array|Object} data - Data yang akan dikonversi ke Excel
 * @returns {Promise} Response dari microservice Excel converter
 */
module.exports.convertToExcel = async (data) => {
  try {
    console.time("convertToExcel");
    const response = await axios.post(
      `${EXCEL_CONVERTER_SERVICE_URL}/generate-excel`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 detik timeout untuk konversi Excel
        responseType: "arraybuffer",
      }
    );

    console.timeEnd("convertToExcel");

    return response.data;
  } catch (error) {
    console.timeEnd("convertToExcel");
    throw new Error(`Gagal mengkonversi data ke Excel: ${error.message}`);
  }
};

/**
 * Mengecek status kesehatan microservice Excel converter
 * @returns {Promise<boolean>} Status kesehatan service
 */
module.exports.checkExcelConverterHealth = async () => {
  try {
    const response = await axios.get(`${EXCEL_CONVERTER_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error("Excel converter service tidak tersedia:", error.message);
    return false;
  }
};

module.exports.convertCSVToExcel = async (data) => {
  try {
    const response = await axios.post(
      `${EXCEL_CONVERTER_SERVICE_URL}/csv-to-excel`,
      data,
      {
        headers: {
          "Content-Type": "text/csv",
        },
        timeout: 60000, // 60 detik timeout untuk konversi Excel
        responseType: "arraybuffer",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Gagal mengkonversi CSV ke Excel:", error.message);
  }
};
