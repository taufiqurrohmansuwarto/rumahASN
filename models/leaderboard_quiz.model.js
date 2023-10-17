const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class LeaderboardQuiz extends Model {
  static get idColumn() {
    return "user_id";
  }

  static get tableName() {
    return "leaderboard_quiz";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "leaderboard_quiz.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = LeaderboardQuiz;
