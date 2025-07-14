const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Pendidikan extends Model {
  static get tableName() {
    return "ref_siasn.pendidikan";
  }
}

module.exports = Pendidikan;
