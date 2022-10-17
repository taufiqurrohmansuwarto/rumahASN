const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Comments extends Model {
  static get tableName() {
    return "comments";
  }
  static get relationMappings() {
    const User = require("../models/users.model");

    return {
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
