const {
  getSealActivationOTP,
  verifyPdf,
  verifyUserWithNik,
} = require("@/utils/esign-utils");
const DSSegelTOTP = require("@/models/ds-segel-totp.model");
const LogSealBsre = require("@/models/log-seal-bsre.model");
const Pegawai = require("@/models/siasn-employees.model");
const PegawaiSimaster = require("@/models/sync-pegawai.model");

/**
 * Menghapus karakter petik tunggal dari string
 * @param {string} str - String yang akan diproses
 * @returns {string} - String tanpa karakter petik tunggal
 */
const removeChar = (str) => {
  return str.replace(/'/g, "");
};

/**
 * Fungsi helper untuk verifikasi pengguna TTE
 * @param {Object} params - Parameter verifikasi
 * @param {string} params.nik - NIK pengguna yang akan diverifikasi
 * @param {string} params.nip - NIP pengguna untuk mendapatkan data tambahan
 * @param {Object} params.userData - Data pengguna tambahan (opsional)
 * @returns {Promise<Object>} - Hasil verifikasi {success, data, message}
 */
const verifyTTEUser = async ({ nik, nip, userData = null }) => {
  try {
    // Verifikasi pengguna dengan NIK
    const verifyResult = await verifyUserWithNik({ nik: removeChar(nik) });

    if (!verifyResult?.success) {
      return {
        success: false,
        message: verifyResult?.data?.message || "Verifikasi TTE gagal",
      };
    }

    // Jika userData tidak disediakan, cari data dari database
    if (!userData) {
      userData = await PegawaiSimaster.query().where("nip_master", nip).first();
    }

    if (!userData) {
      return { success: false, message: "Data pengguna tidak ditemukan" };
    }

    // Kembalikan data pengguna terformat
    return {
      success: true,
      data: {
        nama: userData?.nama || userData?.nama_master,
        nip: userData?.nip_baru || userData?.nip_master,
        foto: userData?.foto,
      },
    };
  } catch (error) {
    console.error("Error verifying TTE user:", error);
    return { success: false, message: "Terjadi kesalahan saat verifikasi TTE" };
  }
};

/**
 * Mencatat log aktivitas seal BSRE
 * @param {string} userId - ID pengguna
 * @param {string} action - Jenis aksi
 * @param {string} status - Status aksi (SUCCESS/ERROR)
 * @param {Object} requestData - Data permintaan
 * @param {Object} responseData - Data respons
 * @param {string} description - Deskripsi aksi
 * @returns {Promise<Object>} - Hasil pencatatan log
 */
const logSealActivity = async (
  userId,
  action,
  status,
  requestData = {},
  responseData,
  description
) => {
  try {
    return await LogSealBsre.query().insert({
      user_id: userId,
      action,
      status,
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(responseData),
      description,
    });
  } catch (error) {
    console.error("Error logging seal activity:", error);
    return null;
  }
};

/**
 * Meminta konfirmasi TOTP untuk aktivasi seal
 */
const requestTotpConfirmation = async (req, res) => {
  try {
    const result = await getSealActivationOTP();
    const { customId: userId } = req?.user;
    const description = "Request TOTP Seal Activation";

    if (result?.success) {
      await logSealActivity(
        userId,
        "REQUEST_TOTP",
        "SUCCESS",
        {},
        result,
        description
      );
      res.json(result?.data);
    } else {
      await logSealActivity(
        userId,
        "REQUEST_TOTP",
        "ERROR",
        {},
        result,
        description
      );
      res.status(500).json({ code: 500, message: result?.data?.message });
    }
  } catch (error) {
    console.error("Error in requestTotpConfirmation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Menyimpan konfirmasi TOTP
 */
const saveTotpConfirmation = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { totp } = req?.body;

    const result = await DSSegelTOTP.query().insert({
      totp,
      type: "SEAL_ACTIVATION",
      user_id: userId,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in saveTotpConfirmation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mendapatkan konfirmasi TOTP terakhir
 */
const getLastTotpConfirmation = async (req, res) => {
  try {
    const result = await DSSegelTOTP.query()
      .where("type", "SEAL_ACTIVATION")
      .orderBy("created_at", "desc")
      .first();

    res.json(result);
  } catch (error) {
    console.error("Error in getLastTotpConfirmation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Memverifikasi file PDF
 */
const verifyPdfController = async (req, res) => {
  try {
    const { file } = req?.body;
    const result = await verifyPdf({ file });

    if (result?.success) {
      res.json({ success: true, data: result?.data });
    } else {
      res.status(500).json({ success: false, data: result?.data });
    }
  } catch (error) {
    console.error("Error in verifyPdfController:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Memeriksa status TTE pengguna berdasarkan data sesi
 */
const checkTTEUser = async (req, res) => {
  try {
    const { employee_number } = req?.user;

    const currentEmployee = await Pegawai.query()
      .where("nip_baru", employee_number)
      .first();

    if (!currentEmployee) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    const nik = currentEmployee?.nik;
    const verificationResult = await verifyTTEUser({
      nik,
      nip: employee_number,
    });

    if (verificationResult.success) {
      res.json(verificationResult.data);
    } else {
      res.status(400).json({ code: 400, message: verificationResult.message });
    }
  } catch (error) {
    console.error("Error in checkTTEUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Memeriksa status TTE pengguna berdasarkan NIP
 */
const checkTTEUserByNip = async (req, res) => {
  try {
    const { nip: employee_number } = req?.query;

    const currentEmployee = await Pegawai.query()
      .where("nip_baru", employee_number)
      .first();

    if (!currentEmployee) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    const nik = currentEmployee?.nik;
    const verificationResult = await verifyTTEUser({
      nik,
      nip: employee_number,
    });

    if (verificationResult.success) {
      res.json(verificationResult.data);
    } else {
      res.status(400).json({ code: 400, message: verificationResult.message });
    }
  } catch (error) {
    console.error("Error in checkTTEUserByNip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Check QR Code untuk verifikasi dokumen E-Sign (Public)
 * Endpoint: /api/public/check-qr/esign/[document_code]
 */
const checkQRDocument = async (req, res) => {
  try {
    const { id: documentCode } = req.query;
    const Documents = require("@/models/esign/esign-documents.model");

    if (!documentCode) {
      return res.status(400).json({
        code: 400,
        message: "Document code is required",
      });
    }

    // Cari dokumen berdasarkan document_code dengan relasi lengkap
    const document = await Documents.query()
      .where("document_code", documentCode)
      .withGraphFetched(
        "[user(simpleWithImage), signature_requests.[creator(simpleWithImage), signature_details.[user(simpleWithImage)]]]"
      )
      .first();

    if (!document) {
      return res.status(404).json({
        code: 404,
        message: "Dokumen tidak ditemukan",
      });
    }

    // Format response untuk public view
    const response = {
      document_code: document.document_code,
      title: document.title,
      description: document.description,
      status: document.status,
      created_at: document.created_at,
      updated_at: document.updated_at,
      total_pages: document.total_pages,
      file_size: document.file_size,
      is_public: document.is_public,
      creator: {
        name: document.user?.username || document.user?.nama_master,
        image: document.user?.image,
      },
      signature_info: [],
    };

    // Tambahkan informasi signature jika ada
    if (document.signature_requests && document.signature_requests.length > 0) {
      const signatureRequest = document.signature_requests[0];

      response.signature_info = signatureRequest.signature_details.map((detail) => ({
        signer_name: detail.user?.username || detail.user?.nama_master,
        role_type: detail.role_type,
        status: detail.status,
        signed_at: detail.signed_at,
        sequence_order: detail.sequence_order,
      }));

      response.request_type = signatureRequest.request_type;
      response.request_status = signatureRequest.status;
      response.completed_at = signatureRequest.completed_at;
    }

    res.json({
      code: 200,
      message: "Dokumen berhasil diverifikasi",
      data: response,
    });
  } catch (error) {
    console.error("Error in checkQRDocument:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  checkTTEUser,
  checkTTEUserByNip,
  requestTotpConfirmation,
  saveTotpConfirmation,
  getLastTotpConfirmation,
  verifyPdfController,
  verifyTTEUser,
  checkQRDocument,
};
