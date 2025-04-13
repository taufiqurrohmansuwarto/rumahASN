const {
  daftarPengadaanInstansi,
  daftarPengadaanDokumen,
  downloadDokumenAPI,
} = require("@/utils/siasn-utils");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const SiasnPengadaan = require("@/models/siasn-pengadaan.model");
const SiasnPengadaanProxy = require("@/models/siasn-pengadaan-proxy.model");
const { uploadDokumenSiasnToMinio } = require("../utils");
const { upperCase } = require("lodash");
const { handleError } = require("@/utils/helper/controller-helper");
const { proxyLayananRekapPengadaan } = require("@/utils/siasn-proxy.utils");

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

const syncPengadaanProxy = async (req, res) => {
  try {
    const { tahun = dayjs().format("YYYY") } = req.query;
    const { fetcher } = req;
    const knex = SiasnPengadaanProxy.knex();

    const result = await proxyLayananRekapPengadaan(fetcher, {
      tahun,
    });

    const currentData = result?.data;

    const { meta, page, data } = currentData;

    if (meta?.total > 0) {
      await knex.delete().from("siasn_pengadaan_proxy").where("periode", tahun);
      await knex.batchInsert("siasn_pengadaan_proxy", data);
      res.json({
        message: `Berhasil mengambil data dari proxy tahun ${tahun}`,
      });
    } else {
      res.json({ message: "Data tidak ditemukan" });
    }
  } catch (error) {
    handleError(res, error);
  }
};

const proxyRekapPengadaan = async (req, res) => {
  try {
    // Mendapatkan parameter dari query, dengan nilai default
    const {
      tahun = dayjs().format("YYYY"),
      page = 1,
      limit = 10,
      name = "",
      nip = "",
      no_peserta = "",
    } = req.query;

    // Membuat query dasar untuk mengambil data berdasarkan periode/tahun
    const result = SiasnPengadaanProxy.query().where("periode", tahun);

    // Menghitung total data yang ada
    const total = await result.clone().count("id as total").first();

    // Mengambil data dengan pagination
    const data = await result
      .clone()
      .where((builder) => {
        if (name) {
          builder.where("nama", "like", `%${name}%`);
        }
        if (nip) {
          builder.where("nip", "like", `%${nip}%`);
        }
        if (no_peserta) {
          builder.whereRaw(
            "JSON_CONTAINS(status_usulan, '\"data\":{\"no_peserta\":', '$') = 1"
          );
        }
      })
      .withGraphFetched("status_usulan_nama")
      .page(parseInt(page) - 1, parseInt(limit));

    const hasil = {
      total: parseInt(total?.total),
      page: parseInt(page),
      limit: parseInt(limit),
      data: data?.results,
    };

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  listPengadaanInstansi,
  listPengadaanDokumen,
  downloadDokumen,
  downloadToMaster,
  syncPengadaan,
  dokumenPengadaan,
  proxyRekapPengadaan,
  syncPengadaanProxy,
};
