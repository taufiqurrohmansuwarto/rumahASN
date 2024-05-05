const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DiscussionVotes extends Model {
  static get tableName() {
    return "discussion_votes";
  }
}

module.exports = DiscussionVotes;
