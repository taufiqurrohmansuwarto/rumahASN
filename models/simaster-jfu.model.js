const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SimasterJfu extends Model {
  static get tableName() {
    return "simaster_jfu";
  }
}

module.exports = SimasterJfu;
