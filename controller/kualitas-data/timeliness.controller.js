const SyncPegawai = require("@/models/sync-pegawai.model");

const {
  getOpdId,
  validateOpd,
  handleError,
} = require("@/utils/helper/controller-helper");

const formatApiResponse = (page, limit, total, result) => {
  return {
    page,
    limit,
    total: total.total,
    data: result,
  };
};

const addSearchFilter = (search, builder) => {
  if (search) {
    builder.where("sync.nama_master", "ILIKE", `%${search}%`);
  }
};

const createDataQuery = async (skpd_id, condition, limit, page) => {
  const knex = SyncPegawai.knex();
  const currentLimit = Number(limit);
  const offset = (page - 1) * currentLimit;
  let query;

  if (currentLimit === -1) {
    query = knex("sync_pegawai as sync")
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
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
      .andWhere(condition)
      .orderBy("sync.nama_master", "asc");
  } else {
    query = knex("sync_pegawai as sync")
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
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
      .andWhere(condition)
      .orderBy("sync.nama_master", "asc")
      .limit(currentLimit)
      .offset(offset);
  }

  console.log(query.toQuery());

  return query;
};

const createCountingQuery = (opdId, condition, countAlias) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .innerJoin("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .innerJoin("ref_siasn.jft as jft", "siasn.jabatan_id", "jft.id")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhere(condition)
    .count(`* as ${countAlias}`)
    .first();
};

export const unorTidakAktif = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const formasiJabatanFungsionalBelumDiangkat = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const cpnsLebihDariSatuTahun = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw(
          "DATE_PART('year', siasn.tmt_cpns::date) - DATE_PART('year', now()::date) > 1"
        ).andWhere("status_cpns_pns", "=", "C");
        addSearchFilter(search, this);
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw(
          "DATE_PART('year', siasn.tmt_cpns::date) - DATE_PART('year', now()::date) > 1"
        ).andWhere("status_cpns_pns", "=", "C");
        addSearchFilter(search, this);
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const strukturalGanda = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw("siasn.jenis_jabatan_id = '1'").whereExists(function () {
          this.select(1)
            .from("siasn_employees as se2")
            .whereRaw("siasn.unor_id = se2.unor_id")
            .whereRaw("siasn.nip_baru != se2.nip_baru")
            .whereRaw("se2.jenis_jabatan_id = '1'");
        });
        addSearchFilter(search, this);
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw("siasn.jenis_jabatan_id = '1'").whereExists(function () {
          this.select(1)
            .from("siasn_employees as se2")
            .whereRaw("siasn.unor_id = se2.unor_id")
            .whereRaw("siasn.nip_baru != se2.nip_baru")
            .whereRaw("se2.jenis_jabatan_id = '1'");
        });
        addSearchFilter(search, this);
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const bupMasihAktif = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.where(function () {
          // Struktural (1) & Pelaksana (4): BUP 58 tahun
          this.where(function () {
            this.whereIn("siasn.jenis_jabatan_id", ["1", "4"]).whereRaw(
              "siasn.tanggal_lahir::date <= NOW() - INTERVAL '58 years'"
            );
          })
            // Fungsional (2): BUP sesuai jft.bup_usia
            .orWhere(function () {
              this.whereRaw("siasn.jenis_jabatan_id = '2'").whereRaw(
                "siasn.tanggal_lahir::date <= NOW() - (COALESCE(jft.bup_usia, 0) || ' years')::interval"
              );
            });
        });

        addSearchFilter(search, this);
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.where(function () {
          // Struktural (1) & Pelaksana (4): BUP 58 tahun
          this.where(function () {
            this.whereIn("siasn.jenis_jabatan_id", ["1", "4"]).whereRaw(
              "siasn.tanggal_lahir::date <= NOW() - INTERVAL '58 years'"
            );
          })
            // Fungsional (2): BUP sesuai jft.bup_usia
            .orWhere(function () {
              this.whereRaw("siasn.jenis_jabatan_id = '2'").whereRaw(
                "siasn.tanggal_lahir::date <= NOW() - (COALESCE(jft.bup_usia, 0) || ' years')::interval"
              );
            });
        });

        addSearchFilter(search, this);
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const cltnSetelahTanggalBerakhir = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
