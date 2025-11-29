const KonsultasiHukum = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum.model");
const KonsultasiHukumThread = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum-thread.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");
const ExcelJS = require("exceljs");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Get all konsultasi hukum (admin)
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      jenis,
      search,
      sortField = "created_at",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req?.query;

    let query = KonsultasiHukum.query().withGraphFetched("[user(simpleWithImage)]");

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

    // Filter by date range
    if (startDate && endDate) {
      query = query.whereBetween("created_at", [startDate, endDate]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("id", "ilike", `%${search}%`)
          .orWhere("ringkasan_permasalahan", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Export to Excel if limit = -1
    if (parseInt(limit) === -1) {
      const data = await query;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Konsultasi Hukum");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "ID", key: "id", width: 20 },
        { header: "Nama User", key: "user_name", width: 25 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "No HP", key: "no_hp", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Jenis Permasalahan", key: "jenis", width: 30 },
        { header: "Ringkasan", key: "ringkasan", width: 50 },
        { header: "Status", key: "status", width: 15 },
        { header: "Respon", key: "respon", width: 40 },
        { header: "Tanggal Pengajuan", key: "created_at", width: 20 },
      ];

      data.forEach((item, idx) => {
        const jenis = typeof item.jenis_permasalahan === "string"
          ? JSON.parse(item.jenis_permasalahan || "[]").join(", ")
          : (item.jenis_permasalahan || []).join(", ");

        worksheet.addRow({
          no: idx + 1,
          id: item.id,
          user_name: item.user?.username || "-",
          nip: item.user?.employee_number || "-",
          no_hp: item.no_hp_user,
          email: item.email_user,
          jenis: jenis,
          ringkasan: item.ringkasan_permasalahan || "-",
          status: item.status,
          respon: item.respon || "-",
          created_at: dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=konsultasi-hukum-${dayjs().format("YYYYMMDD")}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

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

// Get konsultasi by ID (admin)
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await KonsultasiHukum.query()
      .findById(id)
      .withGraphFetched("[user(simpleWithImage), threads]");

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Update status konsultasi (admin)
const updateStatus = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { status, respon } = req?.body;

    const konsultasi = await KonsultasiHukum.query().findById(id);

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const updateData = {
      status,
      fasilitator_id: customId,
    };

    if (respon) {
      updateData.respon = respon;
    }

    await KonsultasiHukum.query().findById(id).patch(updateData);

    // Create notification for user
    let notifJudul = "";
    let notifPesan = "";

    switch (status) {
      case "In Progress":
        notifJudul = "Konsultasi Hukum Sedang Diproses";
        notifPesan = `Konsultasi hukum Anda sedang diproses oleh tim kami.`;
        break;
      case "Completed":
        notifJudul = "Konsultasi Hukum Selesai";
        notifPesan = `Konsultasi hukum Anda telah selesai. Silakan cek respon dari tim kami.`;
        break;
      default:
        notifJudul = "Status Konsultasi Diperbarui";
        notifPesan = `Status konsultasi hukum Anda telah diperbarui menjadi: ${status}`;
    }

    await Notifikasi.query().insert({
      user_id: konsultasi.user_id,
      judul: notifJudul,
      pesan: notifPesan,
      layanan: "konsultasi_hukum",
      reference_id: id,
    });

    res.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

// Get threads for a konsultasi (admin)
const getThreads = async (req, res) => {
  try {
    const { id } = req?.query;

    const konsultasi = await KonsultasiHukum.query()
      .findById(id)
      .withGraphFetched("[user(simpleWithImage)]");

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Mark all user messages as read by admin
    await KonsultasiHukumThread.query()
      .where("konsultasi_hukum_id", id)
      .where("sender_type", "user")
      .where("is_read_by_admin", false)
      .patch({
        is_read_by_admin: true,
        read_at: new Date(),
      });

    // Reset admin unread count and update last read time
    await KonsultasiHukum.query().findById(id).patch({
      unread_count_admin: 0,
      admin_last_read_at: new Date(),
    });

    const threads = await KonsultasiHukumThread.query()
      .where("konsultasi_hukum_id", id)
      .orderBy("created_at", "asc");

    res.json({
      konsultasi,
      messages: threads,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Send message to thread (admin)
const sendMessage = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { message } = req?.body;

    const konsultasi = await KonsultasiHukum.query().findById(id);

    if (!konsultasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Create thread message (as admin)
    const result = await KonsultasiHukumThread.query().insert({
      konsultasi_hukum_id: id,
      user_id: customId,
      message,
      sender_type: "admin",
      is_read_by_user: false,
    });

    // Update konsultasi status and increment user unread count
    const updateData = {
      unread_count_user: (konsultasi.unread_count_user || 0) + 1,
    };
    
    if (konsultasi.status === "Pending") {
      updateData.status = "In Progress";
      updateData.fasilitator_id = customId;
    }
    
    await KonsultasiHukum.query().findById(id).patch(updateData);

    // Notify user
    await Notifikasi.query().insert({
      user_id: konsultasi.user_id,
      judul: "Pesan Baru dari Admin",
      pesan: `Anda mendapat balasan untuk konsultasi hukum Anda.`,
      layanan: "konsultasi_hukum",
      reference_id: id,
    });

    res.json({ message: "Pesan berhasil dikirim", data: result });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  updateStatus,
  getThreads,
  sendMessage,
};

