const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Notifications extends Model {
  static get tableName() {
    return "notifications";
  }

  static get idColumn() {
    return "id";
  }

  static get modifiers() {
    return {
      selectPublish(query) {
        query.select("id", "is_published");
      },
    };
  }

  //    relation with users table
  static get relationMappings() {
    const User = require("./users.model");
    const Ticket = require("./tickets.model");

    return {
      from_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "notifications.from",
          to: "users.custom_id",
        },
      },
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: "notifications.ticket_id",
          to: "tickets.id",
        },
      },
      to_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "notifications.to",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Notifications;
