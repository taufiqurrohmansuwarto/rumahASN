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
    const knex = SiasnPengadaanProxy.knex();
    // Mendapatkan parameter dari query, dengan nilai default
    const {
      tahun = dayjs().format("YYYY"),
      page = 1,
      limit = 25,
      nama = "",
      nip = "",
      no_peserta = "",
      status_usulan,
    } = req.query;

    // Membuat query dasar untuk mengambil data berdasarkan periode/tahun
    const baseQuery = knex("siasn_pengadaan_proxy as sp")
      .where("sp.periode", tahun)
      .leftJoin("ref_siasn.status_usul as rsu", "sp.status_usulan", "rsu.id")
      .leftJoin(
        knex.raw(`(
          SELECT DISTINCT ON (id_siasn) id_siasn, id_simaster
          FROM rekon.unor
          ORDER BY id_siasn, id_simaster
        ) as ru`),
        knex.raw("sp.usulan_data->'data'->>'unor_id'"),
        "ru.id_siasn"
      )
      .select(
        "sp.*",
        knex.raw(
          "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn"
        ),
        knex.raw(
          "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster"
        ),
        "rsu.id as status_usulan_id",
        "rsu.nama as status_usulan_nama"
      )
      .orderBy(knex.raw('sp.nama collate "C"'), "asc"); // Pengurutan berdasarkan nama dengan collation C

    // Menambahkan filter ke query
    if (nama) {
      baseQuery.where("sp.nama", "ilike", `%${nama}%`);
    }
    if (nip) {
      baseQuery.where("sp.nip", "ilike", `%${nip}%`);
    }
    if (no_peserta) {
      const likePattern = `%${no_peserta}%`;
      baseQuery.whereRaw(
        "CAST(sp.usulan_data->'data' AS JSONB)::TEXT ILIKE ?",
        [likePattern]
      );
    }

    // Filter status_usulan jika ada
    if (status_usulan) {
      const statusArray = status_usulan.split(",").map(Number);
      baseQuery.whereIn("sp.status_usulan", statusArray);
    }

    // Membuat clone dari query untuk menghitung total
    const countQuery = baseQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .count("* as total")
      .first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.total);

    let dataResult;
    // Jika limit = -1, tampilkan semua data tanpa paging
    if (parseInt(limit) === -1) {
      dataResult = await baseQuery;
    } else {
      // Mengambil data dengan pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      dataResult = await baseQuery.limit(parseInt(limit)).offset(offset);
    }

    // Memformat data untuk respons
    const data = dataResult.map((item) => {
      // Memisahkan data status_usulan dari hasil query
      const {
        status_usulan_id,
        status_usulan_nama,
        status_usulan_color,
        ...pengadaanData
      } = item;

      // Mengembalikan format yang sesuai dengan yang diharapkan komponen frontend
      return {
        ...pengadaanData,
        status_usulan_nama: status_usulan_id
          ? {
              id: status_usulan_id,
              nama: status_usulan_nama,
              color: status_usulan_color,
            }
          : null,
      };
    });

    const hasil = {
      total: total,
      page: parseInt(limit) === -1 ? 1 : parseInt(page),
      limit: parseInt(limit),
      data: data,
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
