const { handleError } = require("@/utils/helper/controller-helper");
const dayjs = require("dayjs");
const { proxyLayananRekapPG } = require("@/utils/siasn-proxy.utils");
const SiasnPg = require("@/models/siasn-pg.model");

export const syncPencantumanGelar = async (req, res) => {
  try {
    const knex = SiasnPg.knex();
    const { fetcher } = req;
    const periode = req.query.periode || dayjs().format("YYYY-MM-DD");

    const result = await proxyLayananRekapPG(fetcher, {
      periode,
    });

    const data = result?.data?.results;

    await knex
      .delete()
      .from("siasn_pg")
      .whereRaw("DATE(tgl_usulan) = ?", periode);

    await knex.batchInsert("siasn_pg", data);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

export const getRekonPGJatim = async (req, res) => {
  try {
    const periode = req.query.periode || dayjs().format("YYYY-MM-DD");
  } catch (error) {
    handleError(res, error);
  }
};

export const getRekonPGByPegawai = async (req, res) => {
  try {
    const periode = req.query.periode || dayjs().format("YYYY-MM-DD");
  } catch (error) {
    handleError(res, error);
  }
};
