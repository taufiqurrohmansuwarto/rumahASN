const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class MejaRegistrasi extends Model {
  static get tableName() {
    return "seleksi_pengadaan_asn.meja_registrasi";
  }
}

module.exports = MejaRegistrasi;
