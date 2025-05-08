const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnRingkasanAnalisis extends Model {
  static get tableName() {
    return "siasn_ringkasan_analisis";
  }
}

module.exports = SiasnRingkasanAnalisis;
