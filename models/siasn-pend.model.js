const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnPendidikan extends Model {
  static get tableName() {
    return "siasn_pend";
  }
}

module.exports = SiasnPendidikan;
