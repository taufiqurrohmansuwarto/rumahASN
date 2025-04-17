const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnMfa extends Model {
  static get tableName() {
    return "siasn_mfa";
  }
}

module.exports = SiasnMfa;
