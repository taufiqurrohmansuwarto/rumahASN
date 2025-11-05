const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class PengadaanParuhWaktu extends Model {
  static get tableName() {
    return "pengadaan.paruh_waktu";
  }
}

module.exports = PengadaanParuhWaktu;
