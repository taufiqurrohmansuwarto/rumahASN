const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnEmployees extends Model {
  static get tableName() {
    return "siasn_employees";
  }
}

module.exports = SiasnEmployees;
