const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Activities extends Model {
  static get tableName() {
    return "activities";
  }

  static get relationMappings() {
    const User = require("../models/users.model");
    const Ticket = require("../models/tickets.model");

    return {
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: "activities.ticket_id",
          to: "tickets.id",
        },
      },
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "activities.sender",
          to: "users.custom_id",
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "activities.receiver",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Activities;
