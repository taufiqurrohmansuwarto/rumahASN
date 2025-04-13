import {
  handleError,
  getOpdId,
  validateOpd,
} from "@/utils/helper/controller-helper";

const SyncPegawai = require("@/models/sync-pegawai.model");

const createCountingQuery = (opdId, condition, countAlias) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhere(condition)
    .count(`* as ${countAlias}`)
    .first();
};

// counting hanya untuk pns saja
const countingTmtCpnsNipPNS = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereRaw(
        `TO_CHAR(DATE '1899-12-31' + siasn.tmt_cpns::int, 'YYYYMM') != SUBSTRING(siasn.nip_baru, 9, 6)`
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
        `TO_CHAR(DATE '1899-12-30' + siasn.tanggal_lahir::int, 'YYYYMMDD') != SUBSTRING(siasn.nip_baru, 1, 6)`
      );
    },
    "tgl_lahir_nip_asn"
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
    ]);

    const data = {
      tmt_cpns_nip_pns: result[0].tmt_cpns_nip_pns,
      tgl_lahir_nip_asn: result[1].tgl_lahir_nip_asn,
    };

    const hasil = [
      {
        id: "tmt_cpns_nip_pns",
        label: "TMT CPNS NIP PNS",
        value: data.tmt_cpns_nip_pns,
      },
      {
        id: "tgl_lahir_nip_asn",
        label: "TGL LAHIR NIP ASN",
        value: data.tgl_lahir_nip_asn,
      },
    ];

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const tmtCpnsNipPNS = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const tglLahirNipASN = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const tahunPengangkatanPPPK = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
