const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Comments extends Model {
  static get tableName() {
    return "comments";
  }

  static get modifiers() {
    return {
      allSelect(query) {
        query.orderBy("created_at", "desc");
      },
    };
  }

  static get relationMappings() {
    const User = require("../models/users.model");

    return {
      // relation with own model
      comment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Comments,
        join: {
          from: "comments.comment_id",
          to: "comments.id",
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comments,
        join: {
          from: "comments.id",
          to: "comments.comment_id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "comments.user_custom_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Comments;
