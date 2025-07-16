const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class RumpunJabatanJf extends Model {
  static get tableName() {
    return "ref_siasn.rumpun_jabatan_jf";
  }
}

module.exports = RumpunJabatanJf;
