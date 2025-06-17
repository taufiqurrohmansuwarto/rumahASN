const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Logs extends Model {
  static get tableName() {
    return "logs";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Logs;
