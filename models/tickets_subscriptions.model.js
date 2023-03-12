const { Model } = require("objection");

class TicketSubcriptions extends Model {
    static get tableName() {
        return 'tickets_reactions';
    }
}

module.exports = TicketSubcriptions;