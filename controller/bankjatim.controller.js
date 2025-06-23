import {
  cekPeminjamanKredit,
  historiesKredit,
  pengajuanKredit,
  pingKoneksi,
  simulasiKredit,
} from "@/utils/bank-jatim.utils";
import { getKodeKabkota } from "@/utils/client-utils";
import { createLog } from "@/utils/logs";
import { getUserInfo } from "@/utils/master.utils";
import { dataUtama } from "@/utils/siasn-utils";
import { raw } from "objection";
import axios from "axios";
const Log = require("@/models/logs.model");
const Employee = require("@/models/siasn-employees.model");

// Helper function untuk menangani error response
const handleErrorResponse = (error) => {
  let errorMessage = "";
  const message = error?.response?.data?.message || "Internal server error";
  if (Array.isArray(message)) {
    errorMessage = message.map((item) => item.message).join(", ");
  } else {
    errorMessage = message;
  }
  return errorMessage;
};

// Helper function untuk membuat log payload
const createLogPayload = (user, ip, requestBody, responseBody, endpoint) => {
  return {
    user_id: user?.customId,
    ip,
    request_body: JSON.stringify(requestBody) || "",
    response_body: JSON.stringify(responseBody) || "",
    services: "bankjatim",
    endpoint,
  };
};

// Helper function untuk menangani success response dengan logging
const handleSuccessWithLog = async (
  result,
  req,
  endpoint,
  res,
  returnData = false
) => {
  const { user, ip } = req;
  const payload = createLogPayload(user, ip, req?.body, result, endpoint);
  await createLog(payload);

  res.json(result);
};

// Helper function untuk menangani error dengan logging
const handleErrorWithLog = (error, res, shouldLog = true) => {
  if (shouldLog) {
    console.log(error);
  }
  const errorMessage = handleErrorResponse(error);
  res.status(500).json({ message: errorMessage });
};

export const ping = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await pingKoneksi(fetcher);
    await handleSuccessWithLog(result?.data, req, "/ping", res);
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

const removeStr = (str) => {
  // remove \r \n \t kemudian juga ketika str null
  if (!str) return "";
  return str.replace(/\r|\n|\t/g, "");
};

const hapusPetik = (str) => {
  // petik '
  return str.replace(/'/g, "");
};

export const pengajuan = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const { captcha, ...payload } = body;
    const { employee_number: nip } = req?.user;

    // Verifikasi captcha v3
    if (!captcha) {
      return res.status(400).json({ message: "Captcha is required" });
    }

    const captchaKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verifyData = new URLSearchParams({
      secret: captchaKey,
      response: captcha,
    });

    const hasil = await axios.post(verifyUrl, verifyData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!hasil.data.success) {
      return res.status(400).json({
        message: "Captcha verification failed",
        errors: hasil.data["error-codes"],
      });
    }

    // Check score for v3 (optional - adjust threshold as needed)
    if (hasil.data.score < 0.5) {
      return res.status(400).json({
        message: "Captcha score too low",
        score: hasil.data.score,
      });
    }

    const currentEmployee = await Employee.query()
      .select("nik")
      .where("nip_baru", nip)
      .first();

    const kota_kantor = getKodeKabkota.find(
      (item) => item.key === payload?.kode_kabkota
    )?.label;

    const payloadData = {
      nip: nip,
      no_ktp: hapusPetik(currentEmployee?.nik) || body?.no_ktp,
      nama: payload?.nama,
      tempat_lahir: payload?.tempat_lahir,
      tgl_lahir: payload?.tgl_lahir,
      jns_kelamin: payload?.jns_kelamin,
      no_hp: payload?.no_hp,
      tmt_pensiun: payload?.tmt_pensiun || 0,
      norek_gaji: payload?.norek_gaji || "-",
      kd_dinas: payload?.kd_dinas,
      nama_dinas: payload?.nama_dinas,
      alamat_kantor: payload?.alamat_kantor,
      kota_kantor: removeStr(kota_kantor),
      kode_kabkota: payload?.kode_kabkota,
      jns_pinjaman: payload?.jns_pinjaman,
      plafon_pengajuan: payload?.plafon_pengajuan,
      jangka_waktu: payload?.jangka_waktu,
    };

    const result = await pengajuanKredit(fetcher, payloadData);
    await handleSuccessWithLog(result?.data, req, "/pengajuan", res);
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

export const cekPeminjaman = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const result = await cekPeminjamanKredit(fetcher, body);
    await handleSuccessWithLog(result?.data, req, "/cek-peminjaman", res, true);
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

export const simulasi = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const result = await simulasiKredit(fetcher, body);
    await handleSuccessWithLog(result?.data, req, "/simulasi", res, true);
  } catch (error) {
    handleErrorWithLog(error, res, false);
  }
};

export const histories = async (req, res) => {
  try {
    const { fetcher, user } = req;
    const { employee_number: nip } = user;
    const payload = { nip };
    const result = await historiesKredit(fetcher, payload);
    await handleSuccessWithLog(result?.data, req, "/histories", res, true);
  } catch (error) {
    handleErrorWithLog(error, res, false);
  }
};

export const localHistories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;
    let query = Log.query().withGraphFetched("user(simpleWithEmployeeNumber)");
    if (sort) {
      query = query.orderBy("created_at", sort);
    }

    // jika page  -1
    if (page === -1 || page === "-1") {
      const hasil = await query;
      res.json(hasil);
    } else {
      const result = await query.page(parseInt(page - 1), parseInt(limit));
      res.json(result);
    }
  } catch (error) {
    handleErrorWithLog(error, res, false);
  }
};

export const info = async (req, res) => {
  try {
    const { fetcher, user, siasnRequest } = req;
    const { employee_number: nip } = user;
    const hasil = await Employee.query()
      .select(
        "*",
        raw(
          "to_char(to_date(tanggal_lahir, 'DD-MM-YYYY'), 'YYYY-MM-DD') as tgl_lahir"
        ),
        raw(
          "CASE WHEN jenis_kelamin = 'M' THEN 'L' WHEN jenis_kelamin = 'F' THEN 'P' ELSE jenis_kelamin END as jns_kelamin"
        )
      )
      .where("nip_baru", nip)
      .first();

    const result = await getUserInfo(fetcher, nip);
    const dataSiasn = await dataUtama(siasnRequest, nip);

    const data = result?.data;

    const payload = {
      nip,
      no_ktp: hasil?.no_ktp || data?.no_ktp,
      nama: hasil?.nama || data?.nama,
      tempat_lahir: hasil?.tempat_lahir_nama || data?.tempat_lahir,
      tgl_lahir: hasil?.tgl_lahir || data?.tgl_lahir,
      jns_kelamin: hasil?.jns_kelamin || data?.jns_kelamin,
      no_hp: data?.no_hp || hasil?.no_hp,
      tmt_pensiun: data?.tmt_pensiun,
      norek_gaji: "",
      kd_dinas: data?.kd_dinas,
      nama_dinas: dataSiasn?.unorIndukNama || data?.nama_dinas,
      alamat_kantor: data?.alamat_kantor,
      kota_kantor: data?.kota_kantor,
      kode_kabkota: data?.kode_kabkota,
    };

    res.json(payload);
  } catch (error) {
    console.log(error);
    handleErrorWithLog(error, res, false);
  }
};
