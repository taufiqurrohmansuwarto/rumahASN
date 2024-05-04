const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DiscussionsVotes extends Model {
  static get tableName() {
    return "discussion_votes";
  }
}

module.exports = DiscussionsVotes;
