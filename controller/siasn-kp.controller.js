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
    const limit = parseInt(req?.query?.limit) || 100;
    let offset = parseInt(req?.query?.offset) || 0;

    const knex = SiasnKP.knex();
    let totalDataInserted = 0;
    let isFirstIteration = true;
    const maxIterations = 1000; // Batas maksimum iterasi untuk mencegah infinite loop
    let currentIteration = 0;

    while (currentIteration < maxIterations) {
      currentIteration++;

      const result = await daftarKenaikanPangkat(
        request,
        myPeriode,
        limit,
        offset
      );
      const data = result?.data;

      // Jika data tidak ditemukan pada iterasi pertama, kembalikan pesan
      if (!data || data?.count === 0) {
        if (isFirstIteration) {
          return res.json({ success: true, message: "Data tidak ditemukan" });
        }
        break;
      }

      // Pada iterasi pertama, hapus data yang sudah ada berdasarkan periode
      if (isFirstIteration) {
        await knex.delete().from("siasn_kp").where("tmtKp", periode);
        isFirstIteration = false;
      }

      // Validasi data sebelum insert
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        break;
      }

      // Lakukan penyisipan batch data ke database
      await knex.batchInsert("siasn_kp", data.data);
      totalDataInserted += data.data.length;

      // Jika data yang diterima kurang dari limit, berarti sudah mencapai akhir
      if (data.data.length < limit) {
        break;
      }

      // Update offset untuk iterasi berikutnya
      offset += limit;
    }

    const message = `Data berhasil disinkronisasi. Total data yang disinkronisasi: ${totalDataInserted}`;
    console.log(message);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || "Internal Server Error";
    res.status(400).json({
      message: errorMessage,
    });
  }
};

const listKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { page = 1, limit = 10 } = req?.query;
    const myPeriode = req?.query?.periode?.split("-").reverse().join("-");
    const periode = req?.query?.periode;

    const hasil = await SiasnKP.query()
      .where("tmtKp", periode)
      .orderBy("nama", "asc")
      .withGraphFetched("pegawai(simpleSelect)")
      .page(parseInt(page) - 1, parseInt(limit));

    if (hasil?.results?.length) {
      const data = {
        data: hasil?.results,
        total: hasil?.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      res.json(data);
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
      formData.append("tgl_sk", tgl_sk);
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
