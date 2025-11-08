const dayjs = require("dayjs");
const XLSX = require("xlsx");
const ASNGender = require("@/models/statistik/asn-gender.model");
const { handleError } = require("@/utils/helper/controller-helper");

/**
 * Membaca file Excel dan mengkonversi ke JSON
 * @param {Buffer} fileBuffer - Buffer file Excel
 * @returns {Array} Array of objects dari Excel
 */
const readExcelFile = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
};

/**
 * Parse tanggal dari berbagai format (Excel serial number, string, Date)
 * @param {any} tanggalValue - Nilai tanggal dari Excel
 * @returns {dayjs.Dayjs|null} dayjs object atau null jika invalid
 */
const parseTanggal = (tanggalValue) => {
  if (!tanggalValue) return null;

  let tanggal;
  if (typeof tanggalValue === "number") {
    // Excel date serial number (Excel epoch starts from 1900-01-01)
    // Convert Excel serial date to JavaScript date
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const jsDate = new Date(excelEpoch.getTime() + tanggalValue * 86400000); // 86400000 ms per day
    tanggal = dayjs(jsDate);
  } else if (typeof tanggalValue === "string") {
    // Try parsing as string date
    tanggal = dayjs(tanggalValue);
  } else if (tanggalValue instanceof Date) {
    tanggal = dayjs(tanggalValue);
  } else {
    return null;
  }

  return tanggal.isValid() ? tanggal : null;
};

/**
 * Parse nilai boolean dari berbagai format
 * @param {any} value - Nilai yang akan di-parse
 * @returns {boolean} Boolean value
 */
const parseBoolean = (value) => {
  if (value === undefined || value === null) return false;

  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    const lowerValue = value.toLowerCase();
    return (
      lowerValue === "true" ||
      value === "1" ||
      lowerValue === "ya" ||
      lowerValue === "yes"
    );
  } else if (typeof value === "number") {
    return value === 1;
  }

  return false;
};

/**
 * Validasi dan transform data dari Excel ke format database
 * @param {Array} excelData - Data dari Excel
 * @returns {Object} { dataToInsert: Array, errors: Array }
 */
const validateAndTransformData = (excelData) => {
  const dataToInsert = [];
  const errors = [];

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];
    const rowNumber = i + 2; // +2 karena Excel mulai dari 1 dan baris 1 adalah header

    // Validasi field yang diperlukan
    if (!row.unor_id) {
      errors.push(`Baris ${rowNumber}: unor_id tidak boleh kosong`);
      continue;
    }

    if (
      row.jumlah_pria === undefined ||
      row.jumlah_pria === null ||
      row.jumlah_pria === ""
    ) {
      errors.push(`Baris ${rowNumber}: jumlah_pria tidak boleh kosong`);
      continue;
    }

    if (
      row.jumlah_wanita === undefined ||
      row.jumlah_wanita === null ||
      row.jumlah_wanita === ""
    ) {
      errors.push(`Baris ${rowNumber}: jumlah_wanita tidak boleh kosong`);
      continue;
    }

    if (
      row.jumlah_total === undefined ||
      row.jumlah_total === null ||
      row.jumlah_total === ""
    ) {
      errors.push(`Baris ${rowNumber}: jumlah_total tidak boleh kosong`);
      continue;
    }

    if (!row.tanggal) {
      errors.push(`Baris ${rowNumber}: tanggal tidak boleh kosong`);
      continue;
    }

    // Parse tanggal
    const tanggal = parseTanggal(row.tanggal);
    if (!tanggal) {
      errors.push(
        `Baris ${rowNumber}: Format tanggal tidak valid (${row.tanggal})`
      );
      continue;
    }

    // Parse is_cpns
    const isCpns = parseBoolean(row.is_cpns);

    dataToInsert.push({
      unor_id: String(row.unor_id).trim(),
      jumlah_pria: parseInt(row.jumlah_pria) || 0,
      jumlah_wanita: parseInt(row.jumlah_wanita) || 0,
      jumlah_total: parseInt(row.jumlah_total) || 0,
      status: row.status ? String(row.status).trim() : null,
      is_cpns: isCpns,
      tanggal: tanggal.format("YYYY-MM-DD"),
      created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
  }

  return { dataToInsert, errors };
};

/**
 * Replace data periode: hapus semua data dengan periode tertentu, kemudian insert data baru
 * @param {string} startOfMonth - Tanggal awal bulan (YYYY-MM-DD)
 * @param {string} endOfMonth - Tanggal akhir bulan (YYYY-MM-DD)
 * @param {Array} dataToInsert - Data yang akan di-insert
 */
const replacePeriodeData = async (startOfMonth, endOfMonth, dataToInsert) => {
  const knex = ASNGender.knex();
  await knex.transaction(async (trx) => {
    // Hapus semua data dengan periode tertentu
    await ASNGender.query(trx)
      .whereBetween("tanggal", [startOfMonth, endOfMonth])
      .delete();

    // Insert data baru
    if (dataToInsert.length > 0) {
      await knex("statistik.asn_gender").transacting(trx).insert(dataToInsert);
    }
  });
};

export const getStatistikASNGender = async (req, res) => {
  try {
    const startOfMonth = dayjs().startOf("month").format("DD-MM-YYYY");
    const { unor_id, periode = startOfMonth } = req?.query;

    const query = ASNGender.query()
      .withGraphFetched("[perangkat_daerah]")
      .where("tanggal", ">=", dayjs(periode, "DD-MM-YYYY").format("YYYY-MM-DD"))
      .modify((builder) => {
        if (unor_id) {
          builder.where("unor_id", unor_id);
        }
      });

    const data = await query;

    return res.json(data);
  } catch (error) {
    return handleError(res, error);
  }
};

export const uploadStatistikASNGender = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    const { periode } = req?.body || req?.query;

    if (!periode) {
      return res.status(400).json({
        success: false,
        message: "Periode tidak boleh kosong",
      });
    }

    // Parse periode ke format tanggal
    const periodeDate = dayjs(periode, "DD-MM-YYYY");
    if (!periodeDate.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Format periode tidak valid. Gunakan format DD-MM-YYYY",
      });
    }

    const startOfMonth = periodeDate.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = periodeDate.endOf("month").format("YYYY-MM-DD");

    // Baca file Excel
    const excelData = readExcelFile(req.file.buffer);

    if (!excelData || excelData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File Excel kosong atau format tidak valid",
      });
    }

    // Validasi dan transform data
    const { dataToInsert, errors } = validateAndTransformData(excelData);

    // Jika ada error validasi, return error
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Terdapat error pada data Excel",
        errors: errors.slice(0, 10), // Batasi max 10 error ditampilkan
        totalErrors: errors.length,
      });
    }

    // Replace periode: hapus semua data dengan periode tertentu, kemudian insert data baru
    await replacePeriodeData(startOfMonth, endOfMonth, dataToInsert);

    res.status(200).json({
      success: true,
      message: `Upload berhasil! ${dataToInsert.length} data berhasil diimport untuk periode ${periode}`,
      summary: {
        total: excelData.length,
        inserted: dataToInsert.length,
        periode: periode,
      },
    });
  } catch (error) {
    console.error("Upload Excel Error:", error);
    return handleError(res, error);
  }
};
