const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class AlasanTolak extends Model {
  static get tableName() {
    return "ref_siasn.alasan_tolak";
  }
}

module.exports = AlasanTolak;
