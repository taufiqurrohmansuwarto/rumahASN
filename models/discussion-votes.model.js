const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DiscussionVotes extends Model {
  static get modifiers() {
    return {
      whereUserId(query, userId) {
        query.where("user_id", userId).select("id");
      },
    };
  }

  static get tableName() {
    return "discussion_votes";
  }
}

module.exports = DiscussionVotes;
