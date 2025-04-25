const {
  handleError,
  checkOpdEntrian,
} = require("@/utils/helper/controller-helper");
const dayjs = require("dayjs");
const { proxyLayananRekapPG } = require("@/utils/siasn-proxy.utils");
const SiasnPg = require("@/models/siasn-pg.model");
const Pegawai = require("@/models/sync-pegawai.model");
const { createRedisInstance } = require("@/utils/redis");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(isSameOrBefore);

export const syncPencantumanGelar = async (req, res) => {
  try {
    const knex = SiasnPg.knex();
    const { fetcher } = req;
    const tanggalAwal = req?.query?.tanggalAwal || dayjs().format("YYYY-MM-DD");
    const tanggalAkhir =
      req?.query?.tanggalAkhir || dayjs().format("YYYY-MM-DD");

    // Jika tanggal awal dan akhir sama, gunakan satu periode saja
    if (tanggalAwal === tanggalAkhir) {
      const periode = tanggalAwal;

      const result = await proxyLayananRekapPG(fetcher, {
        periode,
      });

      const data = result?.data?.results;

      await knex
        .delete()
        .from("siasn_pg")
        .whereRaw("DATE(tgl_usulan) = ?", periode);

      await knex.batchInsert("siasn_pg", data);
    } else {
      // Jika tanggal berbeda, iterasi dari tanggal awal sampai tanggal akhir
      let currentDate = dayjs(tanggalAwal);
      const endDate = dayjs(tanggalAkhir);

      while (currentDate.isSameOrBefore(endDate)) {
        const periode = currentDate.format("YYYY-MM-DD");

        // Menambahkan jeda 1-3 detik untuk menghindari deteksi sebagai DDOS
        const delay = Math.floor(Math.random() * 2000) + 1000; // 1000-3000 ms
        await new Promise((resolve) => setTimeout(resolve, delay));

        const result = await proxyLayananRekapPG(fetcher, {
          periode,
        });

        const data = result?.data?.results;

        await knex
          .delete()
          .from("siasn_pg")
          .whereRaw("DATE(tgl_usulan) = ?", periode);

        if (data && data.length > 0) {
          await knex.batchInsert("siasn_pg", data);
        }

        currentDate = dayjs(currentDate).add(1, "day");
      }
    }

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

async function getPGWithPegawai({
  search = "",
  skpd_id = "%",
  page = 1,
  perPage = 10,
  sortBy = "tgl_usulan", // Default sorting berdasarkan nama_master
  sortOrder = "desc", // Default sorting order
} = {}) {
  try {
    const knex = SiasnPg.knex();

    // Pastikan sortOrder hanya "asc" atau "desc" untuk keamanan query
    const validSortOrder =
      sortOrder.toLowerCase() === "descend" ? "desc" : "asc";

    // Pastikan sortBy adalah kolom yang valid agar tidak ada SQL Injection
    const validColumns = [
      "nip_master",
      "nama_master",
      "opd_master",
      "jabatan_master",
      "status_usulan_nama",
      "alasan_tolak_tambahan",
      "alasan_tolak_nama",
      "tgl_usulan",
      "dokumen_usulan",
    ];

    const sortColumn = validColumns.includes(sortBy) ? sortBy : "tgl_usulan";

    // Query utama dengan filter
    const query = knex("siasn_pg as pg")
      .leftJoin("sync_pegawai as peg", "pg.nip", "peg.nip_master")
      .select(
        "pg.id",
        "peg.nip_master",
        "peg.nama_master",
        "peg.opd_master",
        "peg.jabatan_master",
        "peg.foto as foto_master",
        "pg.status_usulan_nama",
        "pg.tgl_usulan",
        "pg.dokumen_usulan",
        "pg.alasan_tolak_tambahan",
        "pg.alasan_tolak_nama"
      )
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

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
    const totalDataQuery = knex("siasn_pg as pg")
      .leftJoin("sync_pegawai as peg", "pg.nip", "peg.nip_master")
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Terapkan filter yang sama ke totalDataQuery
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
    console.error("Error fetching PG data:", error);
  }
}

async function getStatusUsulanPGCount({
  opdId = "1",
  tgl_usulan = dayjs().format("DD-MM-YYYY"),
} = {}) {
  try {
    const knex = Pegawai.knex();

    // Konversi `tgl_usulan` ke format database (YYYY-MM-DD)
    const formattedDate = dayjs(tgl_usulan, "DD-MM-YYYY").format("YYYY-MM-DD");

    // Query utama: Ambil daftar semua `unor` dan jumlah usulan terkait
    const result = await knex("sync_unor_master as unor")
      .leftJoin("sync_pegawai as peg", function () {
        this.on("peg.skpd_id", "ilike", knex.raw("unor.id || '%'"));
      })
      .leftJoin("siasn_pg as pg", "pg.nip", "peg.nip_master")
      .select(
        "unor.id as id_unor",
        "unor.name as nama_unor",
        knex.raw("COALESCE(COUNT(pg.id), 0) AS jumlah_usulan"),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN pg.status_usulan = '12' THEN 1 END), 0) AS terima_usulan"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN pg.status_usulan = '2' THEN 1 END), 0) AS terverifikasi_di_instansi"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN pg.status_usulan = '1' THEN 1 END), 0) AS input_berkas"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN pg.status_usulan = '6' THEN 1 END), 0) AS ditolak_instansi"
        ),
        knex.raw(
          "COALESCE(COUNT(CASE WHEN pg.status_usulan = '11' THEN 1 END), 0) AS profil_pns_telah_diperbarui"
        )
      )
      .where("unor.pId", "=", opdId) // Filter berdasarkan opdId
      .andWhere((builder) => {
        builder
          .whereRaw("DATE(pg.tgl_usulan) = ?", [formattedDate])
          .orWhereNull("pg.tgl_usulan"); // Pastikan tetap menampilkan `unor` tanpa usulan
      })
      .groupBy("unor.id", "unor.name")
      .orderBy("jumlah_usulan", "desc");

    // Menyusun hasil berdasarkan tanggal
    const data = result.map((item) => ({
      id_unor: item.id_unor,
      nama_unor: item.nama_unor,
      jumlah_usulan: item.jumlah_usulan,
      terima_usulan: item.terima_usulan,
      terverifikasi_di_instansi: item.terverifikasi_di_instansi,
      input_berkas: item.input_berkas,
      ditolak_instansi: item.ditolak_instansi,
      profil_pns_telah_diperbarui: item.profil_pns_telah_diperbarui,
    }));

    return {
      data, // Array dari unit organisasi (`unor`) dengan jumlah usulan
      tgl_usulan, // Tetap dalam format string (DD-MM-YYYY)
    };
  } catch (error) {
    console.error("Error fetching status usulan PG count:", error);
    throw error;
  }
}

export const getRekonPGJatim = async (req, res) => {
  try {
    const { tgl_usulan } = req?.query;
    const result = await getStatusUsulanPGCount({ tgl_usulan });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getRekonPGByPegawai = async (req, res) => {
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
      sort = "tgl_usulan",
      order = "ascend",
    } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      return res.status(400).json({
        message: "OPD tidak ditemukan",
      });
    } else {
      const result = await getPGWithPegawai({
        skpd_id,
        page,
        perPage,
        search,
        sortBy: sort,
        sortOrder: order,
      });

      return res.json(result);
    }
  } catch (error) {
    handleError(res, error);
  }
};
