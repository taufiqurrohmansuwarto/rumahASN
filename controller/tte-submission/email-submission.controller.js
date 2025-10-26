const EmailJatimProvPegawai = require("@/models/tte_submission/email-pegawai.model");
const EmailSubmission = require("@/models/tte_submission/pengajuan-email.model");
const Users = require("@/models/users.model");
const SiasnEmployee = require("@/models/siasn-employees.model");
const { nanoid } = require("nanoid");

import { handleError } from "@/utils/helper/controller-helper";
import {
  generatePublicUrl,
  uploadFileToMinio,
} from "@/utils/helper/minio-helper";
const XLSX = require("xlsx");

// for user
export const createEmailSubmission = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { email_jatimprov, no_hp } = req.body;

    // check if user already has email jatimprov
    const emailJatimprovExists = await EmailJatimProvPegawai.query()
      .where("nip", nip)
      .first();

    // check if submission already exists
    const submissionExists = await EmailSubmission.query()
      .where("nip", nip)
      .andWhere("user_id", req?.user?.custom_id)
      .first();

    if (emailJatimprovExists || submissionExists) {
      res.status(400).json({
        success: false,
        message: emailJatimprovExists
          ? "Anda sudah memiliki email jatimprov"
          : "Permintaan email jatimprov Anda sudah diajukan sebelumnya dan sedang dalam proses verifikasi",
      });
    } else {
      const payload = {
        user_id: req?.user?.custom_id,
        nip,
        status: "DIAJUKAN",
        tanggal_ajuan: new Date(),
        no_hp,
      };

      await EmailSubmission.query().insert(payload);
      res.status(201).json({
        success: true,
        message:
          "Permintaan email jatimprov berhasil diajukan. Silakan tunggu proses verifikasi dari admin.",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const listEmailSubmission = async (req, res) => {
  try {
    const { custom_id: userId } = req?.user;
    const result = await EmailSubmission.query()
      .where("user_id", userId)
      .andWhere("status", "DIAJUKAN")
      .first();

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const checkSubmissionStatus = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const emailJatimprov = await EmailJatimProvPegawai.query()
      .where("nip", nip)
      .first();
    if (emailJatimprov) {
      res.json({
        success: true,
        data: emailJatimprov,
      });
    } else {
      res.json({
        success: false,
        message: "Anda belum memiliki email jatimprov",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// for admin
export const listEmailJatimprovPegawai = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    // Jika limit = -1, return all data tanpa pagination
    if (parseInt(limit) === -1) {
      const result = await EmailJatimProvPegawai.query()
        .where((builder) => {
          if (search) {
            builder
              .where("email_jatimprov", "ilike", `%${search}%`)
              .orWhere("nip", "ilike", `%${search}%`);
          }
        })
        .withGraphFetched("[user(simpleSelect)]")
        .orderBy("created_at", "desc");

      return res.json(result);
    }

    const result = await EmailJatimProvPegawai.query()
      .where((builder) => {
        if (search) {
          builder
            .where("email_jatimprov", "ilike", `%${search}%`)
            .orWhere("nip", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched("[user(simpleSelect)]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      total: result.total,
      page: page,
      limit: limit,
    };
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const listEmailSubmissionUser = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      status = "DIAJUKAN",
    } = req.query;

    // Jika limit = -1, return all data tanpa pagination
    if (parseInt(limit) === -1) {
      const result = await EmailSubmission.query()
        .where((builder) => {
          if (search) {
            builder
              .where("nip", "ilike", `%${search}%`)
              .orWhere("email_usulan", "ilike", `%${search}%`);
          }
        })
        .andWhere("status", status)
        .withGraphFetched("[user(simpleWithImage)]")
        .orderBy("created_at", "desc");

      return res.json(result);
    }

    const result = await EmailSubmission.query()
      .where((builder) => {
        if (search) {
          builder
            .where("nip", "ilike", `%${search}%`)
            .orWhere("email_usulan", "ilike", `%${search}%`);
        }
      })
      .andWhere("status", status)
      .withGraphFetched("[user(simpleWithImage)]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      total: result.total,
      page: page,
      limit: limit,
    };
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateEmailSubmission = async (req, res) => {
  try {
    const { id } = req.query;
    const { status, catatan, email_usulan } = req.body;

    const currentSubmission = await EmailSubmission.query()
      .findById(id)
      .first();

    const currentUserEmployeeNumber = await Users.query()
      .findById(currentSubmission.user_id)
      .select("custom_id", "employee_number")
      .first();

    const employeeNumber = currentUserEmployeeNumber.employee_number;

    // Strip @jatimprov.go.id jika sudah ada, baru format ulang
    const email_username = email_usulan
      ? email_usulan.replace("@jatimprov.go.id", "")
      : "";
    const email_usulan_formatted = email_username
      ? `${email_username}@jatimprov.go.id`
      : null;

    await EmailSubmission.query()
      .patchAndFetchById(id, {
        status,
        catatan,
        tanggal_diproses: new Date(),
        email_usulan: email_usulan_formatted,
      })
      .first();

    // upsert email jatimprov pegawai hanya jika email_username ada dan status SELESAI
    if (email_username && status === "SELESAI") {
      await EmailJatimProvPegawai.query()
        .insert({
          nip: employeeNumber,
          email_jatimprov: email_usulan_formatted,
          no_hp: currentSubmission.no_hp,
        })
        .onConflict("nip")
        .merge(["email_jatimprov", "no_hp"]);
    }

    res.status(200).json({
      success: true,
      message: "Permintaan email jatimprov berhasil diupdate",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadEmailJatimprovExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // Baca file Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File Excel kosong atau format tidak valid",
      });
    }

    // Validasi dan prepare data
    const emailsToInsert = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 karena Excel mulai dari 1 dan baris 1 adalah header

      // Validasi field yang diperlukan
      if (!row.nip) {
        errors.push(`Baris ${rowNumber}: NIP tidak boleh kosong`);
        continue;
      }

      if (!row.email_jatimprov) {
        errors.push(`Baris ${rowNumber}: Email tidak boleh kosong`);
        continue;
      }

      // Validasi format NIP (18 digit)
      const nip = String(row.nip).trim();
      if (nip.length !== 18) {
        errors.push(`Baris ${rowNumber}: NIP harus 18 digit (${nip})`);
        continue;
      }

      // Validasi format email
      const email = String(row.email_jatimprov).trim();
      if (!email.includes("@jatimprov.go.id")) {
        errors.push(
          `Baris ${rowNumber}: Email harus menggunakan domain @jatimprov.go.id (${email})`
        );
        continue;
      }

      emailsToInsert.push({
        nip,
        email_jatimprov: email,
        no_hp: row.no_hp ? String(row.no_hp).trim() : null,
      });
    }

    // Jika ada error validasi, return error
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Terdapat error pada data Excel",
        errors: errors.slice(0, 10), // Batasi max 10 error ditampilkan
        totalErrors: errors.length,
      });
    }

    // Batch insert dengan upsert (insert atau update jika sudah ada)
    let successCount = 0;
    let errorCount = 0;
    const detailedErrors = [];

    for (const emailData of emailsToInsert) {
      try {
        await EmailJatimProvPegawai.query()
          .insert(emailData)
          .onConflict("nip")
          .merge(["email_jatimprov", "no_hp"]);
        successCount++;
      } catch (error) {
        errorCount++;
        detailedErrors.push({
          nip: emailData.nip,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Upload berhasil! ${successCount} data berhasil diimport${
        errorCount > 0 ? `, ${errorCount} data gagal` : ""
      }`,
      summary: {
        total: data.length,
        success: successCount,
        failed: errorCount,
        errors: detailedErrors.slice(0, 5), // Max 5 detailed errors
      },
    });
  } catch (error) {
    console.error("Upload Excel Error:", error);
    handleError(res, error);
  }
};

export const getPhone = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    const siasnEmployee = await SiasnEmployee.query()
      .where("nip_baru", nip)
      .select("nomor_hp")
      .first();

    const data = {
      no_hp_master: result?.data?.no_hp || null,
      no_hp_siasn: siasnEmployee?.nomor_hp || null,
    };
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};
