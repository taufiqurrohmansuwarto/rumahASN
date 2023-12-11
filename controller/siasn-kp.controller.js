const { daftarKenaikanPangkat } = require("@/utils/siasn-utils");
const moment = require("moment");
const FormData = require("form-data");

const listKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const periode = req?.query?.periode || moment().format("YYYY-MM-DD");

    const result = await daftarKenaikanPangkat(request, periode);
    const data = result?.data;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

const uploadDokumenKenaikanPangkat = async (req, res) => {
  try {
    const file = req?.file;
    const { siasnRequest: request } = req;

    const formData = new FormData();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  listKenaikanPangkat,
  uploadDokumenKenaikanPangkat,
};
