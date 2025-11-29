const Advokasi = require("@/models/sapa-asn/sapa-asn.advokasi.model");
const Jadwal = require("@/models/sapa-asn/sapa-asn.jadwal.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");
const ExcelJS = require("exceljs");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Get all advokasi (admin)
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortField = "created_at",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req?.query;

    let query = Advokasi.query().withGraphFetched("[jadwal, user(simpleWithImage)]");

    // Filter by status
    if (status) {
      query = query.where("status", status);
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
          .orWhereRaw("kategori_isu::text ILIKE ?", [`%${search}%`])
          .orWhere("poin_konsultasi", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Export to Excel if limit = -1
    if (parseInt(limit) === -1) {
      const data = await query;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Advokasi");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "ID", key: "id", width: 20 },
        { header: "Nama User", key: "user_name", width: 25 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "No HP", key: "no_hp", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Kategori Isu", key: "kategori", width: 30 },
        { header: "Sensitif", key: "sensitif", width: 10 },
        { header: "Poin Konsultasi", key: "poin", width: 40 },
        { header: "Tanggal Jadwal", key: "jadwal", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Alasan Tolak", key: "alasan", width: 30 },
        { header: "Tanggal Pengajuan", key: "created_at", width: 20 },
      ];

      data.forEach((item, idx) => {
        const kategori = typeof item.kategori_isu === "string" 
          ? JSON.parse(item.kategori_isu || "[]").join(", ")
          : (item.kategori_isu || []).join(", ");

        worksheet.addRow({
          no: idx + 1,
          id: item.id,
          user_name: item.user?.username || "-",
          nip: item.user?.employee_number || "-",
          no_hp: item.no_hp_user,
          email: item.email_user,
          kategori: kategori,
          sensitif: item.is_sensitive ? "Ya" : "Tidak",
          poin: item.poin_konsultasi || "-",
          jadwal: item.jadwal?.tanggal_konsultasi
            ? dayjs(item.jadwal.tanggal_konsultasi).format("DD/MM/YYYY")
            : "-",
          status: item.status,
          alasan: item.alasan_tolak || "-",
          created_at: dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=advokasi-${dayjs().format("YYYYMMDD")}.xlsx`
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

// Get advokasi by ID (admin)
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await Advokasi.query()
      .findById(id)
      .withGraphFetched("[jadwal, user(simpleWithImage)]");

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Update status advokasi (admin)
const updateStatus = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { status, alasan_tolak, catatan } = req?.body;

    const advokasi = await Advokasi.query().findById(id);

    if (!advokasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const updateData = {
      status,
      fasilitator_id: customId,
    };

    if (alasan_tolak) {
      updateData.alasan_tolak = alasan_tolak;
    }

    if (catatan) {
      updateData.catatan = catatan;
    }

    // If status is approved/diterima, update jadwal kuota
    if (status === "Diterima" || status === "Approved") {
      if (advokasi.jadwal_id) {
        const jadwal = await Jadwal.query().findById(advokasi.jadwal_id);
        if (jadwal) {
          await Jadwal.query()
            .findById(advokasi.jadwal_id)
            .patch({
              kuota_terisi: (jadwal.kuota_terisi || 0) + 1,
            });
        }
      }
    }

    await Advokasi.query().findById(id).patch(updateData);

    // Create notification for user
    let notifJudul = "";
    let notifPesan = "";

    switch (status) {
      case "Diterima":
      case "Approved":
        notifJudul = "Permohonan Advokasi Diterima";
        notifPesan = `Permohonan advokasi Anda telah disetujui. Silakan hadir sesuai jadwal yang telah ditentukan.`;
        break;
      case "Ditolak":
      case "Rejected":
        notifJudul = "Permohonan Advokasi Ditolak";
        notifPesan = `Permohonan advokasi Anda ditolak. Alasan: ${alasan_tolak || "-"}`;
        break;
      case "Completed":
        notifJudul = "Sesi Advokasi Selesai";
        notifPesan = `Sesi advokasi Anda telah selesai. Terima kasih telah menggunakan layanan kami.`;
        break;
      default:
        notifJudul = "Status Advokasi Diperbarui";
        notifPesan = `Status permohonan advokasi Anda telah diperbarui menjadi: ${status}`;
    }

    await Notifikasi.query().insert({
      user_id: advokasi.user_id,
      judul: notifJudul,
      pesan: notifPesan,
      layanan: "advokasi",
      reference_id: id,
    });

    res.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

// Get jadwal list for admin
const getJadwal = async (req, res) => {
  try {
    const { month, year } = req?.query;

    let query = Jadwal.query().orderBy("tanggal_konsultasi", "asc");

    if (month && year) {
      const startDate = dayjs(`${year}-${month}-01`).format("YYYY-MM-DD");
      const endDate = dayjs(`${year}-${month}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
      query = query.whereBetween("tanggal_konsultasi", [startDate, endDate]);
    }

    const data = await query.withGraphFetched("[advokasi_list]");

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// Create or update jadwal (admin)
const upsertJadwal = async (req, res) => {
  try {
    const { id, tanggal_konsultasi, waktu_mulai, waktu_selesai, kuota_maksimal, status } =
      req?.body;

    if (id) {
      // Get current jadwal and count active registrations
      const jadwal = await Jadwal.query().findById(id);
      if (!jadwal) {
        return res.status(404).json({ message: "Jadwal tidak ditemukan" });
      }

      // Count active advokasi for this jadwal
      const activeCount = await Advokasi.query()
        .where("jadwal_id", id)
        .whereNotIn("status", ["Cancelled", "Ditolak", "Rejected"])
        .resultSize();

      // Validate: cannot set kuota below active registrations
      if (kuota_maksimal && kuota_maksimal < activeCount) {
        return res.status(400).json({
          message: `Kuota tidak dapat diubah ke ${kuota_maksimal}. Saat ini sudah ada ${activeCount} pendaftar aktif.`,
          active_count: activeCount,
        });
      }

      // Update existing
      await Jadwal.query().findById(id).patch({
        tanggal_konsultasi,
        waktu_mulai,
        waktu_selesai,
        kuota_maksimal,
        status,
      });
      res.json({ message: "Jadwal berhasil diperbarui" });
    } else {
      // Create new
      const result = await Jadwal.query().insert({
        tanggal_konsultasi,
        waktu_mulai: waktu_mulai || "10:00",
        waktu_selesai: waktu_selesai || "12:00",
        kuota_maksimal: kuota_maksimal || 10,
        kuota_terisi: 0,
        status: status || "active",
      });
      res.json({ message: "Jadwal berhasil dibuat", data: result });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// Update kuota for a specific jadwal
const updateKuota = async (req, res) => {
  try {
    const { id } = req?.query;
    const { kuota_maksimal } = req?.body;

    if (!kuota_maksimal || kuota_maksimal < 1) {
      return res.status(400).json({ message: "Kuota harus minimal 1" });
    }

    const jadwal = await Jadwal.query().findById(id);
    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    // Count active advokasi for this jadwal
    const activeCount = await Advokasi.query()
      .where("jadwal_id", id)
      .whereNotIn("status", ["Cancelled", "Ditolak", "Rejected"])
      .resultSize();

    // Validate: cannot set kuota below active registrations
    if (kuota_maksimal < activeCount) {
      return res.status(400).json({
        message: `Kuota tidak dapat diubah ke ${kuota_maksimal}. Saat ini sudah ada ${activeCount} pendaftar aktif.`,
        active_count: activeCount,
        current_kuota: jadwal.kuota_maksimal,
      });
    }

    await Jadwal.query().findById(id).patch({ kuota_maksimal });

    res.json({
      message: "Kuota berhasil diperbarui",
      kuota_maksimal,
      active_count: activeCount,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get jadwal with active count
const getJadwalDetail = async (req, res) => {
  try {
    const { id } = req?.query;

    const jadwal = await Jadwal.query().findById(id);
    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    // Count active advokasi for this jadwal
    const activeCount = await Advokasi.query()
      .where("jadwal_id", id)
      .whereNotIn("status", ["Cancelled", "Ditolak", "Rejected"])
      .resultSize();

    res.json({
      ...jadwal,
      active_count: activeCount,
      available_slots: Math.max(0, jadwal.kuota_maksimal - activeCount),
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  updateStatus,
  getJadwal,
  upsertJadwal,
  updateKuota,
  getJadwalDetail,
};

