import { handleError } from "@/utils/helper/controller-helper";
import {
  uploadFileToMinio,
  deleteFile,
  generatePublicUrl,
  downloadFileAsBase64,
} from "@/utils/helper/minio-helper";

const UserSpecimens = require("@/models/esign/esign-user-specimens.model");
const { nanoid } = require("nanoid");

const MAX_SPECIMENS_PER_USER = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIMETYPES = ["image/png", "image/jpeg", "image/jpg"];

/**
 * Get specimen path in MinIO
 * @param {String} userId - User ID
 * @param {String} filename - Original filename
 * @returns {String} - Path in MinIO
 */
const getSpecimenPath = (userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split(".").pop();
  return `esign/specimens/${userId}/${timestamp}.${ext}`;
};

/**
 * Get all specimens for current user
 * GET /api/esign-bkd/specimens
 */
export const findAll = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const specimens = await UserSpecimens.query()
      .where("user_id", userId)
      .orderBy("created_at", "desc");

    // Add file URLs
    const specimensWithUrls = specimens.map((specimen) => ({
      ...specimen,
      file_url: specimen.file_path
        ? generatePublicUrl(specimen.file_path, "public")
        : null,
    }));

    res.json({
      message: "Data spesimen berhasil diambil",
      data: specimensWithUrls,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get active specimen for current user
 * GET /api/esign-bkd/specimens/active
 */
export const getActive = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const activeSpecimen = await UserSpecimens.query()
      .where("user_id", userId)
      .where("is_active", true)
      .first();

    if (!activeSpecimen) {
      return res.json({
        message: "Tidak ada spesimen aktif",
        data: null,
      });
    }

    // Add file URL
    const specimenWithUrl = {
      ...activeSpecimen,
      file_url: activeSpecimen.file_path
        ? generatePublicUrl(activeSpecimen.file_path, "public")
        : null,
    };

    res.json({
      message: "Spesimen aktif berhasil diambil",
      data: specimenWithUrl,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get active specimen base64 for current user
 * GET /api/esign-bkd/specimens/active/base64
 */
export const getActiveBase64 = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;

    const activeSpecimen = await UserSpecimens.query()
      .where("user_id", userId)
      .where("is_active", true)
      .first();

    if (!activeSpecimen) {
      return res.json({
        message: "Tidak ada spesimen aktif",
        data: null,
      });
    }

    // Download file as base64
    const base64 = await downloadFileAsBase64(
      mc,
      "public",
      activeSpecimen.file_path
    );

    res.json({
      message: "Spesimen aktif berhasil diambil",
      data: {
        ...activeSpecimen,
        file_base64: base64,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Upload new specimen
 * POST /api/esign-bkd/specimens
 */
export const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;
    const file = req?.file;
    const { name } = req.body;

    // Validate file
    if (!file) {
      return res.status(400).json({
        message: "File gambar wajib diupload",
      });
    }

    // Validate file type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Format file harus PNG atau JPG",
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: "Ukuran file maksimal 2MB",
      });
    }

    // Check max specimens count
    const existingCount = await UserSpecimens.query()
      .where("user_id", userId)
      .resultSize();

    if (existingCount >= MAX_SPECIMENS_PER_USER) {
      return res.status(400).json({
        message: `Maksimal ${MAX_SPECIMENS_PER_USER} gambar per user. Hapus salah satu untuk menambah yang baru.`,
      });
    }

    // Generate path and upload to MinIO
    const filePath = getSpecimenPath(userId, file.originalname);

    await uploadFileToMinio(
      mc,
      "public",
      file.buffer,
      filePath,
      file.size,
      file.mimetype,
      {
        "uploaded-by": userId,
        "upload-date": new Date().toISOString(),
      }
    );

    // If this is the first specimen, make it active
    const isFirstSpecimen = existingCount === 0;

    // Save to database
    const specimen = await UserSpecimens.query().insert({
      user_id: userId,
      name: name || `Gambar ${existingCount + 1}`,
      file_path: filePath,
      file_size: file.size,
      is_active: isFirstSpecimen,
    });

    res.status(201).json({
      message: "Spesimen berhasil diupload",
      data: {
        ...specimen,
        file_url: generatePublicUrl(filePath, "public"),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete specimen
 * DELETE /api/esign-bkd/specimens/:id
 */
export const destroy = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const mc = req?.mc;

    // Find specimen
    const specimen = await UserSpecimens.query().findById(id);

    if (!specimen) {
      return res.status(404).json({
        message: "Spesimen tidak ditemukan",
      });
    }

    // Check ownership
    if (specimen.user_id !== userId) {
      return res.status(403).json({
        message: "Tidak memiliki akses untuk menghapus spesimen ini",
      });
    }

    // Delete file from MinIO
    try {
      await deleteFile(mc, "public", specimen.file_path);
    } catch (error) {
      console.error("Error deleting file from MinIO:", error);
      // Continue even if file deletion fails
    }

    // Delete from database
    await UserSpecimens.query().deleteById(id);

    // If deleted specimen was active, activate another one
    if (specimen.is_active) {
      const anotherSpecimen = await UserSpecimens.query()
        .where("user_id", userId)
        .orderBy("created_at", "desc")
        .first();

      if (anotherSpecimen) {
        await UserSpecimens.query().patchAndFetchById(anotherSpecimen.id, {
          is_active: true,
        });
      }
    }

    res.json({
      message: "Spesimen berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Set specimen as active
 * POST /api/esign-bkd/specimens/:id/activate
 */
export const setActive = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    // Find specimen
    const specimen = await UserSpecimens.query().findById(id);

    if (!specimen) {
      return res.status(404).json({
        message: "Spesimen tidak ditemukan",
      });
    }

    // Check ownership
    if (specimen.user_id !== userId) {
      return res.status(403).json({
        message: "Tidak memiliki akses untuk mengaktifkan spesimen ini",
      });
    }

    // Deactivate all specimens for this user
    await UserSpecimens.query().where("user_id", userId).patch({
      is_active: false,
    });

    // Activate the selected specimen
    const updatedSpecimen = await UserSpecimens.query().patchAndFetchById(id, {
      is_active: true,
    });

    res.json({
      message: "Spesimen berhasil diaktifkan",
      data: {
        ...updatedSpecimen,
        file_url: generatePublicUrl(updatedSpecimen.file_path, "public"),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update specimen name
 * PATCH /api/esign-bkd/specimens/:id
 */
export const update = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { name } = req.body;

    // Find specimen
    const specimen = await UserSpecimens.query().findById(id);

    if (!specimen) {
      return res.status(404).json({
        message: "Spesimen tidak ditemukan",
      });
    }

    // Check ownership
    if (specimen.user_id !== userId) {
      return res.status(403).json({
        message: "Tidak memiliki akses untuk mengubah spesimen ini",
      });
    }

    // Update name
    const updatedSpecimen = await UserSpecimens.query().patchAndFetchById(id, {
      name,
      updated_at: new Date(),
    });

    res.json({
      message: "Spesimen berhasil diubah",
      data: {
        ...updatedSpecimen,
        file_url: generatePublicUrl(updatedSpecimen.file_path, "public"),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Check if a user has an active specimen
 * GET /api/esign-bkd/specimens/check/:userId
 * Used to validate if a signer has an active specimen before adding them
 */
export const checkUserSpecimen = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID diperlukan",
        hasActiveSpecimen: false,
      });
    }

    const activeSpecimen = await UserSpecimens.query()
      .where("user_id", userId)
      .where("is_active", true)
      .first();

    if (!activeSpecimen) {
      return res.json({
        message: "User tidak memiliki spesimen aktif",
        hasActiveSpecimen: false,
        specimen: null,
      });
    }

    res.json({
      message: "User memiliki spesimen aktif",
      hasActiveSpecimen: true,
      specimen: {
        id: activeSpecimen.id,
        name: activeSpecimen.name,
        file_url: generatePublicUrl(activeSpecimen.file_path, "public"),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
