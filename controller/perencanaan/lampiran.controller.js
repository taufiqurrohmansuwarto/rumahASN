const Lampiran = require("@/models/perencanaan/perencanaan.lampiran.model");
const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");
const {
  uploadFilePublic,
  generatePublicUrl,
  downloadFileAsBuffer,
  deleteFilePublic,
  parseMinioUrl,
} = require("@/utils/helper/minio-helper");
const { handleError } = require("@/utils/helper/controller-helper");
const { nanoid } = require("nanoid");

/**
 * Get all lampiran
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      usulan_id,
      unit_kerja,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    const { customId: userId, current_role } = req?.user;

    let query = Lampiran.query().withGraphFetched(
      "[usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

    if (current_role !== "admin") {
      query = query.where("dibuat_oleh", userId);
    }

    // Filter by usulan_id
    if (usulan_id) {
      query = query.where("usulan_id", usulan_id);
    }

    // Filter by unit_kerja
    if (unit_kerja) {
      query = query.where("unit_kerja", "ilike", `%${unit_kerja}%`);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("lampiran_id", "ilike", `%${search}%`)
          .orWhere("file_name", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const rekap = {
        total: result.length,
        denganUsulan: result.filter((x) => !!x.usulan_id).length,
        tanpaUsulan: result.filter((x) => !x.usulan_id).length,
      };

      return res.json({ data: result, rekap });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    res.json({
      data: result.results,
      meta: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get lampiran by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;

    let query = Lampiran.query()
      .findById(id)
      .withGraphFetched(
        "[usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      );

    // Non-admin hanya bisa melihat lampiran miliknya sendiri
    if (current_role !== "admin") {
      query = query.where("dibuat_oleh", userId);
    }

    const result = await query;

    if (!result) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Upload lampiran file
 */
const upload = async (req, res) => {
  try {
    const { mc } = req;
    const { file } = req;
    const { customId: userId } = req?.user;
    const { usulan_id, unit_kerja, file_name, formasi_id } = req?.body || {};

    if (!file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    // Validate formasi exists and is active
    if (formasi_id) {
      const formasi = await Formasi.query().findById(formasi_id);
      if (!formasi) {
        return res.status(404).json({ message: "Formasi tidak ditemukan" });
      }
      if (formasi.status !== "aktif") {
        return res.status(400).json({
          message: "Formasi tidak aktif, tidak dapat menambah lampiran",
        });
      }
    }

    // Validate usulan exists
    if (usulan_id) {
      const usulan = await Usulan.query().findById(usulan_id);
      if (!usulan) {
        return res.status(404).json({ message: "Usulan tidak ditemukan" });
      }
    }

    // Use custom file_name if provided, otherwise use original filename
    const finalFileName = file_name || file.originalname;

    // Generate unique filename for storage
    const uniqueId = nanoid(8);
    const filename = `perencanaan/lampiran/${
      formasi_id || usulan_id || "general"
    }/${uniqueId}-${finalFileName}`;

    // Upload to Minio
    await uploadFilePublic(
      mc,
      file.buffer,
      filename,
      file.size,
      file.mimetype,
      {
        "uploaded-by": userId,
        "formasi-id": formasi_id || "",
        "usulan-id": usulan_id || "",
        "original-name": file.originalname,
        "custom-name": finalFileName,
        "upload-date": new Date().toISOString(),
      }
    );

    // Generate public URL
    const fileUrl = generatePublicUrl(filename);

    // Save to database (formasi_id tidak disimpan di tabel lampiran, hanya untuk validasi)
    const result = await Lampiran.query().insert({
      usulan_id: usulan_id || null,
      file_name: finalFileName,
      file_size: file.size,
      file_url: fileUrl,
      file_type: file.mimetype,
      unit_kerja: unit_kerja || null,
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
    });

    // Create audit log (lampiran_id stored in data_baru since riwayat_audit doesn't have lampiran_id column)
    await RiwayatAudit.query().insert({
      formasi_id: formasi_id || null,
      usulan_id: usulan_id || null,
      aksi: "UPLOAD_LAMPIRAN",
      data_baru: { ...result, lampiran_id: result.lampiran_id },
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "File berhasil diupload", data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Download lampiran file
 */
const download = async (req, res) => {
  try {
    const { id } = req?.query;
    const { mc } = req;

    const lampiran = await Lampiran.query().findById(id);

    if (!lampiran) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    // Parse file path from URL
    const urlInfo = parseMinioUrl(lampiran.file_url);
    if (!urlInfo) {
      return res.status(400).json({ message: "URL file tidak valid" });
    }

    // Download file from Minio
    const fileBuffer = await downloadFileAsBuffer(
      mc,
      urlInfo.bucket,
      urlInfo.filename
    );

    // Set response headers
    res.setHeader(
      "Content-Type",
      lampiran.file_type || "application/octet-stream"
    );
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${lampiran.file_name}"`
    );

    res.end(fileBuffer);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update lampiran metadata and optionally replace file
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { mc } = req;
    const { file_name, unit_kerja, usulan_id } = req?.body || {};

    const lampiran = await Lampiran.query().findById(id);

    if (!lampiran) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    // Check if formasi is active (melalui usulan jika ada)
    if (lampiran.usulan_id) {
      const usulan = await Usulan.query().findById(lampiran.usulan_id);
      if (usulan?.formasi_id) {
        const formasi = await Formasi.query().findById(usulan.formasi_id);
        if (formasi && formasi.status !== "aktif") {
          return res.status(400).json({
            message: "Formasi tidak aktif, tidak dapat mengubah lampiran",
          });
        }
      }
    }

    // Validate usulan exists if usulan_id is provided
    if (usulan_id) {
      const usulan = await Usulan.query().findById(usulan_id);
      if (!usulan) {
        return res.status(404).json({ message: "Usulan tidak ditemukan" });
      }
    }

    // Store old data for audit
    const dataLama = { ...lampiran };

    const updateData = {
      diperbarui_oleh: userId,
    };

    // Check if there's a new file to upload
    if (req.file) {
      const file = req.file;
      const uniqueId = nanoid(8);
      // Use custom file_name if provided, otherwise use original filename
      const finalFileName = file_name || file.originalname;
      const filename = `perencanaan/lampiran/${
        lampiran.usulan_id || "general"
      }/${uniqueId}-${finalFileName}`;

      // Upload new file to Minio (correct parameter order: mc, buffer, filename, size, mimetype, metadata)
      await uploadFilePublic(
        mc,
        file.buffer,
        filename,
        file.size,
        file.mimetype,
        {
          "uploaded-by": userId,
          "original-name": file.originalname,
          "custom-name": finalFileName,
          "upload-date": new Date().toISOString(),
        }
      );
      const fileUrl = generatePublicUrl(filename);

      // Delete old file from Minio
      const oldUrlInfo = parseMinioUrl(lampiran.file_url);
      if (oldUrlInfo) {
        try {
          await deleteFilePublic(mc, oldUrlInfo.filename);
        } catch (error) {
          console.error("Error deleting old file from Minio:", error);
        }
      }

      // Update file info
      updateData.file_name = finalFileName;
      updateData.file_url = fileUrl;
      updateData.file_type = file.mimetype;
      updateData.file_size = file.size;
    } else {
      // Only update metadata
      if (file_name !== undefined) updateData.file_name = file_name;
    }

    if (unit_kerja !== undefined) updateData.unit_kerja = unit_kerja;
    if (usulan_id !== undefined) updateData.usulan_id = usulan_id;

    await Lampiran.query().findById(id).patch(updateData);

    // Get updated data
    const dataBaru = await Lampiran.query().findById(id);

    // Create audit log (lampiran_id stored in data fields since riwayat_audit doesn't have lampiran_id column)
    await RiwayatAudit.query().insert({
      usulan_id: dataBaru.usulan_id || lampiran.usulan_id || null,
      aksi: "UPDATE_LAMPIRAN",
      data_lama: { ...dataLama, lampiran_id: id },
      data_baru: { ...dataBaru, lampiran_id: id },
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Lampiran berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete lampiran
 */
const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { mc } = req;
    const { customId: userId } = req?.user;

    const lampiran = await Lampiran.query().findById(id);

    if (!lampiran) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    // Check if formasi is active (melalui usulan jika ada)
    if (lampiran.usulan_id) {
      const usulan = await Usulan.query().findById(lampiran.usulan_id);
      if (usulan?.formasi_id) {
        const formasi = await Formasi.query().findById(usulan.formasi_id);
        if (formasi && formasi.status !== "aktif") {
          return res.status(400).json({
            message: "Formasi tidak aktif, tidak dapat menghapus lampiran",
          });
        }
      }
    }

    // Store data for audit
    const dataLama = { ...lampiran };

    // Parse file path from URL
    const urlInfo = parseMinioUrl(lampiran.file_url);
    if (urlInfo) {
      // Delete file from Minio
      try {
        await deleteFilePublic(mc, urlInfo.filename);
      } catch (error) {
        console.error("Error deleting file from Minio:", error);
        // Continue with database deletion even if Minio deletion fails
      }
    }

    // Delete from database
    await Lampiran.query().deleteById(id);

    // Create audit log (lampiran_id stored in data_lama since riwayat_audit doesn't have lampiran_id column)
    await RiwayatAudit.query().insert({
      usulan_id: lampiran.usulan_id || null,
      aksi: "DELETE_LAMPIRAN",
      data_lama: { ...dataLama, lampiran_id: id },
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Lampiran berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  upload,
  download,
  update,
  remove,
};
