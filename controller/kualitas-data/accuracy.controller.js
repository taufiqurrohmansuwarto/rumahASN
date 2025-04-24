import {
  getOpdId,
  handleError,
  validateOpd,
} from "@/utils/helper/controller-helper";

const SyncPegawai = require("@/models/sync-pegawai.model");

const createDataQuery = async (skpd_id, condition, limit, page) => {
  const knex = SyncPegawai.knex();
  const currentLimit = Number(limit);
  const offset = (page - 1) * currentLimit;

  const query = knex("sync_pegawai as sync")
    .select(
      "sync.nip_master",
      "sync.nama_master",
      "siasn.email",
      "siasn.nomor_hp"
    )
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
    .andWhere(condition)
    .orderBy("sync.nama_master", "asc")
    .limit(currentLimit)
    .offset(offset);

  return query;
};

const createCountingQuery = async (skpd_id, condition, countAlias) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
    .andWhere(condition)
    .count(`* as ${countAlias}`)
    .first();
};

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

const countingTmtCpnsLebihBesarDariTMTPNS = async (opdId) => {
  const knex = SyncPegawai.knex();
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw("DATE(siasn.tmt_cpns) > DATE(siasn.tmt_pns)")
        .andWhere("siasn.status_cpns_pns", "!=", "C")
        .andWhere("siasn.kedudukan_hukum_id", "!=", "71");
    },
    "total"
  );
};

const countingJenisPegawaiDPKTidakSesuai = async (opdId) => {
  const knex = SyncPegawai.knex();
  return createCountingQuery(
    opdId,
    function () {
      this.where("siasn.jenis_pegawai_id", "!=", "10");
    },
    "total"
  );
};

const countingMasaKerjaKurangDari2TahunStruktural = async (opdId) => {
  const knex = SyncPegawai.knex();
  return createCountingQuery(
    opdId,
    function () {
      this.where("siasn.jenis_jabatan_id", "=", "1").andWhere(
        knex.raw("CAST(siasn.mk_tahun AS INTEGER)"),
        "<",
        2
      );
    },
    "total"
  );
};

const countingNikBelumValid = async (opdId) => {
  const knex = SyncPegawai.knex();
  return createCountingQuery(
    opdId,
    function () {
      this.where(knex.raw("cast(siasn.is_valid_nik as boolean)"), "=", false);
    },
    "total"
  );
};

export const dashboardAccuracy = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await Promise.all([
      countingTmtCpnsLebihBesarDariTMTPNS(skpd_id),
      countingJenisPegawaiDPKTidakSesuai(skpd_id),
      countingMasaKerjaKurangDari2TahunStruktural(skpd_id),
      countingNikBelumValid(skpd_id),
    ]);

    const data = {
      tmt_cpns_lebih_besar_dari_tmt_pns: result[0].total,
      jenis_pegawai_dpk_tidak_sesuai: result[1].total,
      masa_kerja_kurang_dari_2_tahun_struktural: result[2].total,
      nik_belum_valid: result[3].total,
    };

    const hasil = [
      {
        id: "tmt_cpns_lebih_besar_dari_tmt_pns",
        label: "TMT CPNS Lebih Besar Dari TMT PNS",
        value: data.tmt_cpns_lebih_besar_dari_tmt_pns,
        bobot: 9.52,
      },
      {
        id: "jenis_pegawai_dpk_tidak_sesuai",
        label: "Jenis Pegawai DPK Tidak Sesuai",
        value: data.jenis_pegawai_dpk_tidak_sesuai,
        bobot: 21.43,
      },
      {
        id: "masa_kerja_kurang_dari_2_tahun_struktural",
        label: "Masa Kerja Kurang Dari 2 Tahun Struktural",
        value: data.masa_kerja_kurang_dari_2_tahun_struktural,
        bobot: 7.14,
      },
      {
        id: "nik_belum_valid",
        label: "NIK Belum Valid",
        value: data.nik_belum_valid,
        bobot: 4.76,
      },
    ];

    return res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const tmtCpnsLebihBesarDariTMTPNS = async (req, res) => {
  try {
    const knex = SyncPegawai.knex();
    const opdId = getOpdId(req?.user);

    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const tmtCpnsLebihBesarDariTMTPNSCondition = function () {
      this.whereRaw("DATE(siasn.tmt_cpns) > DATE(siasn.tmt_pns)")
        .andWhere("siasn.status_cpns_pns", "!=", "C")
        .andWhere("siasn.kedudukan_hukum_id", "!=", "71");
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      tmtCpnsLebihBesarDariTMTPNSCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      tmtCpnsLebihBesarDariTMTPNSCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const jenisPegawaiDPKTidakSesuai = async (req, res) => {
  try {
    const knex = SyncPegawai.knex();
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const jenisPegawaiDPKTidakSesuaiCondition = function () {
      this.where("siasn.jenis_pegawai_id", "!=", "10");
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      jenisPegawaiDPKTidakSesuaiCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      jenisPegawaiDPKTidakSesuaiCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const masaKerjaKurangDari2TahunStruktural = async (req, res) => {
  try {
    const knex = SyncPegawai.knex();
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const masaKerjaKurangDari2TahunStrukturalCondition = function () {
      this.where("siasn.jenis_jabatan_id", "=", "1").andWhere(
        knex.raw("CAST(siasn.mk_tahun AS INTEGER)"),
        "<",
        2
      );
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      masaKerjaKurangDari2TahunStrukturalCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      masaKerjaKurangDari2TahunStrukturalCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const PPPKSalahKedhuk = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const nikBelumValid = async (req, res) => {
  try {
    const knex = SyncPegawai.knex();
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const NikBelumValidCondition = function () {
      this.where(knex.raw("cast(siasn.is_valid_nik as boolean)"), "=", false);
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      NikBelumValidCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      NikBelumValidCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const tingkatPendidikanEselonTidakMemenuhiSyarat = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
