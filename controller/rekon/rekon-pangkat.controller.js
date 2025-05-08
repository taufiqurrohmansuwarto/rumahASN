import { createRedisInstance } from "@/utils/redis";
import { cosineSimilarity } from "@/utils/utility";

const { DBSCAN } = require("density-clustering");
const Pegawai = require("@/models/sync-pegawai.model");
const KenaikanPangkat = require("@/models/siasn-kp.model");
const {
  handleError,
  checkOpdEntrian,
} = require("@/utils/helper/controller-helper");

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const dayjs = require("dayjs");

async function getKpWithPegawai({
  search = "",
  skpd_id = "%",
  tmtKp = "", // Filter tambahan untuk tmtKp
  page = 1,
  perPage = 10,
  sortBy = "nama_master", // Default sorting berdasarkan nama_master
  sortOrder = "ascend", // Default sorting order
} = {}) {
  try {
    const knex = KenaikanPangkat.knex();

    // Pastikan sortOrder hanya "asc" atau "desc" untuk keamanan query
    const validSortOrder =
      sortOrder.toLowerCase() === "descend" ? "desc" : "asc";

    // Pastikan sortBy adalah kolom yang valid agar tidak ada SQL Injection
    const validColumns = [
      "nip_master",
      "nama_master",
      "opd_master",
      "jabatan_master",
      "statusUsulanNama",
      "no_pertek",
      "no_sk",
      "tgl_pertek",
      "tgl_sk",
      "tmtKp",
      "jenis_kp",
      "alasan_tolak_tambahan",
    ];
    const sortColumn = validColumns.includes(sortBy) ? sortBy : "nama_master";

    // Query utama dengan filter
    const query = knex("siasn_kp as kp")
      .leftJoin("sync_pegawai as peg", "kp.nipBaru", "peg.nip_master")
      .select(
        "peg.nip_master",
        "peg.nama_master",
        "peg.opd_master",
        "peg.jabatan_master",
        "peg.foto as foto_master", // Tambahkan foto dari sync_pegawai
        "kp.statusUsulanNama",
        "kp.no_pertek",
        "kp.no_sk",
        "kp.path_ttd_sk",
        "kp.path_ttd_pertek",
        "kp.tgl_pertek",
        "kp.tgl_sk",
        "kp.tmtKp",
        "kp.path_preview_sk",
        "kp.jenis_kp",
        "kp.alasan_tolak_tambahan"
      )
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Filter tmtKp jika diberikan
    if (tmtKp) {
      query.andWhere("kp.tmtKp", "=", tmtKp);
    }

    // Filter pencarian nama atau NIP
    if (search) {
      query.andWhere((builder) => {
        builder
          .where("peg.nama_master", "ilike", `%${search}%`)
          .orWhere("peg.nip_master", "ilike", `%${search}%`);
      });
    }

    // Sorting
    query.orderBy(sortColumn, validSortOrder);

    // Pagination
    const result = await query.limit(perPage).offset((page - 1) * perPage);

    // Query total data tanpa pagination
    const totalDataQuery = knex("siasn_kp as kp")
      .leftJoin("sync_pegawai as peg", "kp.nipBaru", "peg.nip_master")
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Terapkan filter yang sama ke totalDataQuery
    if (tmtKp) {
      totalDataQuery.andWhere("kp.tmtKp", "=", tmtKp);
    }
    if (search) {
      totalDataQuery.andWhere((builder) => {
        builder
          .where("peg.nama_master", "ilike", `%${search}%`)
          .orWhere("peg.nip_master", "ilike", `%${search}%`);
      });
    }

    // Pastikan query total count dieksekusi
    const totalCount = await totalDataQuery.count("* as total").first();

    return {
      data: result,
      filters: {
        search,
        skpd_id,
        tmtKp,
      },
      sorting: {
        sortBy,
        sortOrder: validSortOrder,
      },
      page,
      perPage,
      totalData: totalCount?.total || 0,
      totalPages: Math.ceil((totalCount?.total || 0) / perPage),
    };
  } catch (error) {
    console.error("Error fetching KP data:", error);
  }
}

async function getStatusUsulanCount(tmtKp = "01-04-2025", opdId = "1") {
  try {
    const knex = Pegawai.knex();

    // Query utama untuk mengambil data berdasarkan unor
    const result = await knex("sync_unor_master as unor")
      .leftJoin("sync_pegawai as peg", function () {
        this.on("peg.skpd_id", "ilike", knex.raw("unor.id || '%'"));
      })
      .leftJoin("siasn_kp as kp", "kp.nipBaru", "peg.nip_master")
      .select(
        "unor.id as id_unor",
        "unor.name as nama_unor",
        knex.raw('COALESCE(COUNT(kp."statusUsulanNama"), 0) AS jumlah_usulan'),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN kp.\"statusUsulan\" = '22' THEN 1 END), 0) AS jumlah_ttd_pertek"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN kp.\"statusUsulan\" = '32' THEN 1 END), 0) AS jumlah_sk_berhasil"
        )
      )
      .where("unor.pId", "=", opdId)
      .andWhere((builder) => {
        builder.where("kp.tmtKp", "=", tmtKp).orWhereNull("kp.tmtKp");
      })
      .groupBy("unor.id", "unor.name")
      .orderBy("jumlah_usulan", "desc");

    // Query untuk menghitung jumlah usulan keseluruhan
    const totalUsulan = await knex("siasn_kp as kp")
      .leftJoin("sync_pegawai as peg", "kp.nipBaru", "peg.nip_master")
      .leftJoin("sync_unor_master as unor", function () {
        this.on("peg.skpd_id", "ilike", knex.raw("unor.id || '%'"));
      })
      .where("unor.pId", "=", opdId)
      .andWhere((builder) => {
        builder.where("kp.tmtKp", "=", tmtKp).orWhereNull("kp.tmtKp");
      })
      .count("kp.statusUsulanNama as jumlah_usulan_keseluruhan")
      .first(); // Mengambil satu nilai total

    // Mengembalikan data dalam format yang diminta
    return {
      data: result,
      tmtKp: tmtKp,
      jumlah_usulan_keseluruhan: totalUsulan?.jumlah_usulan_keseluruhan || 0,
    };
  } catch (error) {
    console.error("Error fetching status usulan count:", error);
  }
}

export const getRekonPangkatJatim = async (req, res) => {
  try {
    const periode = req?.query?.periode || "01-04-2025";
    const redis = await createRedisInstance();
    const cacheKey = `rekon-pangkat-jatim-${periode}`;
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    } else {
      const result = await getStatusUsulanCount(periode);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
      res.json(result);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getRekonPangkatByPegawai = async (req, res) => {
  try {
    const { organization_id, current_role } = req?.user;
    let opdId;

    if (current_role === "admin") {
      opdId = "1";
    } else {
      opdId = organization_id;
    }

    const {
      skpd_id = opdId,
      page = 1,
      perPage = 10,
      search = "",
      sort = "nama_master",
      order = "ascend",
      tmtKp = "01-04-2025",
    } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      return res.status(400).json({
        message: "OPD tidak ditemukan",
      });
    } else {
      const result = await getKpWithPegawai({
        skpd_id,
        page,
        perPage,
        search,
        sortBy: sort,
        sortOrder: order,
        tmtKp,
      });

      return res.json(result);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const ringkasAlasanTolak = async (req, res) => {
  try {
    const defaultTmtKp = "01-06-2025";
    const { organization_id, current_role } = req?.user;
    let opdId = current_role === "admin" ? "1" : organization_id;
    const { skpd_id = opdId, tmtKp = defaultTmtKp } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);
    if (!checkOpd) {
      return res.status(400).json({ message: "OPD tidak ditemukan" });
    }

    const knex = KenaikanPangkat.knex();
    const result = await knex("siasn_kp as kp")
      .leftJoin("sync_pegawai as peg", "kp.nipBaru", "peg.nip_master")
      .where("peg.skpd_id", "ilike", `${skpd_id}%`)
      .andWhere("kp.tmtKp", "=", tmtKp)
      .whereNotNull("kp.alasan_tolak_tambahan")
      .where("kp.alasan_tolak_tambahan", "!=", "")
      .select("kp.alasan_tolak_tambahan")
      .groupBy("kp.alasan_tolak_tambahan");

    const items = result?.map((item) => item.alasan_tolak_tambahan);

    const alasanList = items
      .filter((x) => typeof x === "string" && x.trim() !== "")
      .map((x) => x.replace(/\r?\n/g, "").trim());

    // Jika tidak ada alasan tolak, kembalikan array kosong
    if (alasanList.length === 0) {
      return res.json([]);
    }

    // Get embedding from OpenAI
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: alasanList,
    });

    const embeddings = embeddingRes.data.map((d) => d.embedding);

    // Clustering dengan DBSCAN
    const distanceMatrix = (a, b) => 1 - cosineSimilarity(a, b);
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(embeddings, 0.15, 2, distanceMatrix); // eps, minPts

    // Ringkasan per cluster
    // Step 3: Ringkasan per grup
    const hasil = [];
    for (const group of clusters) {
      const alasanCluster = group.map((idx) => alasanList[idx]);

      // Prompt untuk label kategori
      const labelPrompt = `Berikut adalah daftar alasan penolakan:
${alasanCluster
  .map((x, i) => `${i + 1}. ${x}`)
  .join(
    "\n"
  )}\n\nBeri satu label pendek yang mewakili topik umum dari daftar ini (misalnya: (PAK (Penilaian Angka Kredit), Pertek Wasdal, Ujikom, Jabatan, Unit Kerja, SKP (Sasaran Kinerja Pegawai))). Jawaban hanya satu kata atau frasa pendek.`;

      const labelRes = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: labelPrompt }],
        temperature: 0,
      });

      const label = labelRes.choices[0].message.content.trim();

      const prompt = `Berikut adalah sejumlah alasan penolakan usulan kenaikan pangkat:\n\n${alasanCluster
        .map((x, i) => `${i + 1}. ${x}`)
        .join(
          "\n"
        )}\n\nBuat ringkasan dalam dua kalimat yang menjelaskan inti permasalahan. Tambahkan satu saran umum. Gunakan bahasa administratif dan jangan ulang alasan secara mentah.`;

      const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const rekomendasi = {
        kategori: label,
        alasan: alasanCluster,
        ringkasan: res.choices[0].message.content.trim(),
      };

      hasil.push(rekomendasi);
    }
    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};
