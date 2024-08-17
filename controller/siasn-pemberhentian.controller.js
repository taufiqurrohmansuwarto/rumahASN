const { listPemberhentianSIASN } = require("@/utils/siasn-utils");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const daftarPemberhentianSIASN = async (req, res) => {
  try {
    const { siasnRequest: request, user } = req;
    const tglAwal = req?.query?.tglAwal || dayjs().format("DD-MM-YYYY");
    const tglAkhir = req?.query?.tglAkhir || dayjs().format("DD-MM-YYYY");

    console.log({
      tglAwal,
      tglAkhir,
    });

    const result = await listPemberhentianSIASN(request, tglAwal, tglAkhir);
    const hasil = result?.data;

    const hasData = hasil?.code === 1 && hasil?.count !== 0;

    if (!hasData) {
      res.json([]);
    } else {
      res.json(hasil?.data);
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
