const SyncPegawai = require("@/models/sync-pegawai.model");
const {
  getOpdId,
  validateOpd,
  handleError,
  checkTotalPegawai,
} = require("@/utils/helper/controller-helper");

// Default pagination and source parameters
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_SOURCE = "simaster";

// Standard API response formatter
const formatApiResponse = (page, limit, total, data) => ({
  page,
  limit,
  total: total.total,
  data,
});

/**
 * Bangun query data dengan subquery (simaster) atau join langsung (siasn)
 */
const createBaseQuery = (
  skpdId,
  conditionBuilder,
  search = "",
  source = DEFAULT_SOURCE
) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    const main = knex("sync_pegawai as sync")
      .select(
        "sync.nip_master",
        "sync.nama_master",
        "sync.foto",
        "sync.opd_master"
      )
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`]);

    // subquery: filter berdasar conditionBuilder pada siasn_employees
    const query = main
      .whereIn("sync.nip_master", function () {
        this.select("nip_baru")
          .from("siasn_employees as siasn")
          .leftJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
          .where(function () {
            conditionBuilder.call(this);
          });
      })
      .orderBy("sync.nama_master", "asc");

    return query;
  }

  // mode langsung pada siasn_employees
  const query = knex("siasn_employees as siasn")
    .select(
      "siasn.nip_baru as nip_master",
      "siasn.nama as nama_master",
      "siasn.foto",
      "siasn.opd_master",
      "siasn.email",
      "siasn.nomor_hp"
    )
    .leftJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .andWhere(function () {
      conditionBuilder.call(this);
    })
    .orderBy("siasn.nama", "asc");

  return query;
};

/**
 * Bangun query hitung total dengan subquery (simaster) atau langsung (siasn)
 */
const createCountingQuery = (
  skpdId,
  conditionBuilder,
  source = DEFAULT_SOURCE
) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .count("* as total")
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .whereIn("sync.nip_master", function () {
        this.select("nip_baru")
          .from("siasn_employees as siasn")
          .leftJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
          .where(function () {
            conditionBuilder.call(this);
          });
      })
      .first();
  }

  return knex("siasn_employees as siasn")
    .count("* as total")
    .leftJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .where(function () {
      conditionBuilder.call(this);
    })
    .first();
};
/**
 * HOF untuk list-based endpoints
 */
const listController = (conditionBuilder) => async (req, res) => {
  try {
    const opdId = getOpdId(req.user);
    const {
      skpd_id = opdId,
      search = "",
      limit = DEFAULT_LIMIT,
      page = DEFAULT_PAGE,
      source = DEFAULT_SOURCE,
    } = req.query;

    if (source === DEFAULT_SOURCE && !validateOpd(res, opdId, skpd_id)) return;

    // build kondisi + search
    const condition = function () {
      conditionBuilder.call(this);
    };

    const pageNum = Number(page);
    const lim = Number(limit);

    // data dan total
    const dataQuery = createBaseQuery(skpd_id, condition, source);
    if (lim !== -1) dataQuery.limit(lim).offset((pageNum - 1) * lim);

    const [data, total] = await Promise.all([
      dataQuery,
      createCountingQuery(skpd_id, condition, source),
    ]);

    // kirim response
    if (source === DEFAULT_SOURCE) {
      return res.json(formatApiResponse(pageNum, lim, total, data));
    } else {
      return res.json({ total: total.total, data });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// Specific condition builders
const cpnsCondition = function () {
  // More than one year + 1 month since CPNS without appointment
  this.whereRaw(
    "to_date(siasn.tmt_cpns, 'DD-MM-YYYY') <= CURRENT_DATE - INTERVAL '1 year 1 month'"
  ).andWhere("status_cpns_pns", "C");
};

const strukturalCondition = function () {
  // pertama: filter yang struktural saja
  this.where("siasn.jenis_jabatan_id", "1");

  // kemudian: hanya ambil jika ada “saudara” lain di unor yang sama
  this.whereExists(function () {
    this.select(1)
      .from("siasn_employees as se2")
      // cocokkan kolom unor_id
      .whereColumn("se2.unor_id", "siasn.unor_id")
      // pastikan juga struktural
      .andWhere("se2.jenis_jabatan_id", "1")
      // pastikan bukan baris yang sama
      .andWhereColumn("se2.nip_baru", "<>", "siasn.nip_baru");
  });
};

const bupCondition = function () {
  // Structural (1) & Pelaksana (4): BUP = 58 tahun + 1 bulan
  this.where(function () {
    this.whereIn("siasn.jenis_jabatan_id", ["1", "4"]).whereRaw(
      "to_date(siasn.tanggal_lahir, 'DD-MM-YYYY') <= CURRENT_DATE  - INTERVAL '58 years 1 month'"
    );
  })
    // Fungsional (2): BUP = jft.bup_usia tahun + 1 bulan
    .orWhere(function () {
      this.whereRaw("siasn.jenis_jabatan_id = '2'").whereRaw(
        "to_date(siasn.tanggal_lahir, 'DD-MM-YYYY') <= CURRENT_DATE - ((COALESCE(jft.bup_usia,0)|| ' years')::interval + INTERVAL '1 month')"
      );
    });
};

// Exported controllers
module.exports = {
  unorTidakAktif: async (req, res) => {
    try {
      // TODO: Implementasi nanti
    } catch (error) {
      handleError(res, error);
    }
  },

  formasiJabatanFungsionalBelumDiangkat: async (req, res) => {
    try {
      // TODO: Implementasi nanti
    } catch (error) {
      handleError(res, error);
    }
  },

  cpnsLebihDariSatuTahun: listController(cpnsCondition),
  strukturalGanda: listController(strukturalCondition),
  bupMasihAktif: listController(bupCondition),

  cltnSetelahTanggalBerakhir: async (req, res) => {
    try {
      // TODO: Implementasi nanti
    } catch (error) {
      handleError(res, error);
    }
  },

  dashboardTimeliness: async (req, res) => {
    try {
      const opdId = getOpdId(req.user);
      const { skpd_id = opdId } = req.query;

      if (!validateOpd(res, opdId, skpd_id)) return;

      const totalPegawai = await checkTotalPegawai(SyncPegawai.knex(), skpd_id);

      const [cpns, struktural, bup] = await Promise.all([
        createCountingQuery(skpd_id, cpnsCondition),
        createCountingQuery(skpd_id, strukturalCondition),
        createCountingQuery(skpd_id, bupCondition),
      ]);

      const [cpnsSiasn, strukturalSiasn, bupSiasn] = await Promise.all([
        createCountingQuery(skpd_id, cpnsCondition, "siasn"),
        createCountingQuery(skpd_id, strukturalCondition, "siasn"),
        createCountingQuery(skpd_id, bupCondition, "siasn"),
      ]);

      const result = [
        {
          id: "cpns-lebih-dari-satu-tahun",
          label: "CPNS Lebih Dari Satu Tahun",
          value: cpns.total,
          siasn: cpnsSiasn.total,
          totalPegawai,
          bobot: 10,
        },
        {
          id: "struktural-ganda",
          label: "Struktural Ganda",
          value: struktural.total,
          siasn: strukturalSiasn.total,
          totalPegawai,
          bobot: 15,
        },
        {
          id: "bup-masih-aktif",
          label: "BUP Masih Aktif",
          value: bup.total,
          siasn: bupSiasn.total,
          totalPegawai,
          bobot: 20,
        },
      ];

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  },
};
