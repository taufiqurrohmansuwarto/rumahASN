const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class VerbatimSessions extends Model {
  static get tableName() {
    return "verbatim_ai.sessions";
  }
}

module.exports = VerbatimSessions;
