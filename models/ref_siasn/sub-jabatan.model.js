const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class SubJabatan extends Model {
  static get tableName() {
    return "ref_siasn.sub_jabatan";
  }
}

module.exports = SubJabatan;
