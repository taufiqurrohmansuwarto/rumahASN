const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SimasterJft extends Model {
  static get tableName() {
    return "simaster_jft";
  }
}

module.exports = SimasterJft;
