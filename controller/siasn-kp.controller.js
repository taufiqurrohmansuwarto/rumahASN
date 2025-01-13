const { daftarKenaikanPangkat, uploadFileKP } = require("@/utils/siasn-utils");
const FormData = require("form-data");
const { createLogSIASN } = require("@/utils/logs");
const SiasnKP = require("@/models/siasn-kp.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

const dayjs = require("dayjs");
require("dayjs/locale/id");

const relativeTime = require("dayjs/plugin/relativeTime");
const { raw } = require("objection");
dayjs.locale("id");
dayjs.extend(relativeTime);

const syncKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const myPeriode = req?.query?.periode?.split("-").reverse().join("-");
    const periode = req?.query?.periode;

    const knex = await SiasnKP.knex();
    const result = await daftarKenaikanPangkat(request, myPeriode);
    const data = result?.data;

    if (data?.count === 0) {
      res.json({ success: true, message: "Data tidak ditemukan" });
    } else if (data?.count !== 0) {
      // langsung hapus dan insert tmtKp dengan format DD-MM-YYYY
      await knex.delete().from("siasn_kp").where("tmtKp", periode);
      await knex.batchInsert("siasn_kp", data?.data);
      res.json({ success: true, message: "Data berhasil disinkronisasi" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

const listKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const myPeriode = req?.query?.periode?.split("-").reverse().join("-");
    const periode = req?.query?.periode;

    const hasil = await SiasnKP.query().where("tmtKp", periode);

    if (hasil?.length) {
      res.json(hasil);
    } else {
      const result = await daftarKenaikanPangkat(request, myPeriode);

      const data = result?.data;

      let jsonData = [];

      if (data?.count === 0) {
        jsonData = [];
      } else if (data?.count !== 0) {
        // langsung hapus dan insert
        jsonData = data?.data;
      }

      res.json(jsonData);
    }
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

const kpBerdasarkanPerangkatDaerah = async (req, res) => {
  try {
    const { skpd_id, tmtKp } = req?.query;

    const subquery = await SiasnKP.query()
      .select(raw('COUNT(DISTINCT "statusUsulanNama") as total_status'))
      .where("tmtKp", tmtKp)
      .as("status_count");

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
        statusUsulan: "siasn_kp.statusUsulan",
        statusUsulanNama: "siasn_kp.statusUsulanNama",
        no_pertek: "siasn_kp.no_pertek",
        no_sk: "siasn_kp.no_sk",
        path_ttd_sk: "siasn_kp.path_ttd_sk",
        path_ttd_pertek: "siasn_kp.path_ttd_pertek",
        tgl_pertek: "siasn_kp.tgl_pertek",
        tgl_sk: "siasn_kp.tgl_sk",
        golonganBaruId: "siasn_kp.golonganBaruId",
        tmtKp: "siasn_kp.tmtKp",
        path_preview_sk: "siasn_kp.path_preview_sk",
        gaji_pokok_baru: "siasn_kp.gaji_pokok_baru",
        gaji_pokok_lama: "siasn_kp.gaji_pokok_lama",
        masa_kerja_tahun: "siasn_kp.masa_kerja_tahun",
        masa_kerja_bulan: "siasn_kp.masa_kerja_bulan",
        jenis_kp: "siasn_kp.jenis_kp",
        jenis_prosedur: "siasn_kp.jenis_prosedur",
      })
      .leftJoin("siasn_kp", "sync_pegawai.nip_master", "siasn_kp.nipBaru")
      .where("sync_pegawai.skpd_id", "ilike", `${skpd_id}%`)
      .where("siasn_kp.tmtKp", `${tmtKp}`)
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
  listKenaikanPangkat,
  uploadDokumenKenaikanPangkat,
  syncKenaikanPangkat,
  kpBerdasarkanPerangkatDaerah,
};
