const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Pejabat extends Model {
  static get tableName() {
    return "pejabat";
  }
}

module.exports = Pejabat;
