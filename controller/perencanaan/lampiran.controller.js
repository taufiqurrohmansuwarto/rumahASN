const Lampiran = require("@/models/perencanaan/perencanaan.lampiran.model");
const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
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
    const { page = 1, limit = 20, search, usulan_id, unit_kerja, sortField = "dibuat_pada", sortOrder = "desc" } =
      req?.query;

    let query = Lampiran.query().withGraphFetched(
      "[usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

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

    const result = await Lampiran.query()
      .findById(id)
      .withGraphFetched("[usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]");

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
    const { usulan_id, unit_kerja } = req?.body;

    if (!file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    // Validate usulan exists
    if (usulan_id) {
      const usulan = await Usulan.query().findById(usulan_id);
      if (!usulan) {
        return res.status(404).json({ message: "Usulan tidak ditemukan" });
      }
    }

    // Generate unique filename
    const ext = file.originalname.split(".").pop();
    const uniqueId = nanoid(8);
    const filename = `perencanaan/lampiran/${usulan_id || "general"}/${uniqueId}-${file.originalname}`;

    // Upload to Minio
    await uploadFilePublic(mc, file.buffer, filename, file.size, file.mimetype, {
      "uploaded-by": userId,
      "usulan-id": usulan_id || "",
      "original-name": file.originalname,
      "upload-date": new Date().toISOString(),
    });

    // Generate public URL
    const fileUrl = generatePublicUrl(filename);

    // Save to database
    const result = await Lampiran.query().insert({
      usulan_id: usulan_id || null,
      file_name: file.originalname,
      file_size: file.size,
      file_url: fileUrl,
      file_type: file.mimetype,
      unit_kerja: unit_kerja || null,
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
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
    const fileBuffer = await downloadFileAsBuffer(mc, urlInfo.bucket, urlInfo.filename);

    // Set response headers
    res.setHeader("Content-Type", lampiran.file_type || "application/octet-stream");
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader("Content-Disposition", `attachment; filename="${lampiran.file_name}"`);

    res.end(fileBuffer);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update lampiran metadata
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { file_name, unit_kerja, usulan_id } = req?.body;

    const lampiran = await Lampiran.query().findById(id);

    if (!lampiran) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

    // Validate usulan exists if usulan_id is provided
    if (usulan_id) {
      const usulan = await Usulan.query().findById(usulan_id);
      if (!usulan) {
        return res.status(404).json({ message: "Usulan tidak ditemukan" });
      }
    }

    const updateData = {
      diperbarui_oleh: userId,
    };

    if (file_name !== undefined) updateData.file_name = file_name;
    if (unit_kerja !== undefined) updateData.unit_kerja = unit_kerja;
    if (usulan_id !== undefined) updateData.usulan_id = usulan_id;

    await Lampiran.query().findById(id).patch(updateData);

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

    const lampiran = await Lampiran.query().findById(id);

    if (!lampiran) {
      return res.status(404).json({ message: "Lampiran tidak ditemukan" });
    }

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

