const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppBsreSeal extends Model {
  static get tableName() {
    return "app_bsre_seal";
  }
}

module.exports = AppBsreSeal;
