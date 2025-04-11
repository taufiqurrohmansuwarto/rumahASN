const {
  daftarPengadaanInstansi,
  daftarPengadaanDokumen,
  downloadDokumenAPI,
} = require("@/utils/siasn-utils");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const SiasnPengadaan = require("@/models/siasn-pengadaan.model");
const { uploadDokumenSiasnToMinio } = require("../utils");
const { upperCase } = require("lodash");

const syncPengadaan = async (req, res) => {
  const knex = SiasnPengadaan.knex();
  const tahun = req?.query?.tahun || dayjs().format("YYYY");
  const request = req?.siasnRequest;

  try {
    const result = await daftarPengadaanInstansi(request, tahun);
    if (result === "Data tidak ditemukan") {
      res.json([]);
    } else {
      await knex.delete().from("siasn_pengadaan").where("periode", tahun);
      await knex.batchInsert("siasn_pengadaan", result);
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || "Internal Server Error";
    res.status(500).json({
      message: errorMessage,
    });
  }
};

const listPengadaanInstansi = async (req, res) => {
  try {
    const tahun = req?.query?.tahun || dayjs().format("YYYY");
    const result = await SiasnPengadaan.query()
      .where("periode", tahun)
      .orderBy("nama", "asc");
    res.json(result);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || "Internal Server Error";
    res.status(500).json({
      message: errorMessage,
    });
  }
};

const dokumenPengadaan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const tahun = req?.query?.tahun || dayjs().format("YYYY");
    const result = await daftarPengadaanDokumen(request, tahun);
    res.json(result?.data);
  } catch (error) {
    const errorMessage = error?.data || "Internal Server Error";
    res.status(400).json({
      message: errorMessage,
    });
  }
};

const listPengadaanDokumen = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const tahun = req?.query?.tahun || dayjs().format("YYYY");
    const result = await daftarPengadaanDokumen(request, tahun);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

// buat fungsi misal PPPK TEKNIS KHUSUS menjadi PPPKTEKNIKHUSUS
const formatNama = (nama) => {
  return nama.replace(/ /g, "").toUpperCase();
};

const downloadDokumen = async (req, res) => {
  try {
    const { siasnRequest: request, mc } = req;
    const { tahun = dayjs().format("YYYY"), type = "pertek" } = req.query;

    const dataPengadaan = await SiasnPengadaan.query()
      .where("periode", tahun)
      .select("jenis_formasi_nama", "periode", "nip", "path_ttd_pertek");

    if (!dataPengadaan?.length) {
      return res.json(null);
    }

    for (const item of dataPengadaan) {
      const namaDokumen = `${upperCase(type)}_${formatNama(
        `${item.jenis_formasi_nama} ${item.periode}`
      )}_${item.nip}.pdf`;

      const dokumen = await downloadDokumenAPI(request, item.path_ttd_pertek);
      await uploadDokumenSiasnToMinio(mc, namaDokumen, dokumen);
    }

    res.json({ message: "Berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const downloadToMaster = async (req, res) => {
  try {
    const { tahun = dayjs().format("YYYY") } = req.query;
    const dataPengadaan = await SiasnPengadaan.query()
      .where("periode", tahun)
      .select("nip", "no_peserta", "nama", "instansi_id");

    res.json(dataPengadaan);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  listPengadaanInstansi,
  listPengadaanDokumen,
  downloadDokumen,
  downloadToMaster,
  syncPengadaan,
  dokumenPengadaan,
};
