import {
  getOpdId,
  handleError,
  validateOpd,
} from "@/utils/helper/controller-helper";

const SyncPegawai = require("@/models/sync-pegawai.model");

export const dashbaord = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const tmtCpnsLebihBesarDariTMTPNS = async (req, res) => {
  try {
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

export const NikBelumValid = async (req, res) => {
  try {
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
