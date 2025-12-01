const Pendampingan = require("@/models/sapa-asn/sapa-asn.pendampingan.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");
const {
  uploadFileToMinio,
  deleteFile,
  generatePublicUrl,
} = require("@/utils/helper/minio-helper");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

const BUCKET_NAME = "public";
const UPLOAD_PATH = "sapa-asn/pendampingan-hukum";

// Get all pendampingan hukum for current user
const getAll = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      status,
      jenisPerkara,
      bentuk,
      search,
      sortField,
      sortOrder,
    } = req?.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = Pendampingan.query().where("user_id", customId);

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by jenis perkara
    if (jenisPerkara) {
      query = query.whereRaw("jenis_perkara @> ?", [
        JSON.stringify([jenisPerkara]),
      ]);
    }

    // Filter by bentuk pendampingan
    if (bentuk) {
      query = query.whereRaw("bentuk_pendampingan @> ?", [
        JSON.stringify([bentuk]),
      ]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("no_perkara", "ilike", `%${search}%`)
          .orWhere("ringkasan_perkara", "ilike", `%${search}%`)
          .orWhere("pengadilan_jadwal", "ilike", `%${search}%`);
      });
    }

    // Sorting
    if (sortField && sortOrder) {
      const order = sortOrder === "ascend" ? "asc" : "desc";
      query = query.orderBy(sortField, order);
    } else {
      query = query.orderBy("created_at", "desc");
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.resultSize();

    // Pagination
    const data = await query.limit(parseInt(limit)).offset(offset);

    res.json({
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get pendampingan hukum by ID
const getById = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const result = await Pendampingan.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Create new pendampingan hukum
const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { mc } = req;
    const { body } = req;

    const {
      no_hp,
      email,
      no_perkara,
      jenis_perkara,
      jenis_perkara_lainnya,
      pengadilan_jadwal, // legacy field
      tempat_pengadilan,
      jadwal_pengadilan,
      ringkasan_perkara,
      bentuk_pendampingan,
      bentuk_pendampingan_lainnya,
      is_persetujuan,
    } = body;

    // Handle file uploads if any
    let uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const filename = `${UPLOAD_PATH}/${customId}/${timestamp}_${file.originalname}`;

        await uploadFileToMinio(
          mc,
          BUCKET_NAME,
          file.buffer,
          filename,
          file.size,
          file.mimetype,
          { "uploaded-by": customId }
        );

        uploadedFiles.push({
          name: file.originalname,
          path: filename,
          url: generatePublicUrl(filename, BUCKET_NAME),
          size: file.size,
          mimetype: file.mimetype,
        });
      }
    }

    // Parse arrays if they are strings
    const parsedJenisPerkara = Array.isArray(jenis_perkara)
      ? jenis_perkara
      : JSON.parse(jenis_perkara || "[]");
    const parsedBentukPendampingan = Array.isArray(bentuk_pendampingan)
      ? bentuk_pendampingan
      : JSON.parse(bentuk_pendampingan || "[]");

    // Create pendampingan hukum
    const result = await Pendampingan.query().insert({
      user_id: customId,
      no_hp_user: no_hp,
      email_user: email,
      no_perkara: no_perkara || null,
      jenis_perkara: JSON.stringify(parsedJenisPerkara),
      jenis_perkara_lainnya: jenis_perkara_lainnya || null,
      pengadilan_jadwal: pengadilan_jadwal || null, // legacy
      tempat_pengadilan: tempat_pengadilan || null,
      jadwal_pengadilan: jadwal_pengadilan || null,
      ringkasan_perkara: ringkasan_perkara,
      lampiran_dokumen:
        uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null,
      bentuk_pendampingan: JSON.stringify(parsedBentukPendampingan),
      bentuk_pendampingan_lainnya: bentuk_pendampingan_lainnya || null,
      is_persetujuan: is_persetujuan === "true" || is_persetujuan === true,
      status: "Pending",
    });

    // Create notification
    await Notifikasi.query().insert({
      user_id: customId,
      judul: "Permohonan Pendampingan Hukum Terkirim",
      pesan: `Permohonan pendampingan hukum Anda telah berhasil dikirim dan sedang menunggu verifikasi.`,
      layanan: "pendampingan_hukum",
      reference_id: result.id,
    });

    res.json({
      message: "Permohonan pendampingan hukum berhasil dikirim",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Cancel pendampingan (only if status is pending)
const cancel = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const pendampingan = await Pendampingan.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (pendampingan.status !== "Pending") {
      return res.status(400).json({
        message: "Hanya dapat membatalkan permohonan yang masih pending",
      });
    }

    // Update status
    await Pendampingan.query().findById(id).patch({
      status: "Cancelled",
    });

    // Create notification
    await Notifikasi.query().insert({
      user_id: customId,
      judul: "Permohonan Pendampingan Dibatalkan",
      pesan: `Permohonan pendampingan hukum Anda telah dibatalkan.`,
      layanan: "pendampingan_hukum",
      reference_id: id,
    });

    res.json({ message: "Permohonan berhasil dibatalkan" });
  } catch (error) {
    handleError(res, error);
  }
};

// Update pendampingan (only if status is pending or revision)
const update = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { mc } = req;
    const { id } = req?.query;
    const { body } = req;

    const pendampingan = await Pendampingan.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (!["Pending", "Revision"].includes(pendampingan.status)) {
      return res.status(400).json({
        message:
          "Hanya dapat mengubah permohonan yang masih pending atau perlu revisi",
      });
    }

    const {
      no_hp,
      email,
      no_perkara,
      jenis_perkara,
      jenis_perkara_lainnya,
      pengadilan_jadwal, // legacy
      tempat_pengadilan,
      jadwal_pengadilan,
      ringkasan_perkara,
      bentuk_pendampingan,
      bentuk_pendampingan_lainnya,
    } = body;

    // Handle new file uploads if any
    let uploadedFiles = pendampingan.lampiran_dokumen || [];
    if (typeof uploadedFiles === "string") {
      uploadedFiles = JSON.parse(uploadedFiles);
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const filename = `${UPLOAD_PATH}/${customId}/${timestamp}_${file.originalname}`;

        await uploadFileToMinio(
          mc,
          BUCKET_NAME,
          file.buffer,
          filename,
          file.size,
          file.mimetype,
          { "uploaded-by": customId }
        );

        uploadedFiles.push({
          name: file.originalname,
          path: filename,
          url: generatePublicUrl(filename, BUCKET_NAME),
          size: file.size,
          mimetype: file.mimetype,
        });
      }
    }

    // Parse arrays if they are strings
    const parsedJenisPerkara = Array.isArray(jenis_perkara)
      ? jenis_perkara
      : JSON.parse(jenis_perkara || "[]");
    const parsedBentukPendampingan = Array.isArray(bentuk_pendampingan)
      ? bentuk_pendampingan
      : JSON.parse(bentuk_pendampingan || "[]");

    // Update pendampingan
    await Pendampingan.query()
      .findById(id)
      .patch({
        no_hp_user: no_hp,
        email_user: email,
        no_perkara: no_perkara || null,
        jenis_perkara: JSON.stringify(parsedJenisPerkara),
        jenis_perkara_lainnya: jenis_perkara_lainnya || null,
        pengadilan_jadwal: pengadilan_jadwal || null, // legacy
        tempat_pengadilan: tempat_pengadilan || null,
        jadwal_pengadilan: jadwal_pengadilan || null,
        ringkasan_perkara: ringkasan_perkara,
        lampiran_dokumen:
          uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null,
        bentuk_pendampingan: JSON.stringify(parsedBentukPendampingan),
        bentuk_pendampingan_lainnya: bentuk_pendampingan_lainnya || null,
        status: "Pending", // Reset to pending after update
      });

    res.json({ message: "Permohonan berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete uploaded file
const deleteUploadedFile = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { mc } = req;
    const { id, filePath } = req?.query;

    // Verify ownership
    const pendampingan = await Pendampingan.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (!["Pending", "Revision"].includes(pendampingan.status)) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus file pada permohonan yang sudah diproses",
      });
    }

    // Delete file from minio
    await deleteFile(mc, BUCKET_NAME, filePath);

    // Update lampiran_dokumen in database
    let lampiran = pendampingan.lampiran_dokumen || [];
    if (typeof lampiran === "string") {
      lampiran = JSON.parse(lampiran);
    }
    lampiran = lampiran.filter((f) => f.path !== filePath);

    await Pendampingan.query()
      .findById(id)
      .patch({
        lampiran_dokumen: lampiran.length > 0 ? JSON.stringify(lampiran) : null,
      });

    res.json({ message: "File berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  cancel,
  update,
  deleteUploadedFile,
};
