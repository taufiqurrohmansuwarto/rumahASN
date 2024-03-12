const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnIPASN extends Model {
  static get tableName() {
    return "siasn_ipasn";
  }
}

module.exports = SiasnIPASN;
