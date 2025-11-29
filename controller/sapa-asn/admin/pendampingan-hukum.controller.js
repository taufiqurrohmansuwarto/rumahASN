const Pendampingan = require("@/models/sapa-asn/sapa-asn.pendampingan.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");
const ExcelJS = require("exceljs");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Get all pendampingan hukum (admin)
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      jenisPerkara,
      bentuk,
      search,
      sortField = "created_at",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req?.query;

    let query = Pendampingan.query().withGraphFetched("[user(simpleWithImage)]");

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

    // Filter by date range
    if (startDate && endDate) {
      query = query.whereBetween("created_at", [startDate, endDate]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("id", "ilike", `%${search}%`)
          .orWhere("no_perkara", "ilike", `%${search}%`)
          .orWhere("ringkasan_perkara", "ilike", `%${search}%`)
          .orWhere("pengadilan_jadwal", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Export to Excel if limit = -1
    if (parseInt(limit) === -1) {
      const data = await query;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Pendampingan Hukum");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "ID", key: "id", width: 20 },
        { header: "Nama User", key: "user_name", width: 25 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "No HP", key: "no_hp", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "No Perkara", key: "no_perkara", width: 20 },
        { header: "Jenis Perkara", key: "jenis_perkara", width: 30 },
        { header: "Pengadilan & Jadwal", key: "pengadilan", width: 30 },
        { header: "Ringkasan Perkara", key: "ringkasan", width: 50 },
        { header: "Bentuk Pendampingan", key: "bentuk", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Tanggal Pengajuan", key: "created_at", width: 20 },
      ];

      data.forEach((item, idx) => {
        const jenisPerkara = typeof item.jenis_perkara === "string"
          ? JSON.parse(item.jenis_perkara || "[]").join(", ")
          : (item.jenis_perkara || []).join(", ");

        const bentukPendampingan = typeof item.bentuk_pendampingan === "string"
          ? JSON.parse(item.bentuk_pendampingan || "[]").join(", ")
          : (item.bentuk_pendampingan || []).join(", ");

        worksheet.addRow({
          no: idx + 1,
          id: item.id,
          user_name: item.user?.username || "-",
          nip: item.user?.employee_number || "-",
          no_hp: item.no_hp_user,
          email: item.email_user,
          no_perkara: item.no_perkara || "-",
          jenis_perkara: jenisPerkara,
          pengadilan: item.pengadilan_jadwal || "-",
          ringkasan: item.ringkasan_perkara || "-",
          bentuk: bentukPendampingan,
          status: item.status,
          created_at: dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=pendampingan-hukum-${dayjs().format("YYYYMMDD")}.xlsx`
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

// Get pendampingan by ID (admin)
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await Pendampingan.query()
      .findById(id)
      .withGraphFetched("[user(simpleWithImage)]");

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Update status pendampingan (admin)
const updateStatus = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { status, catatan, alasan_tolak } = req?.body;

    const pendampingan = await Pendampingan.query().findById(id);

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const updateData = {
      status,
      fasilitator_id: customId,
    };

    if (catatan) {
      updateData.catatan = catatan;
    }

    if (alasan_tolak) {
      updateData.alasan_tolak = alasan_tolak;
    }

    await Pendampingan.query().findById(id).patch(updateData);

    // Create notification for user
    let notifJudul = "";
    let notifPesan = "";

    switch (status) {
      case "Diterima":
      case "Approved":
        notifJudul = "Permohonan Pendampingan Diterima";
        notifPesan = `Permohonan pendampingan hukum Anda telah disetujui. Tim kami akan menghubungi Anda.`;
        break;
      case "Ditolak":
      case "Rejected":
        notifJudul = "Permohonan Pendampingan Ditolak";
        notifPesan = `Permohonan pendampingan hukum Anda ditolak. Alasan: ${alasan_tolak || "-"}`;
        break;
      case "In Progress":
        notifJudul = "Pendampingan Sedang Berjalan";
        notifPesan = `Proses pendampingan hukum Anda sedang berjalan.`;
        break;
      case "Completed":
        notifJudul = "Pendampingan Hukum Selesai";
        notifPesan = `Proses pendampingan hukum Anda telah selesai. Terima kasih telah menggunakan layanan kami.`;
        break;
      default:
        notifJudul = "Status Pendampingan Diperbarui";
        notifPesan = `Status permohonan pendampingan hukum Anda telah diperbarui menjadi: ${status}`;
    }

    await Notifikasi.query().insert({
      user_id: pendampingan.user_id,
      judul: notifJudul,
      pesan: notifPesan,
      layanan: "pendampingan_hukum",
      reference_id: id,
    });

    res.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  updateStatus,
};

