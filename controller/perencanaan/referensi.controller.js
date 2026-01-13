const JabatanFungsional = require("@/models/simaster-jft.model");
const JabatanPelaksana = require("@/models/simaster-jfu.model");
const Pendidikan = require("@/models/ref_siasn/pendidikan.model");
const arrayToTree = require("array-to-tree");
const { raw } = require("objection");

const { handleError } = require("@/utils/helper/controller-helper");

const getJabatanFungsional = async (req, res) => {
  try {
    const jabatanFungsional = await JabatanFungsional.query().select(
      "id as id",
      "pId as pId",
      raw("CONCAT(name, ' ', jenjang_jab, ' - ', gol_ruang) as label"),
      raw("CONCAT(name, ' ', jenjang_jab, ' - ', gol_ruang) as title"),
      "id as value",
      "id as key"
    );

    const tree = arrayToTree(jabatanFungsional, {
      parentProperty: "pId",
      customID: "id",
    });
    res.json(tree);
  } catch (error) {
    handleError(res, error);
  }
};

const getJabatanPelaksana = async (req, res) => {
  try {
    const jabatanPelaksana = await JabatanPelaksana.query().select(
      "id as id",
      "pId as pId",
      "name as title",
      "name as label",
      "id as value",
      "id as key"
    );

    const tree = arrayToTree(jabatanPelaksana, {
      parentProperty: "pId",
      customID: "id",
    });

    res.json(tree);
  } catch (error) {
    handleError(res, error);
  }
};

const getPendidikan = async (req, res) => {
  try {
    const knex = Pendidikan.knex();
    const pendidikan = await knex.raw(
      `select rsp.id as value, stk.nama as tk_pend,rsp.nama as label from ref_siasn.pendidikan rsp left join siasn_tk_pend stk on stk.id::text = rsp.tk_pendidikan_id::text where status = '1'`
    );

    const result = pendidikan.rows;
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getJabatanFungsional,
  getJabatanPelaksana,
  getPendidikan,
};
