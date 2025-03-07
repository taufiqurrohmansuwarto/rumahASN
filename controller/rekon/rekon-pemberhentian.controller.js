const Pegawai = require("@/models/sync-pegawai.model");
const { handleError } = require("@/utils/helper/controller-helper");
const { createRedisInstance } = require("@/utils/redis");

async function getPemberhentianCount(tmtPensiun = "01-04-2025", opdId = "1") {
  try {
    const knex = Pegawai.knex();

    // Query utama untuk mendapatkan jumlah usulan pemberhentian per unit organisasi
    const result = await knex("sync_unor_master as unor")
      .leftJoin("sync_pegawai as peg", function () {
        this.on("peg.skpd_id", "ilike", knex.raw("unor.id || '%'"));
      })
      .leftJoin("siasn_pemberhentian as sp", "sp.nipBaru", "peg.nip_master")
      .select(
        "unor.id as id_unor",
        "unor.name as nama_unor",
        knex.raw('COALESCE(COUNT(sp."statusUsulanNama"), 0) AS jumlah_usulan'),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN sp.\"statusUsulan\" = '22' THEN 1 END), 0) AS jumlah_ttd_pertek"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN sp.\"statusUsulan\" = '32' THEN 1 END), 0) AS jumlah_sk_berhasil"
        )
      )
      .where("unor.pId", "=", opdId)
      .andWhere((builder) => {
        builder
          .where("sp.tmtPensiun", "=", tmtPensiun)
          .orWhereNull("sp.tmtPensiun");
      })
      .groupBy("unor.id", "unor.name")
      .orderBy("jumlah_usulan", "desc");

    // Query untuk menghitung total jumlah usulan pemberhentian keseluruhan
    const totalUsulan = await knex("siasn_pemberhentian as sp")
      .leftJoin("sync_pegawai as peg", "sp.nipBaru", "peg.nip_master")
      .leftJoin("sync_unor_master as unor", function () {
        this.on("peg.skpd_id", "ilike", knex.raw("unor.id || '%'"));
      })
      .where("unor.pId", "=", opdId)
      .andWhere((builder) => {
        builder
          .where("sp.tmtPensiun", "=", tmtPensiun)
          .orWhereNull("sp.tmtPensiun");
      })
      .count("sp.statusUsulanNama as jumlah_usulan_keseluruhan")
      .first(); // Mengambil satu nilai total

    // Format keluaran
    return {
      data: result,
      tmtPensiun: tmtPensiun,
      jumlah_usulan_keseluruhan: totalUsulan?.jumlah_usulan_keseluruhan || 0,
    };
  } catch (error) {
    console.error("Error fetching pemberhentian count:", error);
  }
}

export const getRekonPemberhentianJatim = async (req, res) => {
  try {
    const periode = req?.query?.periode || "01-04-2025";
    console.log(periode);
    const redis = await createRedisInstance();
    const cacheKey = `rekon-pemberhentian-jatim-${periode}`;
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    } else {
      const result = await getPemberhentianCount(periode);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 100);
      res.json(result);
    }
  } catch (error) {
    handleError(res, error);
  }
};
