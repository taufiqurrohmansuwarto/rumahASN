const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class TicketsComments extends Model {
  static get tableName() {
    return "tickets_comments";
  }
}

module.exports = TicketsComments;
