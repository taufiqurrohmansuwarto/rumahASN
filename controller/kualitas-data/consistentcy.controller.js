import {
  getOpdId,
  handleError,
  validateOpd,
} from "@/utils/helper/controller-helper";

const SyncPegawai = require("@/models/sync-pegawai.model");

const formatApiResponse = (page, limit, total, result) => {
  return {
    page,
    limit,
    total: total.total,
    data: result,
  };
};

const totalPegawaiPNS = async (opdId) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhereRaw("sync.status_master = 'PNS'")
    .count(`* as total_pegawai`)
    .first();
};

const totalPegawaiPPPK = async (opdId) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhereRaw("sync.status_master = 'PPPK'")
    .count(`* as total_pegawai`)
    .first();
};

const totalPegawaiASN = async (opdId) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .count(`* as total_pegawai`)
    .first();
};

const createCountingQuery = (opdId, condition, countAlias) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhere(condition)
    .count(`* as ${countAlias}`)
    .first();
};

const createDataQuery = (skpd_id, condition, limit, page) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
    .andWhere(condition)
    .orderBy("sync.nama_master", "asc")
    .limit(limit)
    .offset((page - 1) * limit);
};

const countingTmtCpnsNipPNS = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw(
        `TO_CHAR(siasn.tmt_cpns::date, 'YYYYMM') != SUBSTRING(siasn.nip_baru, 9, 6)`
      ).andWhereRaw(
        `siasn.kedudukan_hukum_id != '71' and siasn.kedudukan_hukum_id != '72'`
      );
    },
    "tmt_cpns_nip_pns"
  );
};

const countingTglLahirNipASN = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw(
        `TO_CHAR(siasn.tanggal_lahir::date, 'YYYYMMDD') != SUBSTRING(siasn.nip_baru, 1, 8)`
      );
    },
    "tgl_lahir_nip_asn"
  );
};

const countingTahunPengangkatanPPPK = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw(
        `TO_CHAR(siasn.tmt_cpns::date, 'YYYY') != SUBSTRING(siasn.nip_baru, 9, 4)`
      ).andWhereRaw(
        `siasn.kedudukan_hukum_id = '71' or siasn.kedudukan_hukum_id = '72'`
      );
    },
    "tahun_pengangkatan_pppk"
  );
};

const countingJenisKelaminPadaASN = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw(
        ` SUBSTRING(siasn.nip_baru, 15, 1) != CASE 
    WHEN siasn.jenis_kelamin = 'M' THEN '1'
    WHEN siasn.jenis_kelamin = 'F' THEN '2'
    ELSE NULL
  END`
      );
    },
    "jenis_kelamin_pada_asn"
  );
};

export const dashboardConsistentcy = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await Promise.all([
      countingTmtCpnsNipPNS(opdId),
      countingTglLahirNipASN(opdId),
      countingTahunPengangkatanPPPK(opdId),
      countingJenisKelaminPadaASN(opdId),
    ]);

    const data = {
      tmt_cpns_nip_pns: result[0].tmt_cpns_nip_pns,
      tgl_lahir_nip_asn: result[1].tgl_lahir_nip_asn,
      tahun_pengangkatan_pppk: result[2].tahun_pengangkatan_pppk,
      jenis_kelamin_pada_asn: result[3].jenis_kelamin_pada_asn,
    };

    const totalPegawai = await Promise.all([
      totalPegawaiPNS(opdId),
      totalPegawaiASN(opdId),
      totalPegawaiPPPK(opdId),
    ]);

    const hasil = [
      {
        id: "tmt_cpns_nip_pns",
        label: "TMT CPNS NIP PNS",
        value: data.tmt_cpns_nip_pns,
        total_pegawai: totalPegawai[0].total_pegawai,
        bobot: 25,
      },
      {
        id: "tgl_lahir_nip_asn",
        label: "TGL LAHIR NIP ASN",
        value: data.tgl_lahir_nip_asn,
        total_pegawai: totalPegawai[1].total_pegawai,
        bobot: 25,
      },
      {
        id: "tahun_pengangkatan_pppk",
        label: "TAHUN PENGANGKATAN PPPK",
        value: data.tahun_pengangkatan_pppk,
        total_pegawai: totalPegawai[2].total_pegawai,
        bobot: 25,
      },
      {
        id: "jenis_kelamin_pada_asn",
        label: "JENIS KELAMIN PADA ASN",
        value: data.jenis_kelamin_pada_asn,
        total_pegawai: totalPegawai[2].total_pegawai,
        bobot: 25,
      },
    ];

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const tmtCpnsNipPNS = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tmt_cpns::date, 'YYYYMM') != SUBSTRING(siasn.nip_baru, 9, 6)`
        ).andWhereRaw(
          `siasn.kedudukan_hukum_id != '71' and siasn.kedudukan_hukum_id != '72'`
        );
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tmt_cpns::date, 'YYYYMM') != SUBSTRING(siasn.nip_baru, 9, 6)`
        ).andWhereRaw(
          `siasn.kedudukan_hukum_id != '71' and siasn.kedudukan_hukum_id != '72'`
        );
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const tglLahirNipASN = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tanggal_lahir::date, 'YYYYMMDD') != SUBSTRING(siasn.nip_baru, 1, 8)`
        );
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tanggal_lahir::date, 'YYYYMMDD') != SUBSTRING(siasn.nip_baru, 1, 8)`
        );
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const tahunPengangkatanPPPK = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, limit = 10, page = 1 } = req?.query;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tmt_cpns::date, 'YYYY') != SUBSTRING(siasn.nip_baru, 9, 4)`
        );
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw(
          `TO_CHAR(siasn.tmt_cpns::date, 'YYYY') != SUBSTRING(siasn.nip_baru, 9, 4)`
        );
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

export const jenisKelaminPadaASN = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereRaw(
          ` SUBSTRING(siasn.nip_baru, 15, 1) != CASE 
    WHEN siasn.jenis_kelamin = 'M' THEN '1'
    WHEN siasn.jenis_kelamin = 'F' THEN '2'
    ELSE NULL
  END`
        );
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereRaw(
          ` SUBSTRING(siasn.nip_baru, 15, 1) != CASE 
    WHEN siasn.jenis_kelamin = 'M' THEN '1'
    WHEN siasn.jenis_kelamin = 'F' THEN '2'
    ELSE NULL
  END`
        );
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};
