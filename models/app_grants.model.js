const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppGrants extends Model {
  static get tableName() {
    return "app_grants";
  }
}

module.exports = AppGrants;
