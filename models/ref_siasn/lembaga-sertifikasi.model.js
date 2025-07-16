const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class LembagaSertifikasi extends Model {
  static get tableName() {
    return "ref_siasn.lembaga_sertifikasi";
  }
}

module.exports = LembagaSertifikasi;
