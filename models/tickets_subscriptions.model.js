const { Model } = require("objection");

class TicketSubcriptions extends Model {
    static get tableName() {
        return 'tickets_subscriptions';
    }
}

module.exports = TicketSubcriptions;