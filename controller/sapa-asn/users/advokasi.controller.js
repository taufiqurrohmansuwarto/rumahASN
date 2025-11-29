const Advokasi = require("@/models/sapa-asn/sapa-asn.advokasi.model");
const Jadwal = require("@/models/sapa-asn/sapa-asn.jadwal.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");

const dayjs = require("dayjs");
const weekOfYear = require("dayjs/plugin/weekOfYear");
const isoWeek = require("dayjs/plugin/isoWeek");
require("dayjs/locale/id");

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.locale("id");

// Get all advokasi for current user
const getAll = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortField,
      sortOrder,
    } = req?.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = Advokasi.query()
      .where("user_id", customId)
      .withGraphFetched("[jadwal]");

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .whereRaw("kategori_isu::text ILIKE ?", [`%${search}%`])
          .orWhere("poin_konsultasi", "ilike", `%${search}%`);
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

// Get advokasi by ID
const getById = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const result = await Advokasi.query()
      .where({
        id,
        user_id: customId,
      })
      .withGraphFetched("[jadwal]")
      .first();

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Create new advokasi
const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { body } = req;

    const {
      no_hp,
      email,
      kategori_isu,
      kategori_lainnya,
      sensitif,
      poin_konsultasi,
      jadwal_id,
      jadwal_tanggal, // For new jadwal (format: YYYY-MM-DD)
      is_persetujuan,
    } = body;

    // Check if user already registered this month
    const now = dayjs();
    const startOfMonth = now.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = now.endOf("month").format("YYYY-MM-DD");
    const existingAdvokasi = await Advokasi.query()
      .where("user_id", customId)
      .whereBetween("created_at", [startOfMonth, endOfMonth])
      .whereNot("status", "Cancelled")
      .first();

    if (existingAdvokasi) {
      return res.status(400).json({
        message: "Anda sudah terdaftar untuk sesi advokasi bulan ini",
        existing: existingAdvokasi,
      });
    }

    let finalJadwalId = jadwal_id;
    let jadwalData;

    // Check if it's an existing jadwal or new one
    if (jadwal_id && !jadwal_id.startsWith("new-")) {
      // Existing jadwal
      jadwalData = await Jadwal.query().findById(jadwal_id);

      if (!jadwalData) {
        return res.status(400).json({ message: "Jadwal tidak ditemukan" });
      }

      // Validate registration deadline
      const thursdayDate = dayjs(jadwalData.tanggal_konsultasi);
      if (!isRegistrationOpen(thursdayDate)) {
        return res.status(400).json({
          message:
            "Batas waktu pendaftaran sudah lewat (Selasa pukul 16:00 WIB)",
        });
      }

      // Check slot availability (count pending + approved advokasi for this jadwal)
      const bookedCount = await Advokasi.query()
        .where("jadwal_id", jadwal_id)
        .whereIn("status", ["Pending", "Approved", "Diterima"])
        .resultSize();

      if (bookedCount >= jadwalData.kuota_maksimal) {
        return res.status(400).json({ message: "Kuota jadwal sudah penuh" });
      }

      finalJadwalId = jadwal_id;
    } else {
      // New jadwal - auto create
      const tanggal = jadwal_tanggal || jadwal_id?.replace("new-", "");
      if (!tanggal) {
        return res.status(400).json({ message: "Tanggal jadwal diperlukan" });
      }

      const thursdayDate = dayjs(tanggal);

      // Validate it's a valid Thursday (week 2 or 4)
      if (thursdayDate.day() !== 4) {
        return res.status(400).json({ message: "Jadwal harus hari Kamis" });
      }

      const weekOfMonth = getWeekOfMonth(thursdayDate);
      if (weekOfMonth !== 2 && weekOfMonth !== 4) {
        return res.status(400).json({
          message: "Jadwal harus Kamis minggu ke-2 atau ke-4",
        });
      }

      // Validate registration deadline
      if (!isRegistrationOpen(thursdayDate)) {
        return res.status(400).json({
          message:
            "Batas waktu pendaftaran sudah lewat (Selasa pukul 16:00 WIB)",
        });
      }

      // Check if jadwal already exists for this date
      const existingJadwal = await Jadwal.query()
        .where("tanggal_konsultasi", tanggal)
        .first();

      if (existingJadwal) {
        jadwalData = existingJadwal;
        finalJadwalId = existingJadwal.id;

        // Check slot availability
        const bookedCount = await Advokasi.query()
          .where("jadwal_id", finalJadwalId)
          .whereIn("status", ["Pending", "Approved", "Diterima"])
          .resultSize();

        if (bookedCount >= jadwalData.kuota_maksimal) {
          return res.status(400).json({ message: "Kuota jadwal sudah penuh" });
        }
      } else {
        // Create new jadwal
        jadwalData = await Jadwal.query().insert({
          tanggal_konsultasi: tanggal,
          waktu_mulai: "10:00",
          waktu_selesai: "12:00",
          kuota_maksimal: 10,
          kuota_terisi: 0,
          status: "active",
        });
        finalJadwalId = jadwalData.id;
      }
    }

    // Parse kategori_isu
    const parsedKategoriIsu = Array.isArray(kategori_isu)
      ? kategori_isu
      : JSON.parse(kategori_isu || "[]");

    // Create advokasi
    const result = await Advokasi.query().insert({
      user_id: customId,
      no_hp_user: no_hp,
      email_user: email,
      kategori_isu: JSON.stringify(parsedKategoriIsu),
      kategori_lainnya: kategori_lainnya || null,
      is_sensitive: sensitif === "true" || sensitif === true,
      poin_konsultasi: poin_konsultasi || null,
      jadwal_id: finalJadwalId,
      is_persetujuan: is_persetujuan === "true" || is_persetujuan === true,
      status: "Pending",
    });

    // NOTE: kuota_terisi akan diupdate oleh admin saat status diubah menjadi "Diterima"
    // Tidak diupdate saat submit untuk menghindari overbooking

    // Create notification
    await Notifikasi.query().insert({
      user_id: customId,
      judul: "Permohonan Advokasi Terkirim",
      pesan: `Permohonan advokasi Anda untuk tanggal ${dayjs(
        jadwalData.tanggal_konsultasi
      ).format(
        "D MMMM YYYY"
      )} telah berhasil dikirim dan sedang menunggu konfirmasi.`,
      layanan: "advokasi",
      reference_id: result.id,
    });

    res.json({
      message: "Permohonan advokasi berhasil dikirim",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper: Get week number of month (1-5)
const getWeekOfMonth = (date) => {
  const startOfMonth = dayjs(date).startOf("month");
  const dayOfMonth = dayjs(date).date();
  const startDay = startOfMonth.day(); // 0 = Sunday
  return Math.ceil((dayOfMonth + startDay) / 7);
};

// Helper: Get Thursdays of week 2 & 4 for a given month
const getAdvokasIThursdays = (month, year) => {
  const thursdays = [];
  let date = dayjs(`${year}-${month}-01`);
  const lastDay = date.endOf("month").date();

  for (let d = 1; d <= lastDay; d++) {
    const currentDate = dayjs(
      `${year}-${month}-${d.toString().padStart(2, "0")}`
    );
    if (currentDate.day() === 4) {
      // Thursday = 4
      const weekOfMonth = getWeekOfMonth(currentDate);
      if (weekOfMonth === 2 || weekOfMonth === 4) {
        thursdays.push(currentDate);
      }
    }
  }
  return thursdays;
};

// Helper: Check if registration is still open (H-2 Tuesday 16:00)
const isRegistrationOpen = (thursdayDate) => {
  const now = dayjs();
  // Registration deadline: Tuesday of the same week at 16:00 WIB
  const deadline = dayjs(thursdayDate)
    .subtract(2, "day") // Thursday - 2 = Tuesday
    .hour(16)
    .minute(0)
    .second(0);
  return now.isBefore(deadline);
};

// Get available jadwal for advokasi
const getJadwal = async (req, res) => {
  try {
    const { customId } = req?.user;
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // Generate Thursdays for current and next month
    const currentMonthThursdays = getAdvokasIThursdays(
      currentMonth,
      currentYear
    );
    const nextMonthThursdays = getAdvokasIThursdays(nextMonth, nextMonthYear);
    const allThursdays = [...currentMonthThursdays, ...nextMonthThursdays];

    // Filter only future dates with open registration
    const availableThursdays = allThursdays.filter(
      (date) => date.isAfter(now) && isRegistrationOpen(date)
    );

    // Get existing jadwal from database
    const existingJadwal = await Jadwal.query().whereIn(
      "tanggal_konsultasi",
      availableThursdays.map((d) => d.format("YYYY-MM-DD"))
    );

    // Get jadwal IDs for counting bookings
    const jadwalIds = existingJadwal.map((j) => j.id);

    // Count bookings per jadwal (Pending + Approved + Diterima)
    const bookingCounts = await Advokasi.query()
      .whereIn("jadwal_id", jadwalIds)
      .whereIn("status", ["Pending", "Approved", "Diterima"])
      .select("jadwal_id")
      .count("id as total")
      .groupBy("jadwal_id");

    const bookingMap = bookingCounts.reduce((acc, item) => {
      acc[item.jadwal_id] = parseInt(item.total);
      return acc;
    }, {});

    // Check if user already registered this month
    const startOfMonth = now.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = now.endOf("month").format("YYYY-MM-DD");
    const userAdvokasiBulanIni = await Advokasi.query()
      .where("user_id", customId)
      .whereBetween("created_at", [startOfMonth, endOfMonth])
      .whereNot("status", "Cancelled")
      .first();

    const sudahDaftarBulanIni = !!userAdvokasiBulanIni;

    // Build response with slot info
    const slots = availableThursdays.map((date) => {
      const dateStr = date.format("YYYY-MM-DD");
      const existing = existingJadwal.find(
        (j) => dayjs(j.tanggal_konsultasi).format("YYYY-MM-DD") === dateStr
      );

      const kuotaMaksimal = existing?.kuota_maksimal || 10; // Default 10 slot per sesi
      // Count from actual bookings, not kuota_terisi
      const bookedCount = existing ? bookingMap[existing.id] || 0 : 0;
      const sisaKuota = kuotaMaksimal - bookedCount;
      const deadline = date.subtract(2, "day").hour(16).minute(0);

      // Status: hijau (banyak), orange (terbatas), merah (penuh)
      let status = "available";
      if (sisaKuota <= 0) {
        status = "full";
      } else if (sisaKuota <= 3) {
        status = "limited";
      }

      return {
        value: existing?.id || `new-${dateStr}`,
        tanggal: dateStr,
        label: date.format("dddd, D MMMM YYYY"),
        hari: date.format("dddd"),
        waktu: existing?.waktu_mulai
          ? `${existing.waktu_mulai} - ${existing.waktu_selesai}`
          : "10:00 - 12:00",
        deadline: deadline.format("dddd, D MMMM YYYY [pukul] HH:mm [WIB]"),
        kuota_maksimal: kuotaMaksimal,
        kuota_terisi: bookedCount,
        sisa_kuota: Math.max(0, sisaKuota),
        status,
        tipe: "daring", // daring/luring
        is_new: !existing,
      };
    });

    // Group by month
    const grouped = slots.reduce((acc, slot) => {
      const monthYear = dayjs(slot.tanggal).format("MMMM YYYY");
      const existing = acc.find((g) => g.bulan === monthYear);
      if (existing) {
        existing.slots.push(slot);
      } else {
        acc.push({
          bulan: monthYear,
          slots: [slot],
        });
      }
      return acc;
    }, []);

    res.json({
      jadwal: grouped,
      info: {
        sudah_daftar_bulan_ini: sudahDaftarBulanIni,
        advokasi_bulan_ini: userAdvokasiBulanIni || null,
        ketentuan: {
          hari_sesi: "Kamis minggu ke-2 & ke-4",
          waktu_sesi: "10:00 - 12:00 WIB",
          durasi_per_sesi: "Maksimal 45 menit",
          batas_pendaftaran: "Selasa (H-2) pukul 16:00 WIB",
          tipe_sesi: "Daring (video conference) atau Luring",
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Cancel advokasi (only if status is pending)
const cancel = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const advokasi = await Advokasi.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!advokasi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (advokasi.status !== "Pending") {
      return res.status(400).json({
        message: "Hanya dapat membatalkan permohonan yang masih pending",
      });
    }

    // Update status
    await Advokasi.query().findById(id).patch({
      status: "Cancelled",
    });

    // NOTE: Tidak perlu mengurangi kuota karena kuota hanya dihitung dari status Diterima
    // Slot akan otomatis tersedia kembali karena check availability menghitung
    // advokasi dengan status Pending/Approved/Diterima

    res.json({ message: "Permohonan berhasil dibatalkan" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  getJadwal,
  cancel,
};
