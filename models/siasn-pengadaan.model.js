const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnPengadaan extends Model {
  static get tableName() {
    return "siasn_pengadaan";
  }
}

module.exports = SiasnPengadaan;
