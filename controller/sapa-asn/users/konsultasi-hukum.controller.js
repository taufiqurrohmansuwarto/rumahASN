const KonsultasiHukum = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum.model");
const KonsultasiHukumThread = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum-thread.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const User = require("@/models/users.model");
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
const UPLOAD_PATH = "sapa-asn/konsultasi-hukum";

// Get all konsultasi hukum for current user
const getAll = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      status,
      jenis,
      search,
      sortField,
      sortOrder,
    } = req?.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = KonsultasiHukum.query().where("user_id", customId);

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by jenis permasalahan
    if (jenis) {
      query = query.whereRaw("jenis_permasalahan @> ?", [
        JSON.stringify([jenis]),
      ]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("ringkasan_permasalahan", "ilike", `%${search}%`)
          .orWhereRaw("jenis_permasalahan::text ILIKE ?", [`%${search}%`]);
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

// Get konsultasi hukum by ID
const getById = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const result = await KonsultasiHukum.query()
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

// Create new konsultasi hukum
const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { mc } = req;
    const { body } = req;

    const {
      no_hp,
      email,
      jenis_permasalahan,
      jenis_permasalahan_lainnya,
      ringkasan_permasalahan,
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

    // Parse jenis_permasalahan if string
    const parsedJenisPermasalahan = Array.isArray(jenis_permasalahan)
      ? jenis_permasalahan
      : JSON.parse(jenis_permasalahan || "[]");

    // Create konsultasi hukum
    const result = await KonsultasiHukum.query().insert({
      user_id: customId,
      no_hp_user: no_hp,
      email_user: email,
      jenis_permasalahan: JSON.stringify(parsedJenisPermasalahan),
      jenis_permasalahan_lainnya: jenis_permasalahan_lainnya || null,
      ringkasan_permasalahan: ringkasan_permasalahan,
      lampiran_dokumen: uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null,
      is_persetujuan: is_persetujuan === "true" || is_persetujuan === true,
      status: "Pending",
    });

    // Create notification
    await Notifikasi.query().insert({
      user_id: customId,
      judul: "Konsultasi Hukum Terkirim",
      pesan: `Konsultasi hukum Anda telah berhasil dikirim dan sedang menunggu respon dari tim kami.`,
      layanan: "konsultasi_hukum",
      reference_id: result.id,
    });

    res.json({
      message: "Konsultasi hukum berhasil dikirim",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get threads for a konsultasi hukum
const getThreads = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    // Verify ownership
    const konsultasi = await KonsultasiHukum.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Get threads with user info
    const threads = await KonsultasiHukumThread.query()
      .where("konsultasi_hukum_id", id)
      .orderBy("created_at", "asc");

    // Get user info for each thread
    const userIds = [...new Set(threads.map((t) => t.user_id))];
    const users = await User.query().whereIn("custom_id", userIds);
    const userMap = users.reduce((acc, user) => {
      acc[user.custom_id] = {
        id: user.custom_id,
        name: user.username,
        image: user.image,
      };
      return acc;
    }, {});

    const threadsWithUser = threads.map((thread) => ({
      ...thread,
      sender_name: userMap[thread.user_id]?.name || "Admin",
      sender_type: thread.user_id === customId ? "user" : "admin",
    }));

    res.json({
      konsultasi,
      threads: threadsWithUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Send message to thread
const sendMessage = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { message } = req?.body;

    // Verify ownership
    const konsultasi = await KonsultasiHukum.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Pesan tidak boleh kosong" });
    }

    // Create thread message
    const result = await KonsultasiHukumThread.query().insert({
      konsultasi_hukum_id: id,
      user_id: customId,
      message: message.trim(),
    });

    // Update konsultasi status if needed
    if (konsultasi.status === "Answered") {
      await KonsultasiHukum.query().findById(id).patch({
        status: "Waiting for Response",
      });
    }

    res.json({
      message: "Pesan berhasil dikirim",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get thread detail (konsultasi info + all messages)
const getThreadDetail = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    // Verify ownership
    const konsultasi = await KonsultasiHukum.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Get all threads
    const threads = await KonsultasiHukumThread.query()
      .where("konsultasi_hukum_id", id)
      .orderBy("created_at", "asc");

    // Get user info for each thread
    const userIds = [...new Set(threads.map((t) => t.user_id))];
    const users = await User.query().whereIn("custom_id", userIds);
    const userMap = users.reduce((acc, user) => {
      acc[user.custom_id] = {
        id: user.custom_id,
        name: user.username,
        image: user.image,
      };
      return acc;
    }, {});

    const threadsWithUser = threads.map((thread) => ({
      ...thread,
      sender_name: userMap[thread.user_id]?.name || "Admin",
      sender_type: thread.user_id === customId ? "user" : "admin",
    }));

    res.json({
      konsultasi,
      threads: threadsWithUser,
    });
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
    const konsultasi = await KonsultasiHukum.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (konsultasi.status !== "Pending") {
      return res.status(400).json({
        message: "Tidak dapat menghapus file pada konsultasi yang sudah diproses",
      });
    }

    // Delete file from minio
    await deleteFile(mc, BUCKET_NAME, filePath);

    // Update lampiran_dokumen in database
    let lampiran = konsultasi.lampiran_dokumen || [];
    if (typeof lampiran === "string") {
      lampiran = JSON.parse(lampiran);
    }
    lampiran = lampiran.filter((f) => f.path !== filePath);

    await KonsultasiHukum.query()
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
  getThreads,
  sendMessage,
  getThreadDetail,
  deleteUploadedFile,
};
