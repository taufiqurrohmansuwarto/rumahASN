const { Model } = require("objection");

class TicketsHistories extends Model {
  static get tableName() {
    return "tickets_histories";
  }

  static get relationMappings() {
    const users = require("./users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: users,
        join: {
          from: "tickets_histories.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = TicketsHistories;
