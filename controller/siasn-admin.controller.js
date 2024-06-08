const { kenaikanPangkatPeriode } = require("@/utils/siasn-utils");
const dayjs = require("dayjs");

// kenaikan pangkat
const daftarKenaikanPangkatPerPeriode = async (req, res) => {
  try {
    const { siasnFetcher } = req;
    const periode = req?.query?.periode || dayjs().format("YYYY-MM-DD");
    const result = await kenaikanPangkatPeriode(siasnFetcher, periode);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// pemberhentian
const daftarPemberhentianPerPeriode = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// pengadaan
const daftarPengadaanPerPeriode = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  daftarKenaikanPangkatPerPeriode,
  daftarPemberhentianPerPeriode,
  daftarPengadaanPerPeriode,
};
