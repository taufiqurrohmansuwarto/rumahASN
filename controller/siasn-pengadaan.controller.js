const { daftarPengadaanInstansi } = require("@/utils/siasn-utils");
const moment = require("moment");

const listPengadaanInstansi = async (req, res) => {
  try {
    const tahun = req?.query?.tahun || moment().format("YYYY");
    const { siasnRequest: request } = req;
    const result = await daftarPengadaanInstansi(request, tahun);

    const data = result?.data;
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  listPengadaanInstansi,
};
