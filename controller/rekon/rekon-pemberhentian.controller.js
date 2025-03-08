const Pegawai = require("@/models/sync-pegawai.model");
const {
  handleError,
  checkOpdEntrian,
} = require("@/utils/helper/controller-helper");
const { createRedisInstance } = require("@/utils/redis");

async function getPemberhentianWithPegawai({
  search = "",
  skpd_id = "%",
  tmtPensiun = "", // Filter tambahan untuk TMT Pensiun
  page = 1,
  perPage = 10,
  sortBy = "nama_master", // Default sorting berdasarkan nama_master
  sortOrder = "descend", // Default sorting order
} = {}) {
  try {
    const knex = Pegawai.knex();

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
      "pathSk",
      "pathPertek",
      "detailLayananNama",
      "tmtPensiun",
      "pathSkPreview",
    ];
    const sortColumn = validColumns.includes(sortBy) ? sortBy : "nama_master";

    // Query utama dengan filter
    const query = knex("siasn_pemberhentian as sp")
      .leftJoin("sync_pegawai as peg", "sp.nipBaru", "peg.nip_master")
      .select(
        "peg.foto",
        "peg.nip_master",
        "peg.nama_master",
        "peg.opd_master",
        "peg.jabatan_master",
        "sp.statusUsulanNama",
        "sp.pathSk",
        "sp.pathPertek",
        "sp.detailLayananNama",
        "sp.tmtPensiun",
        "sp.pathSkPreview"
      )
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Filter tmtPensiun jika diberikan
    if (tmtPensiun) {
      query.andWhere("sp.tmtPensiun", "=", tmtPensiun);
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
    const totalDataQuery = knex("siasn_pemberhentian as sp")
      .leftJoin("sync_pegawai as peg", "sp.nipBaru", "peg.nip_master")
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Terapkan filter yang sama ke totalDataQuery
    if (tmtPensiun) {
      totalDataQuery.andWhere("sp.tmtPensiun", "=", tmtPensiun);
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
        tmtPensiun,
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
    console.error("Error fetching pemberhentian data:", error);
  }
}

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

export const getPemberhentianByPegawai = async (req, res) => {
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
      tmtPensiun = "01-04-2025",
    } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      return res.status(400).json({
        message: "OPD tidak ditemukan",
      });
    } else {
      const result = await getPemberhentianWithPegawai({
        skpd_id,
        page,
        perPage,
        search,
        sortBy: sort,
        sortOrder: order,
        tmtPensiun,
      });

      return res.json(result);
    }
  } catch (error) {
    handleError(res, error);
  }
};
