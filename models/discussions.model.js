const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Discussions extends Model {
  static get tableName() {
    return "discussions";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Discussions;
