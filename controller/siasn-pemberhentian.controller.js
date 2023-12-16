const { listPemberhentianSIASN } = require("@/utils/siasn-utils");
const moment = require("moment");

const daftarPemberhentianSIASN = async (req, res) => {
  try {
    const { siasnRequest: request, user } = req;
    const tglAwal = req?.query?.tglAwal || moment().format("DD-MM-YYYY");
    const tglAkhir = req?.query?.tglAkhir || moment().format("DD-MM-YYYY");
    const current_role = user?.current_role;

    if (current_role !== "admin") {
      res.json([]);
    } else {
      const result = await listPemberhentianSIASN(request, tglAwal, tglAkhir);
      const hasil = result?.data;

      const hasData = hasil?.code === 1 && hasil?.count !== 0;

      if (!hasData) {
        res.json([]);
      } else {
        res.json(hasil?.data);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  daftarPemberhentianSIASN,
};
