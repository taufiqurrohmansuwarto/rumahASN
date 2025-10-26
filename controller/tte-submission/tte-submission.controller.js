import { handleError } from "@/utils/helper/controller-helper";
import { log } from "@/utils/logger";
import { nanoid } from "nanoid";
import {
  uploadFileToMinio,
  generatePublicUrl,
} from "@/utils/helper/minio-helper";
import axios from "axios";

const {
  verifyUserWithNik,
  getDataProfileWithNik,
} = require("@/utils/esign-utils");
const User = require("@/models/users.model");

const PengajuanTTE = require("@/models/tte_submission/pengajuan-tte.model");
const EmailSubmission = require("@/models/tte_submission/pengajuan-email.model");
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
    const profile = await getDataProfileWithNik({ nik: removeChar(nik) });

    const EmailJatimprov = await EmailPegawai.query().where("nip", nip).first();

    const data = {
      bsre: result?.data?.status_code === "1111" ? true : false,
      mail_jatim: EmailJatimprov ? true : false,
      bsre_info: profile?.data || null,
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

export const submitPengajuanTTE = async (req, res) => {
  try {
    const { id } = req.query;
    const { custom_id: user_id } = req?.user;
    const currentSubmission = await PengajuanTTE.query()
      .where("id", id)
      .andWhere("user_id", user_id)
      .first();

    if (!currentSubmission) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan TTE tidak ditemukan",
      });
    } else {
      const status = currentSubmission.status;
      const allowedStatus = ["DRAFT", "PERBAIKAN"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Pengajuan TTE tidak dapat disubmit",
        });
      }
    }

    await PengajuanTTE.query()
      .patch({
        status: "DIAJUKAN",
        tanggal_ajuan: new Date(),
      })
      .where("id", id);

    res.status(200).json({
      success: true,
      message: "Pengajuan TTE berhasil disubmit",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadFilePengajuanTTE = async (req, res) => {
  try {
    const { type } = req.body;
    const { id } = req.query;
    const { custom_id: user_id } = req?.user;
    const { mc } = req;

    // Validate file upload
    if (!req.file) {
      log.error("File tidak ditemukan");
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // Validate type parameter
    const validTypes = ["ktp", "skj", "surat_usulan"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe file tidak valid",
      });
    }

    // Validate id parameter
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID pengajuan tidak ditemukan",
      });
    }

    const currentFile = req.file;
    const extension = currentFile.originalname.split(".").pop();
    const filename = `tte-submission/${type}/${id}-${type}.${extension}`;

    // Upload file to Minio
    await uploadFileToMinio(
      mc,
      "public",
      currentFile.buffer,
      filename,
      currentFile.size,
      currentFile.mimetype,
      {
        "x-amz-meta-user_id": user_id,
        "x-amz-meta-type": type,
        "x-amz-meta-filename": currentFile.originalname,
        "x-amz-meta-upload-date": new Date().toISOString(),
      }
    );

    const fileUrl = generatePublicUrl(filename);

    // Map type to database column
    const typeToColumnMap = {
      ktp: "file_ktp",
      skj: "file_sk_pangkat",
      surat_usulan: "file_surat_usulan",
    };

    // Update database with file URL
    await PengajuanTTE.query()
      .patch({
        [typeToColumnMap[type]]: fileUrl,
      })
      .where("id", id);

    const data = {
      url: fileUrl,
      name: currentFile.originalname,
      status: "done",
      uid: nanoid(),
    };

    console.log(data);

    res.status(200).json({
      success: true,
      message: "File berhasil diupload",
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// get dokumen via simaster yaitu jabatan
export const getDokumenTTE = async (req, res) => {
  try {
    const { id } = req.query;
    const { custom_id: user_id, employee_number: nip } = req?.user;
    const fetcher = req.fetcher;

    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-jab`
    );

    if (result?.data?.length) {
      const dataJabatan = result?.data;
      const data = {
        ktp: null,
        jabatan: dataJabatan,
      };
      res.json(data);
    } else {
      res.json(null);
    }
  } catch (error) {
    handleError(res, error);
  }
};

// Upload file dari URL external (untuk SK Jabatan dari riwayat)
export const uploadFileFromUrl = async (req, res) => {
  try {
    const { url, type } = req.body;
    const { id } = req.query;
    const { custom_id: user_id } = req?.user;
    const { mc } = req;

    // Validate required parameters
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL file tidak ditemukan",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Tipe file tidak ditemukan",
      });
    }

    const validTypes = ["ktp", "skj", "surat_usulan"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe file tidak valid",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID pengajuan tidak ditemukan",
      });
    }

    // Download file from URL
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 seconds
    });

    const buffer = Buffer.from(response.data, "binary");
    const contentType = response.headers["content-type"] || "application/pdf";

    // Get filename from URL
    const urlParts = url.split("/");
    const originalFilename = urlParts[urlParts.length - 1];
    const extension = originalFilename.split(".").pop();

    const filename = `tte-submission/${type}/${id}-${type}.${extension}`;

    // Upload file to Minio
    await uploadFileToMinio(
      mc,
      "public",
      buffer,
      filename,
      buffer.length,
      contentType,
      {
        "x-amz-meta-user_id": user_id,
        "x-amz-meta-type": type,
        "x-amz-meta-filename": originalFilename,
        "x-amz-meta-source": "external_url",
        "x-amz-meta-upload-date": new Date().toISOString(),
      }
    );

    const fileUrl = generatePublicUrl(filename);

    // Map type to database column
    const typeToColumnMap = {
      ktp: "file_ktp",
      skj: "file_sk_pangkat",
      surat_usulan: "file_surat_usulan",
    };

    // Update database with file URL
    await PengajuanTTE.query()
      .patch({
        [typeToColumnMap[type]]: fileUrl,
      })
      .where("id", id);

    const data = {
      url: fileUrl,
      name: originalFilename,
      status: "done",
      uid: nanoid(),
    };

    res.status(200).json({
      success: true,
      message: "File berhasil diupload dari URL",
      data,
    });
  } catch (error) {
    log.error("Error uploading file from URL:", error);
    handleError(res, error);
  }
};

// admin
export const getPengajuanTTEAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "DIAJUKAN",
    } = req.query;

    let query = PengajuanTTE.query()
      .withGraphFetched("[user(simpleWithImage), korektor(simpleWithImage)]")
      .where((builder) => {
        if (search) {
          builder.where((searchBuilder) => {
            searchBuilder.where("nip", "ilike", `%${search}%`).orWhereExists(
              PengajuanTTE.relatedQuery("user").where((userBuilder) => {
                userBuilder
                  .where("username", "ilike", `%${search}%`)
                  .orWhere("employee_number", "ilike", `%${search}%`);
              })
            );
          });
        }
        if (status) {
          builder.where("status", status);
        }
      })
      .orderBy("tanggal_ajuan", "desc");

    // Jika limit -1, ambil semua data tanpa pagination
    if (parseInt(limit) === -1) {
      const results = await query;
      res.json({
        data: results,
        total: results.length,
        page: 1,
        limit: -1,
      });
    } else {
      const result = await query.page(page - 1, limit);
      res.json({
        data: result.results,
        total: result.total,
        page: page,
        limit: limit,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePengajuanTTEAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    const { custom_id: user_id } = req?.user;
    const { status, catatan } = req.body;

    await PengajuanTTE.query()
      .patch({
        status,
        catatan,
        tanggal_diproses: new Date(),
        diproses_oleh: user_id,
      })
      .where("id", id);

    res.status(200).json({
      success: true,
      message: "Pengajuan TTE berhasil diupdate",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const flushDataPengajuan = async (req, res) => {
  try {
    log.info("Flushing data pengajuan TTE");
    await Promise.all([
      PengajuanTTE.query().delete(),
      EmailSubmission.query().delete(),
      EmailPegawai.query().delete(),
    ]);
    res.status(200).json({
      success: true,
      message: "Data pengajuan TTE berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};
