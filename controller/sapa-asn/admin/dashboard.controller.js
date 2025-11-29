const Advokasi = require("@/models/sapa-asn/sapa-asn.advokasi.model");
const KonsultasiHukum = require("@/models/sapa-asn/sapa-asn.konsultasi-hukum.model");
const Pendampingan = require("@/models/sapa-asn/sapa-asn.pendampingan.model");
const { handleError } = require("@/utils/helper/controller-helper");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Get admin dashboard summary
const getSummary = async (req, res) => {
  try {
    // Get counts for each service
    const [
      // Advokasi
      advokasiTotal,
      advokasiPending,
      advokasiDiterima,
      advokasiSelesai,
      advokasiDitolak,
      // Konsultasi
      konsultasiTotal,
      konsultasiPending,
      konsultasiSelesai,
      // Pendampingan
      pendampinganTotal,
      pendampinganPending,
      pendampinganSelesai,
    ] = await Promise.all([
      // Advokasi counts
      Advokasi.query().resultSize(),
      Advokasi.query().where("status", "Pending").resultSize(),
      Advokasi.query()
        .whereIn("status", ["Diterima", "Approved", "Scheduled"])
        .resultSize(),
      Advokasi.query().where("status", "Completed").resultSize(),
      Advokasi.query()
        .whereIn("status", ["Ditolak", "Rejected"])
        .resultSize(),
      // Konsultasi counts
      KonsultasiHukum.query().resultSize(),
      KonsultasiHukum.query().where("status", "Pending").resultSize(),
      KonsultasiHukum.query().where("status", "Completed").resultSize(),
      // Pendampingan counts
      Pendampingan.query().resultSize(),
      Pendampingan.query().where("status", "Pending").resultSize(),
      Pendampingan.query().where("status", "Completed").resultSize(),
    ]);

    // Get recent pending items
    const [recentAdvokasi, recentKonsultasi, recentPendampingan] =
      await Promise.all([
        Advokasi.query()
          .where("status", "Pending")
          .orderBy("created_at", "desc")
          .limit(5)
          .withGraphFetched("[jadwal, user(simpleWithImage)]"),
        KonsultasiHukum.query()
          .where("status", "Pending")
          .orderBy("created_at", "desc")
          .limit(5)
          .withGraphFetched("[user(simpleWithImage)]"),
        Pendampingan.query()
          .where("status", "Pending")
          .orderBy("created_at", "desc")
          .limit(5)
          .withGraphFetched("[user(simpleWithImage)]"),
      ]);

    // Monthly statistics (current month)
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const [
      advokasiThisMonth,
      konsultasiThisMonth,
      pendampinganThisMonth,
    ] = await Promise.all([
      Advokasi.query()
        .whereBetween("created_at", [startOfMonth, endOfMonth])
        .resultSize(),
      KonsultasiHukum.query()
        .whereBetween("created_at", [startOfMonth, endOfMonth])
        .resultSize(),
      Pendampingan.query()
        .whereBetween("created_at", [startOfMonth, endOfMonth])
        .resultSize(),
    ]);

    res.json({
      summary: {
        advokasi: {
          total: advokasiTotal,
          pending: advokasiPending,
          diterima: advokasiDiterima,
          selesai: advokasiSelesai,
          ditolak: advokasiDitolak,
          this_month: advokasiThisMonth,
        },
        konsultasi_hukum: {
          total: konsultasiTotal,
          pending: konsultasiPending,
          selesai: konsultasiSelesai,
          this_month: konsultasiThisMonth,
        },
        pendampingan_hukum: {
          total: pendampinganTotal,
          pending: pendampinganPending,
          selesai: pendampinganSelesai,
          this_month: pendampinganThisMonth,
        },
        total_pending:
          advokasiPending + konsultasiPending + pendampinganPending,
      },
      recent_pending: {
        advokasi: recentAdvokasi.map((item) => ({
          id: item.id,
          user_name: item.user?.username || "-",
          kategori: item.kategori_isu,
          jadwal: item.jadwal?.tanggal_konsultasi,
          created_at: item.created_at,
        })),
        konsultasi: recentKonsultasi.map((item) => ({
          id: item.id,
          user_name: item.user?.username || "-",
          jenis: item.jenis_permasalahan,
          created_at: item.created_at,
        })),
        pendampingan: recentPendampingan.map((item) => ({
          id: item.id,
          user_name: item.user?.username || "-",
          no_perkara: item.no_perkara,
          created_at: item.created_at,
        })),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getSummary,
};

