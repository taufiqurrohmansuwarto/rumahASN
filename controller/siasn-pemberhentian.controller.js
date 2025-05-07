const { listPemberhentianSIASN } = require("@/utils/siasn-utils");
const SiasnPemberhentian = require("@/models/siasn/siasn-pemberhentian.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const serializeData = (data) => {
  return data?.map((item) => ({
    ...item,
    tmtPensiun: dayjs(item?.tmtPensiun).format("DD-MM-YYYY"),
  }));
};

const daftarPemberhentianSIASN = async (req, res) => {
  try {
    const month = req?.query?.month || dayjs().format("MM-YYYY");

    const tglAwal = dayjs(month, "MM-YYYY")
      .startOf("month")
      .format("DD-MM-YYYY");

    const result = await SiasnPemberhentian.query().where(
      "tmtPensiun",
      tglAwal
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

const syncPemberhentianSIASN = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const month = req?.query?.month || dayjs().format("MM-YYYY");

    const tglAwal = dayjs(month, "MM-YYYY")
      .startOf("month")
      .format("DD-MM-YYYY");

    const tglAkhir = dayjs(month, "MM-YYYY")
      .endOf("month")
      .format("DD-MM-YYYY");

    const result = await listPemberhentianSIASN(request, tglAwal, tglAkhir);
    const hasil = result?.data;

    const hasData = hasil?.code === 1 && hasil?.count !== 0;

    if (!hasData) {
      res.json([]);
    } else {
      const knex = SiasnPemberhentian.knex();
      const currentData = serializeData(hasil?.data);
      await knex
        .delete()
        .from("siasn_pemberhentian")
        .where("tmtPensiun", tglAwal);
      await knex.batchInsert("siasn_pemberhentian", currentData);
      res.json({
        success: true,
        message: "Data berhasil disinkronisasi",
      });
    }
  } catch (error) {
    console.log(error);
    const message = error?.response?.data?.message || "Internal Server Error";
    res.status(400).json({
      message,
    });
  }
};

const pemberhentianBerdasarkanPerangkatDaerah = async (req, res) => {
  try {
    const { skpd_id, tmtPensiun } = req?.query;

    const result = await SyncPegawai.query()
      .select({
        nip_master: "sync_pegawai.nip_master",
        nama_master: "sync_pegawai.nama_master",
        skpd_id: "sync_pegawai.skpd_id",
        jabatan_master: "sync_pegawai.jabatan_master",
        opd_master: "sync_pegawai.opd_master",
        foto: "sync_pegawai.foto",
      })
      .select({
        statusUsulan: "siasn_pemberhentian.statusUsulan",
        statusUsulanNama: "siasn_pemberhentian.statusUsulanNama",
        no_pertek: "siasn_pemberhentian.pertekNomor",
        no_sk: "siasn_pemberhentian.skNomor",
        path_sk: "siasn_pemberhentian.pathSk",
        path_pertek: "siasn_pemberhentian.pathPertek",
        tgl_pertek: "siasn_pemberhentian.pertekTgl",
        tgl_sk: "siasn_pemberhentian.skTgl",
        detail_layanan_nama: "siasn_pemberhentian.detailLayananNama",
        path_sk_preview: "siasn_pemberhentian.pathSkPreview",
        tmt_pensiun: "siasn_pemberhentian.tmtPensiun",
      })
      .leftJoin(
        "siasn_pemberhentian",
        "sync_pegawai.nip_master",
        "siasn_pemberhentian.nipBaru"
      )
      .where("sync_pegawai.skpd_id", "ilike", `${skpd_id}%`)
      .where("siasn_pemberhentian.tmtPensiun", `${tmtPensiun}`)
      .orderBy("sync_pegawai.skpd_id");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error?.message || "Internal Server Error",
    });
  }
};

module.exports = {
  daftarPemberhentianSIASN,
  syncPemberhentianSIASN,
  pemberhentianBerdasarkanPerangkatDaerah,
};
