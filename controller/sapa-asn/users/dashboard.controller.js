const Advokasi = require("@/models/sapa-asn/sapa-asn.advokasi.model");
const KonsultasiHukum = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum.model");
const Pendampingan = require("@/models/sapa-asn/sapa-asn.pendampingan.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Get dashboard summary for current user
const getSummary = async (req, res) => {
  try {
    const { customId } = req?.user;

    // Get counts for each service
    const [
      advokasiTotal,
      advokasiPending,
      advokasiDiterima,
      advokasiSelesai,
      konsultasiTotal,
      konsultasiPending,
      konsultasiSelesai,
      pendampinganTotal,
      pendampinganPending,
      pendampinganSelesai,
    ] = await Promise.all([
      // Advokasi counts
      Advokasi.query().where("user_id", customId).resultSize(),
      Advokasi.query()
        .where("user_id", customId)
        .where("status", "Pending")
        .resultSize(),
      Advokasi.query()
        .where("user_id", customId)
        .whereIn("status", ["Diterima", "Approved", "Scheduled"])
        .resultSize(),
      Advokasi.query()
        .where("user_id", customId)
        .where("status", "Completed")
        .resultSize(),

      // Konsultasi Hukum counts
      KonsultasiHukum.query().where("user_id", customId).resultSize(),
      KonsultasiHukum.query()
        .where("user_id", customId)
        .where("status", "Pending")
        .resultSize(),
      KonsultasiHukum.query()
        .where("user_id", customId)
        .where("status", "Completed")
        .resultSize(),

      // Pendampingan Hukum counts
      Pendampingan.query().where("user_id", customId).resultSize(),
      Pendampingan.query()
        .where("user_id", customId)
        .where("status", "Pending")
        .resultSize(),
      Pendampingan.query()
        .where("user_id", customId)
        .where("status", "Completed")
        .resultSize(),
    ]);

    // Get recent activities (last 5 from each)
    const [recentAdvokasi, recentKonsultasi, recentPendampingan] =
      await Promise.all([
        Advokasi.query()
          .where("user_id", customId)
          .orderBy("created_at", "desc")
          .limit(3)
          .withGraphFetched("[jadwal]"),
        KonsultasiHukum.query()
          .where("user_id", customId)
          .orderBy("created_at", "desc")
          .limit(3),
        Pendampingan.query()
          .where("user_id", customId)
          .orderBy("created_at", "desc")
          .limit(3),
      ]);

    // Combine and sort recent activities
    const recentActivities = [
      ...recentAdvokasi.map((item) => ({
        id: item.id,
        type: "advokasi",
        typeLabel: "Advokasi",
        status: item.status,
        date: item.created_at,
        jadwal: item.jadwal?.tanggal_konsultasi || null,
      })),
      ...recentKonsultasi.map((item) => ({
        id: item.id,
        type: "konsultasi",
        typeLabel: "Konsultasi Hukum",
        status: item.status,
        date: item.created_at,
      })),
      ...recentPendampingan.map((item) => ({
        id: item.id,
        type: "pendampingan",
        typeLabel: "Pendampingan Hukum",
        status: item.status,
        date: item.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Get upcoming jadwal (advokasi yang sudah diterima)
    const upcomingJadwal = await Advokasi.query()
      .where("user_id", customId)
      .whereIn("status", ["Diterima", "Approved", "Scheduled"])
      .withGraphFetched("[jadwal]")
      .orderBy("created_at", "desc")
      .limit(3);

    // Get unread notifications count
    const unreadNotifications = await Notifikasi.query()
      .where("user_id", customId)
      .where("is_read", false)
      .resultSize();

    // Check if user can submit new advokasi this month
    const now = dayjs();
    const startOfMonth = now.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = now.endOf("month").format("YYYY-MM-DD");
    const advokasiThisMonth = await Advokasi.query()
      .where("user_id", customId)
      .whereBetween("created_at", [startOfMonth, endOfMonth])
      .whereNot("status", "Cancelled")
      .first();

    res.json({
      summary: {
        advokasi: {
          total: advokasiTotal,
          pending: advokasiPending,
          diterima: advokasiDiterima,
          selesai: advokasiSelesai,
        },
        konsultasi_hukum: {
          total: konsultasiTotal,
          pending: konsultasiPending,
          selesai: konsultasiSelesai,
        },
        pendampingan_hukum: {
          total: pendampinganTotal,
          pending: pendampinganPending,
          selesai: pendampinganSelesai,
        },
        total_layanan:
          advokasiTotal + konsultasiTotal + pendampinganTotal,
        total_pending:
          advokasiPending + konsultasiPending + pendampinganPending,
        total_selesai:
          advokasiSelesai + konsultasiSelesai + pendampinganSelesai,
      },
      recent_activities: recentActivities,
      upcoming_jadwal: upcomingJadwal.map((item) => ({
        id: item.id,
        tanggal: item.jadwal?.tanggal_konsultasi,
        waktu: item.jadwal
          ? `${item.jadwal.waktu_mulai || "10:00"} - ${item.jadwal.waktu_selesai || "12:00"}`
          : null,
        status: item.status,
      })),
      notifications: {
        unread: unreadNotifications,
      },
      can_submit_advokasi: !advokasiThisMonth,
      advokasi_this_month: advokasiThisMonth || null,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get notifications for current user
const getNotifications = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { page = 1, limit = 10, unreadOnly = false } = req?.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = Notifikasi.query().where("user_id", customId);

    if (unreadOnly === "true") {
      query = query.where("is_read", false);
    }

    const total = await query.clone().resultSize();

    const data = await query
      .orderBy("created_at", "desc")
      .limit(parseInt(limit))
      .offset(offset);

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

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    if (id === "all") {
      // Mark all as read
      await Notifikasi.query()
        .where("user_id", customId)
        .where("is_read", false)
        .patch({ is_read: true });

      res.json({ message: "Semua notifikasi telah dibaca" });
    } else {
      // Mark single notification
      const notif = await Notifikasi.query()
        .where({ id, user_id: customId })
        .first();

      if (!notif) {
        return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
      }

      await Notifikasi.query().findById(id).patch({ is_read: true });

      res.json({ message: "Notifikasi telah dibaca" });
    }
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getSummary,
  getNotifications,
  markNotificationRead,
};

