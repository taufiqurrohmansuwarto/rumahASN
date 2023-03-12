const { Model } = require("objection");

class TicketsLabels extends Model {
    static get tableName() {
        return 'tickets_labels';
    }
}

module.exports = TicketsLabels;