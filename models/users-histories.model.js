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

    return {
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
