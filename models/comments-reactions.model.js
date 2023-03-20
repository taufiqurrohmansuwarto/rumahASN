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

  static get relationMappings() {
    const users = require("./users.model");
    const comment = require("./tickets_comments_customers.model");

    return {
      comment: {
        relation: Model.BelongsToOneRelation,
        modelClass: comment,
        join: {
          from: "comments_reactions.comment_id",
          to: "tickets_comments_customers.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: users,
        join: {
          from: "comments_reactions.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = CommentReactions;
