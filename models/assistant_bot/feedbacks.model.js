const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Feedbacks extends Model {
  static get tableName() {
    return "assistant_bot.feedbacks";
  }

  static get relationMappings() {
    const Users = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "assistant_bot.feedbacks.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Feedbacks;
