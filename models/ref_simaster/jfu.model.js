const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Jfu extends Model {
  static get tableName() {
    return "ref_simaster.jfu";
  }
}

module.exports = Jfu;
