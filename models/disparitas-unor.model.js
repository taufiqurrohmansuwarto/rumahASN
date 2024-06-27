const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class DisparitasUnor extends Model {
  static get tableName() {
    return "disparitas_unor";
  }
}

module.exports = DisparitasUnor;
