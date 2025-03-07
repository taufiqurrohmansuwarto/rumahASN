import { createRedisInstance } from "@/utils/redis";

const Pegawai = require("@/models/sync-pegawai.model");
const KenaikanPangkat = require("@/models/siasn-kp.model");
const { handleError } = require("@/utils/helper/controller-helper");
const dayjs = require("dayjs");

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
