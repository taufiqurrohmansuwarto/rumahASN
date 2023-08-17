const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DiscussionsVotes extends Model {
  static get tableName() {
    return "discussions_reactions";
  }

  static get idColumn() {
    return ["discussion_id", "user_id"];
  }
}

module.exports = DiscussionsVotes;
