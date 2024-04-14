const User = require("@/models/users.model");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
require("dayjs/locale/id");
dayjs.locale("id");

const showModalRatings = async (req, res) => {
  try {
    const { customId: userId } = req.user;

    const currentUser = await User.query()
      .where("custom_id", userId)
      .select(
        "custom_id",
        "frekuensi_kunjungan",
        "terakhir_diberi_rate",
        "jumlah_tutup_rating",
        "terakhir_tutup_rating"
      )
      .first();

    //       30 kunjungan harus memberikan rating
    const syaratKunjungan = currentUser.frekuensi_kunjungan >= 30;
    const syaratTutupRating = currentUser.jumlah_tutup_rating >= 5;
    const sudahMemberikanRating = currentUser.terakhir_diberi_rate !== null;

    //     cek terakhir tutup rating apakah lebih dari 1 bulan
    const terakhirTutupRating = dayjs(currentUser.terakhir_tutup_rating);
    const sekarang = dayjs(new Date());
    const selisihBulan = sekarang.diff(terakhirTutupRating, "months");

    if (
      syaratKunjungan &&
      !sudahMemberikanRating &&
      syaratTutupRating &&
      selisihBulan >= 1
    ) {
      res.json({
        show_modal: true,
      });
    } else {
      res.json({
        show_modal: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const giveRatings = async (req, res) => {
  try {
    const { customId: userId } = req.user;
    const { rating, deskripsi_rating } = req.body;

    await User.query()
      .patch({
        terakhir_diberi_rate: new Date(),
        rating,
        deskripsi_rating,
      })
      .where("custom_id", userId);
    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const closeModalRatings = async (req, res) => {
  try {
    const { customId: userId } = req.user;
    await User.query()
      .increment("jumlah_tutup_rating", 1)
      .where("custom_id", userId)
      .returning("*");

    await User.query()
      .patch({
        terakhir_tutup_rating: new Date(),
      })
      .where("custom_id", userId)
      .returning("*");

    console.log("tutup");
    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  giveRatings,
  showModalRatings,
  closeModalRatings,
};
