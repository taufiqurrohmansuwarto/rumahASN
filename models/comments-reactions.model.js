const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class CommentReactions extends Model {
  static get tableName() {
    return "comments_reactions";
  }

  static get idColumn() {
    return ["comment_id", "user_id", "reaction"];
  }
}

module.exports = CommentReactions;
