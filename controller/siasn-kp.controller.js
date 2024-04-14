const { daftarKenaikanPangkat, uploadFileKP } = require("@/utils/siasn-utils");
const FormData = require("form-data");
const { createLogSIASN } = require("@/utils/logs");

const dayjs = require("dayjs");
require("dayjs/locale/id");

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.locale("id");
dayjs.extend(relativeTime);

const listKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const periode = req?.query?.periode || dayjs().format("YYYY-MM-DD");

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
    const { tgl_sk, no_sk, id_usulan, nip } = req?.body;

    if (!file) {
      res.status(400).json({
        message: "File tidak ditemukan",
      });
    } else {
      const formData = new FormData();
      formData.append("tgl_sk", dayjs(tgl_sk).format("DD-MM-YYYY"));
      formData.append("no_sk", no_sk);
      formData.append("file", file.buffer, file.originalname);
      formData.append("id_usulan", id_usulan);
      const hasil = await uploadFileKP(request, formData);

      await createLogSIASN({
        userId: request?.user?.customId,
        employeeNumber: nip,
        siasnServiceName: "uploadFileKP",
        type: "CREATE",
      });

      res.json(hasil?.data);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error?.message || "Internal Server Error",
    });
  }
};

module.exports = {
  listKenaikanPangkat,
  uploadDokumenKenaikanPangkat,
};
