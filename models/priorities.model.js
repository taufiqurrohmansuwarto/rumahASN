const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Priorities extends Model {
  static get tableName() {
    return "priorities";
  }
}

module.exports = Priorities;
