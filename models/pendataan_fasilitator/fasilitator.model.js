const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class PendataanFasilitator extends Model {
  static get tableName() {
    return "pendataan_fasilitator.fasilitator";
  }
}

module.exports = PendataanFasilitator;
