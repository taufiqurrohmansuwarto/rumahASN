const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DPreferences extends Model {
  static get tableName() {
    return "d_preferences";
  }
}

module.exports = DPreferences;
