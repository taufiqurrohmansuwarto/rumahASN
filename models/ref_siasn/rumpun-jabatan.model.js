const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class RumpunJabatan extends Model {
  static get tableName() {
    return "ref_siasn.rumpun_jabatan";
  }
}

module.exports = RumpunJabatan;
