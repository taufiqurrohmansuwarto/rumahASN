const Guests = require("@/models/guests_books/guests.model");
const SchedulVisit = require("@/models/guests_books/schedule-visits.model");

// pembuatan dashboard untuk grafik pada buku tamu digital
/**
 1. statistikn kunjungan harian
 2. jumlah kunjungan
 3. jumlah tamu aktif saat ini
 4. rata-rata durasi kunjungan
 5. jenis kunjungan
 6. tamu berdasarkan instansi
 7. Kunjungan berdasarkan kategori
 8. status kunjungan
 9. Feedback atau kepuasaan tamu
 */

const queryKunjunganHarian = async () => {
  // statistik rencana kunjungan dalam 7 hari terakhir dengan colom visit date
  const query = await SchedulVisit.knex()
    .select("visit_date")
    .count("* as total")
    .where(
      "visit_date",
      ">=",
      new Date(new Date().setDate(new Date().getDate() - 7))
    )
    .groupBy("visit_date");

  return query;
};

const dashboard = async (req, res) => {
  try {
    const type = req?.query?.type || "kunjunganHarian";

    if (type === "kunjunganHarian") {
      const data = await queryKunjunganHarian();
      res.status(200).json({ data });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  dashboard,
};
