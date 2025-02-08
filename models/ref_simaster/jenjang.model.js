const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Jenjang extends Model {
  static get tableName() {
    return "ref_simaster.jenjang";
  }
}

module.exports = Jenjang;
