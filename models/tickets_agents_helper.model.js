const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class TicketsAgentsHelper extends Model {
  static get tableName() {
    return "tickets_agents_helper";
  }

  static get idColumn() {
    return ["ticket_id", "user_custom_id"];
  }

  static get relationMappings() {
    const Users = require("../models/users.model");
    const Tickets = require("../models/tickets.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "tickets_agents_helper.user_custom_id",
          to: "users.custom_id",
        },
      },
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tickets,
        join: {
          from: "tickets_agents_helper.ticket_id",
          to: "tickets.id",
        },
      },
    };
  }
}

module.exports = TicketsAgentsHelper;
