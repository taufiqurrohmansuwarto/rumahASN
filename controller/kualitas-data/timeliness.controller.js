const SyncPegawai = require("@/models/SyncPegawai");
const { getOpdId, validateOpd, handleError } = require("@/utils/helper");

const createDataQuery = async (skpd_id, condition, limit, page) => {
  const knex = SyncPegawai.knex();
  const result = await knex("siasn.pegawai").select(
    knex.raw("siasn.pegawai.status_cpns_pns as status_cpns_pns"),
    knex.raw("siasn.pegawai.kedudukan_hukum_id as kedudukan_hukum_id"),
    knex.raw("siasn.pegawai.jenis_jabatan_id as jenis_jabatan_id")
  );
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
  } catch (error) {
    handleError(res, error);
  }
};

export const strukturalGanda = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const bupMasihAktif = async (req, res) => {
  try {
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
