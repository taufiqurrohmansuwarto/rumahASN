const SyncPegawai = require("@/models/sync-pegawai.model");
const {
  getOpdId,
  validateOpd,
  handleError,
  checkTotalPegawai,
} = require("@/utils/helper/controller-helper");

// Default pagination parameters
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

// Standard API response formatter
const formatApiResponse = (page, limit, total, data) => ({
  page,
  limit,
  total: total.total,
  data,
});

// Adds a name-based search filter if provided
const addSearchFilter = (search, query) => {
  if (search) {
    query.where("sync.nama_master", "ILIKE", `%${search}%`);
  }
};

// Builds the base data query
const createBaseQuery = (skpdId, conditionBuilder) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .select(
      "sync.nip_master",
      "sync.foto",
      "sync.nama_master",
      "sync.opd_master"
    )
    .innerJoin("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
    .andWhere(conditionBuilder)
    .orderBy("sync.nama_master", "asc");
};

// Builds the counting query
const createCountingQuery = (skpdId, conditionBuilder) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .innerJoin("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
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
    } = req.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    // Build condition with optional search filter
    const condition = function () {
      conditionBuilder.call(this);
      addSearchFilter(search, this);
    };

    // Prepare data and count queries
    const pageNum = Number(page);
    const lim = Number(limit);
    const queryBuilder = createBaseQuery(skpd_id, condition);
    if (lim !== -1) {
      queryBuilder.limit(lim).offset((pageNum - 1) * lim);
    }

    const [data, total] = await Promise.all([
      queryBuilder,
      createCountingQuery(skpd_id, condition),
    ]);

    return res.json(formatApiResponse(pageNum, lim, total, data));
  } catch (error) {
    handleError(res, error);
  }
};

// Specific condition builders
const cpnsCondition = function () {
  // More than one year since CPNS without appointment
  this.whereRaw(
    "DATE_PART('year', now()::date) - DATE_PART('year', siasn.tmt_cpns::date) > 1"
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
  // BUP still active for structural (1) & pelaksana (4)
  this.where(function () {
    this.whereIn("siasn.jenis_jabatan_id", ["1", "4"]).whereRaw(
      "siasn.tanggal_lahir::date <= NOW() - INTERVAL '58 years'"
    );
  }).orWhere(function () {
    // Fungsional (2): custom BUP age
    this.whereRaw("siasn.jenis_jabatan_id = '2'").whereRaw(
      "siasn.tanggal_lahir::date <= NOW() - (COALESCE(jft.bup_usia,0)|| ' years')::interval"
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

      const result = [
        {
          id: "cpns-lebih-dari-satu-tahun",
          label: "CPNS Lebih Dari Satu Tahun",
          value: cpns.total,
          totalPegawai,
          bobot: 13.64,
        },
        {
          id: "struktural-ganda",
          label: "Struktural Ganda",
          value: struktural.total,
          totalPegawai,
          bobot: 15.91,
        },
        {
          id: "bup-masih-aktif",
          label: "BUP Masih Aktif",
          value: bup.total,
          totalPegawai,
          bobot: 15.91,
        },
      ];

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  },
};
