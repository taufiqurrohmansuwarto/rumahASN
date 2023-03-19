const { Model } = require("objection");

class TicketSubcriptions extends Model {
  static get idColumn() {
    return ["ticket_id", "user_id"];
  }

  static get tableName() {
    return "tickets_subscriptions";
  }
}

module.exports = TicketSubcriptions;
