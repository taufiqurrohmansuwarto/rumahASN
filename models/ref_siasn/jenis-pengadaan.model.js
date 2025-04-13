const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class JenisPengadaan extends Model {
  static get tableName() {
    return "ref_siasn.jenis_pengadaan";
  }
}

module.exports = JenisPengadaan;
