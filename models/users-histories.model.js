const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class UserHistory extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "users_histories";
  }

  static get relationMappings() {
    const Ticket = require("@/models/tickets.model");
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "users_histories.user_id",
          to: "users.custom_id",
        },
      },
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: "users_histories.ticket_id",
          to: "tickets.id",
        },
      },
    };
  }
}

module.exports = UserHistory;
