const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class VerbatimSessions extends Model {
  static get tableName() {
    return "verbatim_ai.sessions";
  }

  $beforeInsert() {
    this.id = nanoid(10);
  }
}

module.exports = VerbatimSessions;
