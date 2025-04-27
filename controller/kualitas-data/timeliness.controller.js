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

// Adds a name-based search filter if provided
const addSearchFilter = (search, query, source) => {
  if (!search) return;
  if (source === DEFAULT_SOURCE) {
    query.where("sync.nama_master", "ILIKE", `%${search}%`);
  } else {
    query.where("siasn.nama", "ILIKE", `%${search}%`);
  }
};

/**
 * Builds the base data query.
 *
 * @param {string} skpdId - skpd filter prefix (ignored if source = 'siasn').
 * @param {function} conditionBuilder - Knex condition builder callback.
 * @param {string} source - 'simaster' (default) or 'siasn'.
 */
const createBaseQuery = (skpdId, conditionBuilder, source = DEFAULT_SOURCE) => {
  const knex = SyncPegawai.knex();

  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .select(
        "sync.nip_master",
        "sync.foto",
        "sync.nama_master",
        "sync.opd_master"
      )
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .andWhere(conditionBuilder)
      .orderBy("sync.nama_master", "asc");
  }

  return knex("siasn_employees as siasn")
    .select(
      "siasn.nip_baru as nip_master",
      "siasn.foto",
      "siasn.nama as nama_master",
      "siasn.opd_master"
    )
    .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .andWhere(conditionBuilder)
    .orderBy("siasn.nama", "asc");
};

/**
 * Builds the counting query.
 *
 * @param {string} skpdId - skpd filter prefix (ignored if source = 'siasn').
 * @param {function} conditionBuilder - Knex condition builder callback.
 * @param {string} source - 'simaster' (default) or 'siasn'.
 */
const createCountingQuery = (
  skpdId,
  conditionBuilder,
  source = DEFAULT_SOURCE
) => {
  const knex = SyncPegawai.knex();

  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .andWhere(conditionBuilder)
      .count("* as total")
      .first();
  }

  return knex("siasn_employees as siasn")
    .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .andWhere(conditionBuilder)
    .count("* as total")
    .first();
};

// Higher-order function to create list endpoints
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

    // Build condition with optional search filter
    const condition = function () {
      conditionBuilder.call(this);
      addSearchFilter(search, this, source);
    };

    // Prepare data and count queries
    const pageNum = Number(page);
    const lim = Number(limit);

    const dataQuery = createBaseQuery(skpd_id, condition, source);
    if (lim !== -1) dataQuery.limit(lim).offset((pageNum - 1) * lim);

    const [data, total] = await Promise.all([
      dataQuery,
      createCountingQuery(skpd_id, condition, source),
    ]);

    if (source === DEFAULT_SOURCE) {
      return res.json(formatApiResponse(pageNum, lim, total, data));
    }
    return res.json({ data, total: total.total });
  } catch (error) {
    handleError(res, error);
  }
};

// Specific condition builders
const cpnsCondition = function () {
  // More than one year + 1 month since CPNS without appointment
  this.whereRaw(
    "siasn.tmt_cpns::date <= NOW() - INTERVAL '1 year 1 month'"
  ).andWhere("status_cpns_pns", "C");
};

const strukturalCondition = function () {
  // Duplicate structural positions
  this.whereRaw("siasn.jenis_jabatan_id = '1'").whereExists(function () {
    this.select(1)
      .from("siasn_employees as se2")
      .whereRaw("siasn.unor_id = se2.unor_id")
      .whereRaw("siasn.nip_baru != se2.nip_baru")
      .whereRaw("se2.jenis_jabatan_id = '1'");
  });
};

const bupCondition = function () {
  // Structural (1) & Pelaksana (4): BUP = 58 tahun + 1 bulan
  this.where(function () {
    this.whereIn("siasn.jenis_jabatan_id", ["1", "4"]).whereRaw(
      "to_date(siasn.tanggal_lahir, 'DD-MM-YYYY') <= NOW() - INTERVAL '58 years 1 month'"
    );
  })
    // Fungsional (2): BUP = jft.bup_usia tahun + 1 bulan
    .orWhere(function () {
      this.whereRaw("siasn.jenis_jabatan_id = '2'").whereRaw(
        "to_date(siasn.tanggal_lahir, 'DD-MM-YYYY') <= NOW() - ((COALESCE(jft.bup_usia,0)|| ' years')::interval + INTERVAL '1 month')"
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
