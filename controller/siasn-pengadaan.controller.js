const {
  daftarPengadaanInstansi,
  daftarPengadaanDokumen,
  downloadDokumenAPI,
} = require("@/utils/siasn-utils");
const { z } = require("zod");
const archiver = require("archiver");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const SiasnPengadaan = require("@/models/siasn-pengadaan.model");
const SiasnPengadaanProxy = require("@/models/siasn-pengadaan-proxy.model");
const SiasnDownload = require("@/models/siasn-download.model");
const {
  uploadDokumenSiasnToMinio,
  uploadMinioWithFolder,
  downloadDokumenSK,
} = require("../utils");

const { upperCase, trim } = require("lodash");
const { handleError } = require("@/utils/helper/controller-helper");
const {
  proxyLayananRekapPengadaan,
  getFileAsn,
} = require("@/utils/siasn-proxy.utils");

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
      .leftJoin(
        knex.raw(`(
          SELECT 
            siasn_layanan_id,
            json_object_agg(type, nama_file) as download_status
          FROM siasn_download
          WHERE siasn_layanan = 'pengadaan'
          GROUP BY siasn_layanan_id
        ) as sd`),
        "sp.id",
        "sd.siasn_layanan_id"
      )
      .leftJoin(
        knex.raw(`(
          SELECT 
            siasn_layanan_id,
            nama_file as sk_diunduh
          FROM siasn_download
          WHERE siasn_layanan = 'pengadaan' AND type = 'sk'
        ) as sd_sk`),
        "sp.id",
        "sd_sk.siasn_layanan_id"
      )
      .leftJoin(
        knex.raw(`(
          SELECT 
            siasn_layanan_id,
            nama_file as pertek_diunduh
          FROM siasn_download
          WHERE siasn_layanan = 'pengadaan' AND type = 'pertek'
        ) as sd_pertek`),
        "sp.id",
        "sd_pertek.siasn_layanan_id"
      )
      .select(
        "sp.*",
        knex.raw(
          "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn"
        ),
        knex.raw(
          "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster"
        ),
        "ru.id_simaster as unor_simaster_id",
        "ru.id_siasn as unor_siasn_id",
        "rsu.id as status_usulan_id",
        "rsu.nama as status_usulan_nama",
        "sd.download_status",
        "sd_sk.sk_diunduh",
        "sd_pertek.pertek_diunduh"
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

const cekPertekByNomerPeserta = async (req, res) => {
  try {
    const knex = SiasnPengadaanProxy.knex();
    const { no_peserta, nip, ket_kelakuanbaik_nomor, tahun } = req?.body;

    // buat syarat untuk req?.body beserta format
    if (!no_peserta || !nip || !ket_kelakuanbaik_nomor || !tahun) {
      return res.status(400).json({
        message: "Data tidak boleh kosong",
      });
    }

    if (
      typeof no_peserta !== "string" ||
      typeof nip !== "string" ||
      typeof ket_kelakuanbaik_nomor !== "string" ||
      typeof tahun !== "string"
    ) {
      return res.status(400).json({
        message: "Data harus berupa string",
      });
    }

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
        "sp.id",
        "sp.nip",
        "sp.nama",
        "sp.path_ttd_pertek",
        "sp.jenis_formasi_nama",
        knex.raw("sp.usulan_data->'data'->>'no_peserta' as no_peserta"),
        knex.raw("sp.usulan_data->'data'->>'tempat_lahir' as tempat_lahir"),
        knex.raw("sp.usulan_data->'data'->>'tgl_lahir' as tgl_lahir"),
        knex.raw(
          "sp.usulan_data->'data'->>'pendidikan_ijazah_nama' as pendidikan_ijazah_nama"
        ),
        knex.raw(
          "sp.usulan_data->'data'->>'pendidikan_pertama_nama' as pendidikan_pertama_nama"
        ),
        knex.raw("sp.usulan_data->'data'->>'golongan_nama' as golongan_nama"),
        knex.raw(
          "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn"
        ),
        knex.raw(
          "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster"
        ),
        "rsu.id as status_usulan_id",
        "rsu.nama as status_usulan_nama"
      )
      .whereRaw("sp.usulan_data->'data'->>'no_peserta' = ?", [trim(no_peserta)])
      .andWhereRaw("sp.nip = ?", [nip])
      .andWhereRaw("sp.usulan_data->'data'->>'ket_kelakuanbaik_nomor' = ?", [
        trim(ket_kelakuanbaik_nomor),
      ])
      .limit(1);

    const result = await baseQuery;

    if (result?.length) {
      const url = result[0].path_ttd_pertek;

      const file = await getFileAsn(url);
      const fileBase64 = file.toString("base64");

      const data = {
        ...result[0],
        file: fileBase64,
      };

      res.json(data);
    } else {
      res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk upload dokumen ke Minio
async function uploadDokumenToMinio(mc, item) {
  try {
    const file = await getFileAsn(item.path);
    const fileBase64 = file.toString("base64");
    const result = await uploadMinioWithFolder(
      mc,
      `sk_pns/${item?.nama_file}`,
      fileBase64,
      "bkd"
    );
  } catch (error) {
    console.error(error);
  }
}

const downloadDokumenPengadaan = async (req, res) => {
  try {
    const { mc } = req;
    const querySchema = z.object({
      tahun: z.string().optional().default(dayjs().format("YYYY")),
      type: z.string().optional().default("pertek"),
    });

    try {
      const { tahun, type } = querySchema.parse(req.query);
      const knex = SiasnPengadaan.knex();

      // Ambil data pengadaan dari database
      const dataPengadaan = await fetchDataPengadaan(knex, tahun, type);

      if (!dataPengadaan?.length) {
        return res.json([]);
      }

      // Siapkan payload untuk upload
      const payload = preparePayloadForUpload(dataPengadaan, type);

      // Proses upload dokumen ke Minio satu persatu
      const hasilUpload = [];
      for (const item of payload) {
        try {
          await uploadDokumenToMinio(mc, item);
          console.log(`Berhasil mengupload dokumen: ${item.nama_file}`);

          await SiasnDownload.query().insert({
            siasn_layanan: "pengadaan",
            siasn_layanan_id: item.siasn_layanan_id,
            nama_file: item.nama_file,
            type: type,
          });

          hasilUpload.push({
            ...item,
            status: "success",
            message: "Berhasil diupload",
          });
        } catch (error) {
          console.error(`Gagal mengupload dokumen: ${item.nama_file}`, error);
          hasilUpload.push({
            ...item,
            status: "failed",
            message: "Gagal diupload",
          });
        }
      }

      res.json(hasilUpload);
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        return res.status(400).json({
          message: "Parameter tidak valid",
          errors: zodError.errors,
        });
      }
      throw zodError;
    }

    // Fungsi untuk mengambil data pengadaan
    function fetchDataPengadaan(knex, tahun, type) {
      return knex("siasn_pengadaan_proxy as sp")
        .select(
          "sp.id as siasn_layanan_id",
          "sp.nip as nip",
          type === "pertek"
            ? "sp.path_ttd_pertek as path_ttd_pertek"
            : "sp.path_ttd_sk as path_ttd_pertek",
          knex.raw("sp.usulan_data->'data'->>'tmt_cpns' as tmt")
        )
        .leftJoin("siasn_download as sd", function () {
          this.on("sp.id", "=", "sd.siasn_layanan_id")
            .andOn("sd.siasn_layanan", "=", knex.raw("'pengadaan'"))
            .andOn("sd.type", "=", knex.raw("?", [type]));
        })
        .whereNull("sd.id")
        .andWhere("sp.periode", tahun)
        .andWhereNot("sp.nip", "")
        .andWhere(function () {
          if (type === "pertek") {
            this.where("sp.path_ttd_pertek", "!=", "");
          } else if (type === "sk") {
            this.where("sp.path_ttd_sk", "!=", "");
          }
        });
    }

    // Fungsi untuk menyiapkan payload
    function preparePayloadForUpload(dataPengadaan, type) {
      return dataPengadaan.map((item) => ({
        siasn_layanan: "pengadaan",
        siasn_layanan_id: item.siasn_layanan_id,
        path: item.path_ttd_pertek,
        nama_file: `${type.toUpperCase()}_${dayjs(item.tmt).format(
          "DDMMYYYY"
        )}_${item.nip}.pdf`,
      }));
    }
  } catch (error) {
    handleError(res, error);
  }
};

const downloadAllDokumenPengadaan = async (req, res) => {
  try {
    // Ambil objek Minio client dan koneksi database
    const { mc } = req;
    const knex = SiasnPengadaan.knex();

    // Ambil parameter tahun dari query, default ke tahun sekarang
    const { tahun = dayjs().format("YYYY"), type = "pertek" } = req.query;

    // Ambil data dokumen pengadaan dari database
    // Join tabel siasn_download dengan siasn_pengadaan_proxy untuk mendapatkan informasi lengkap
    const data = await knex("siasn_download as sd")
      .select(
        "sp.id as siasn_layanan_id",
        "sp.nip",
        "sp.path_ttd_pertek",
        "sd.nama_file",
        knex.raw("sp.usulan_data->'data'->>'tmt_cpns' as tmt")
      )
      .join("siasn_pengadaan_proxy as sp", function () {
        this.on("sd.siasn_layanan_id", "=", "sp.id").andOn(
          "sd.siasn_layanan",
          "=",
          knex.raw("'pengadaan'")
        );
      })
      .where("sp.periode", tahun)
      .andWhere("sd.type", type);

    // Jika tidak ada data, kembalikan array kosong
    if (!data?.length) {
      return res.json([]);
    } else {
      // Buat arsip ZIP dengan kompresi level 9 (maksimum)
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Tangani peringatan dan error pada proses pembuatan arsip
      archive.on("warning", (err) => console.warn(err));
      archive.on("error", (err) =>
        res.status(500).send({ error: err.message })
      );

      // Atur header respons untuk download file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="dokumen_pengadaan_${tahun}.zip"`
      );
      res.setHeader("Content-Type", "application/zip");

      // Hubungkan arsip ke response stream
      archive.pipe(res);

      // Tambahkan setiap file ke dalam arsip
      for (const item of data) {
        try {
          const filename = `${item.nama_file}`;
          const stream = await downloadDokumenSK(mc, filename);
          archive.append(stream, { name: filename });
        } catch (err) {
          if (err.code === "NoSuchKey") {
            console.log(`${item.nama_file} tidak ditemukan, dilewati.`);
            continue;
          } else {
            console.error(`Gagal mengunduh ${item.nama_file}:`, err);
          }
        }
      }

      // Finalisasi arsip dan kirim ke client
      archive.finalize();
    }
  } catch (error) {
    handleError(res, error);
  }
};

const resetUploadDokumen = async (req, res) => {
  try {
    const { mc } = req;
    const {
      tahun = dayjs().format("YYYY"),
      id: usulanId,
      type = "pertek",
    } = req.query;

    if (!tahun || !usulanId) {
      return res.status(400).json({
        message: "Tahun dan ID usulan harus diisi",
      });
    }

    const knex = SiasnPengadaan.knex();

    const result = await knex("siasn_pengadaan_proxy as sp")
      .select(
        "sp.path_ttd_pertek as pertek",
        "sp.path_ttd_sk as sk",
        "sp.nip as nip",
        knex.raw("sp.usulan_data->'data'->>'tmt_cpns' as tmt")
      )
      .where("sp.periode", tahun)
      .where("sp.id", usulanId)
      .first();

    const fileName = `${type.toUpperCase()}_${dayjs(result.tmt).format(
      "DDMMYYYY"
    )}_${result.nip}.pdf`;

    if (!result) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    await knex("siasn_download")
      .where("siasn_layanan", "pengadaan")
      .andWhere("siasn_layanan_id", usulanId)
      .andWhere("type", type)
      .delete();

    const item = {
      nama_file: fileName,
      path: type === "pertek" ? result.pertek : result.sk,
    };

    if (type === "pertek") {
      await uploadDokumenToMinio(mc, item);
      await SiasnDownload.query().insert({
        siasn_layanan: "pengadaan",
        siasn_layanan_id: usulanId,
        nama_file: fileName,
        type: "pertek",
      });
      res.json({
        message: "Berhasil mereset dokumen pertek",
      });
    } else if (type === "sk") {
      await uploadDokumenToMinio(mc, item);
      await SiasnDownload.query().insert({
        siasn_layanan: "pengadaan",
        siasn_layanan_id: usulanId,
        nama_file: fileName,
        type: "sk",
      });
      res.json({
        message: "Berhasil mereset dokumen sk",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  resetUploadDokumen,
  downloadDokumenPengadaan,
  downloadAllDokumenPengadaan,
  listPengadaanInstansi,
  listPengadaanDokumen,
  downloadDokumen,
  downloadToMaster,
  syncPengadaan,
  dokumenPengadaan,
  proxyRekapPengadaan,
  syncPengadaanProxy,
  cekPertekByNomerPeserta,
};
