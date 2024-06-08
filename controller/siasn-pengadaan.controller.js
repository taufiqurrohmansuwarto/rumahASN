const {
  daftarPengadaanInstansi,
  daftarPengadaanDokumen,
} = require("@/utils/siasn-utils");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const SiasnPengadaan = require("@/models/siasn-pengadaan.model");

const listPengadaanInstansi = async (req, res) => {
  const knex = await SiasnPengadaan.knex();
  try {
    const tahun = req?.query?.tahun || dayjs().format("YYYY");
    const sync = req?.query?.sync || false;
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;
    const nama = req?.query?.nama || "";
    const no_peserta = req?.query?.no_peserta || "";
    const jenis_formasi_nama = req?.query?.jenis_formasi_nama || "";
    const belum_cetak_sk = req?.query?.belum_cetak_sk || false;
    const nip = req?.query?.nip || "";

    const hasil = await SiasnPengadaan.query()
      .where("periode", tahun)
      .where((builder) => {
        if (nama) {
          builder.orWhere("nama", "ilike", `%${nama}%`);
        }
        if (belum_cetak_sk) {
          builder.orWhere("no_sk", "=", "");
        }
        if (no_peserta) {
          builder.orWhere("no_peserta", "=", `${no_peserta}`);
        }
        if (nip) {
          builder.orWhere("nip", "=", `${nip}`);
        }
        if (jenis_formasi_nama) {
          builder.orWhere(
            "jenis_formasi_nama",
            "ilike",
            `%${jenis_formasi_nama}%`
          );
        }
      })
      .page(parseInt(page) - 1, parseInt(limit));

    if (!hasil?.total || sync === "true") {
      const { siasnRequest: request } = req;
      const result = await daftarPengadaanInstansi(request, tahun);

      if (result === "Data tidak ditemukan") {
        res.json([]);
      } else {
        await knex.delete().from("siasn_pengadaan").where("periode", tahun);
        await knex.batchInsert("siasn_pengadaan", result);
        const hasil = await SiasnPengadaan.query()
          .where("periode", tahun)
          .page(parseInt(page) - 1, parseInt(limit));

        const data = {
          total: hasil?.total,
          data: hasil?.results,
          page: parseInt(page),
          limit: parseInt(limit),
        };

        res.json(data);
      }
    } else {
      const data = {
        total: hasil?.total,
        data: hasil?.results,
        page: parseInt(page),
        limit: parseInt(limit),
      };
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const listPengadaanDokumen = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const tahun = req?.query?.tahun || dayjs().format("YYYY");
    console.log(tahun);
    const result = await daftarPengadaanDokumen(request, tahun);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  listPengadaanInstansi,
  listPengadaanDokumen,
};
