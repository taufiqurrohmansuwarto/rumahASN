import SiasnToken from "@/models/siasn-instansi/siasn-token.model";
import { handleError } from "@/utils/helper/controller-helper";
import { testingFetcher } from "@/utils/siasn-instansi-utils";

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
  } catch (error) {
    handleError(res, error);
  }
};

export const submitUsulanPeremajaanPendidikan = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
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
  } catch (error) {
    handleError(res, error);
  }
};
