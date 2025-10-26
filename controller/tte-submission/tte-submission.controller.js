import { handleError } from "@/utils/helper/controller-helper";

const { verifyUserWithNik } = require("@/utils/esign-utils");
const User = require("@/models/users.model");

const PengajuanTTE = require("@/models/tte_submission/pengajuan-tte.model");
const EmailPegawai = require("@/models/tte_submission/email-pegawai.model");
const SiasnEmployee = require("@/models/siasn-employees.model");

require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const removeChar = (str) => {
  return str.replace(/[^a-zA-Z0-9]/g, "");
};

// melakukan pengecekan apakah ybs mempunyai tte via bsre dan email jatimprov
export const checkTTE = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;

    let nik;

    if (!isProduction) {
      nik = process.env.ESIGN_NIK;
    } else {
      const result = await SiasnEmployee.query()
        .where("nip_baru", nip)
        .first()
        .select("nik");
      nik = result?.nik;
    }

    const result = await verifyUserWithNik({ nik: removeChar(nik) });
    const EmailJatimprov = await EmailPegawai.query().where("nip", nip).first();

    const data = {
      bsre: result?.data?.status_code === "1111" ? true : false,
      mail_jatim: EmailJatimprov ? true : false,
      bsre_info: result?.data,
      mail_jatim_info: EmailJatimprov?.email_jatimprov || null,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const createPengajuanTTE = async (req, res) => {
  try {
    const { employee_number: nip, custom_id: user_id } = req?.user;

    // Cek apakah pengguna sudah memiliki pengajuan TTE yang masih dalam proses
    const existingSubmission = await PengajuanTTE.query()
      .where("nip", nip)
      .andWhere("user_id", user_id)
      .whereIn("status", ["DRAFT", "DIAJUKAN"])
      .first();

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah memiliki pengajuan TTE yang sedang diproses.",
      });
    }

    // Ambil data NIK dan email secara paralel
    const [employeeData, emailData] = await Promise.all([
      SiasnEmployee.query().where("nip_baru", nip).first().select("nik"),
      EmailPegawai.query().where("nip", nip).first().select("email_jatimprov"),
    ]);

    // Buat pengajuan TTE baru
    const payload = {
      nip,
      nik: removeChar(employeeData?.nik),
      email_jatimprov: emailData?.email_jatimprov,
      user_id,
      status: "DRAFT",
    };

    const result = await PengajuanTTE.query().insert(payload).returning("*");

    console.log(result);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPengajuanTTE = async (req, res) => {
  try {
    const { custom_id: user_id } = req?.user;

    const result = await PengajuanTTE.query()
      .where("user_id", user_id)
      .orderBy("tanggal_ajuan", "desc");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePengajuanTTE = async (req, res) => {
  try {
    const { employee_number: nip, custom_id: user_id } = req?.user;
  } catch (error) {
    handleError(res, error);
  }
};

export const getPengajuanTTEById = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await PengajuanTTE.query().where("id", id).first();
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan TTE tidak ditemukan",
      });
    }
    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data pengajuan TTE",
    });
  }
};
