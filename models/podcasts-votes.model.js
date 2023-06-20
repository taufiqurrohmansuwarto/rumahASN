const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class PodcastVote extends Model {
  static get tableName() {
    return "podcasts_votes";
  }

  static get idColumn() {
    return ["podcast_id", "user_id"];
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "podcasts_votes.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = PodcastVote;
