const { Model } = require("objection");

class TicketSubcriptions extends Model {
  static get idColumn() {
    return ["ticket_id", "user_id"];
  }

  static get tableName() {
    return "tickets_subscriptions";
  }

  static get relationMappings() {
    const Ticket = require("@/models/tickets.model");

    return {
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: "tickets_subscriptions.ticket_id",
          to: "tickets.id",
        },
      },
    };
  }
}

module.exports = TicketSubcriptions;
