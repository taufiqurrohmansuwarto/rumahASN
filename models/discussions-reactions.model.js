const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class DiscussionsReactions extends Model {
  static get tableName() {
    return "discussions_reactions";
  }

  static get idColumn() {
    return ["discussion_id", "user_id", "reaction"];
  }
}

module.exports = DiscussionsReactions;
