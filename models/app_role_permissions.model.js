const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppRolePermisions extends Model {
  static get tableName() {
    return "app_role_permissions";
  }
}

module.exports = AppRolePermisions;
