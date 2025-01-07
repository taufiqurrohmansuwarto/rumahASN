const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Jft extends Model {
  static get tableName() {
    return "ref_siasn.jft";
  }
}

module.exports = Jft;
