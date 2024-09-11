const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnTkPendidikan extends Model {
  static get tableName() {
    return "siasn_tk_pend";
  }
}

module.exports = SiasnTkPendidikan;
