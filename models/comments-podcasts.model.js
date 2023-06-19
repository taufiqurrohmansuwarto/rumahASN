const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class CommentPodcast extends Model {
  static get tableName() {
    return "comments_podcasts";
  }

  static get relationMappings() {
    const userModel = require("@/models/users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: userModel,
        join: {
          from: "comments_podcasts.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = CommentPodcast;
