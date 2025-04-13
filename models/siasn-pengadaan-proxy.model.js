const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnPengadaanProxy extends Model {
  static get tableName() {
    return "siasn_pengadaan_proxy";
  }
}

module.exports = SiasnPengadaanProxy;
