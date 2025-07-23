import SiasnToken from "@/models/siasn-instansi/siasn-token.model";
import { handleError } from "@/utils/helper/controller-helper";
import {
  createPeremajaanPendidikanSIASN,
  submitPeremajaanPendidikanSIASN,
  testingFetcher,
  updateDataPeremajaanPendidikanSIASN,
  uploadFilePeremajaanPendidikanSIASN,
} from "@/utils/siasn-instansi-utils";
const SiasnEmployee = require("@/models/siasn-employees.model");

export const getToken = async (req, res) => {
  try {
    const { customId } = req?.user;

    if (!customId) {
      return res.status(400).json({
        error: "User ID tidak ditemukan",
        message: "Akses tidak diizinkan",
      });
    }

    const token = await SiasnToken.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc")
      .first();

    return res.status(200).json({
      success: true,
      data: token || null,
      message: token ? "Token berhasil ditemukan" : "Token belum dikonfigurasi",
    });
  } catch (error) {
    console.error("Error in getToken:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Gagal mengambil data token SIASN",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const setToken = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { token } = req.body;

    if (!customId) {
      return res.status(400).json({
        error: "User ID tidak ditemukan",
        message: "Akses tidak diizinkan",
      });
    }

    if (!token) {
      return res.status(400).json({
        error: "Token tidak valid",
        message: "Token SIASN wajib diisi",
      });
    }

    // Validate token structure
    if (typeof token !== "object" || !token.access_token) {
      return res.status(400).json({
        error: "Format token tidak valid",
        message: "Token harus berupa object dengan field access_token",
      });
    }

    // Check if token already exists
    const existingToken = await SiasnToken.query()
      .where("user_id", customId)
      .first();

    let result;

    if (existingToken) {
      // Update existing token
      result = await SiasnToken.query().where("user_id", customId).update({
        token,
        updated_at: new Date(),
      });
    } else {
      // Create new token
      result = await SiasnToken.query().insert({
        user_id: customId,
        token,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token SIASN berhasil diperbarui",
      data: {
        user_id: customId,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in setToken:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Gagal memperbarui token SIASN",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const testing = async (req, res) => {
  try {
    const { customId } = req?.user;
    const token = await SiasnToken.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc")
      .first();

    const data = await testingFetcher(token.token.access_token);

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const createUsulanPeremajaanPendidikan = async (req, res) => {
  try {
    const { nip, usulan_pendidikan_id } = req?.body;
    const { customId } = req?.user;
    const token = await SiasnToken.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc")
      .first();

    const currentEmployee = await SiasnEmployee.query()
      .where("nip_baru", nip)
      .first();

    if (!currentEmployee) {
      return res.status(404).json({ error: "Pegawai tidak ditemukan" });
    }
    const payload = {
      pns_orang_id: currentEmployee.pns_id,
      usulan_pendidikan_id: usulan_pendidikan_id,
    };

    console.log(payload);

    const result = await createPeremajaanPendidikanSIASN(
      token.token.access_token,
      payload
    );
    res.json({
      pns_orang_id: currentEmployee.pns_id,
      usulan_pendidikan_id: result?.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: "Gagal membuat usulan peremajaan pendidikan",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const submitUsulanPeremajaanPendidikan = async (req, res) => {
  try {
    const body = req?.body;
    const tipe = req?.body?.tipe;
    const usulan_id = body?.usulan_id;
    const { customId } = req?.user;
    const token = await SiasnToken.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc")
      .first();

    const accessToken = token?.token?.access_token;

    if (tipe === "D") {
      await updateDataPeremajaanPendidikanSIASN(accessToken, body);
      await submitPeremajaanPendidikanSIASN(accessToken, usulan_id);
      res.json({ message: "success" });
    } else if (tipe === "U") {
      console.log(body);
      await updateDataPeremajaanPendidikanSIASN(accessToken, body);
      await submitPeremajaanPendidikanSIASN(accessToken, usulan_id);
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: "Gagal memperbarui data usulan peremajaan pendidikan",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateDataUsulanPeremajaanPendidikan = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadFile = async (req, res) => {
  try {
    const file = req?.file;
    const { usulan_id, nama_dokumen, id_ref_dokumen } = req?.body;
    const { customId } = req?.user;
    const token = await SiasnToken.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc")
      .first();

    const payload = {
      file,
      usulan_id,
      nama_dokumen,
      id_ref_dokumen,
    };

    const result = await uploadFilePeremajaanPendidikanSIASN(
      token.token.access_token,
      payload
    );

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
