const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class TicketsCommentsAgents extends Model {
  static get tableName() {
    return "tickets_comments_agents";
  }
}

module.exports = TicketsCommentsAgents;
