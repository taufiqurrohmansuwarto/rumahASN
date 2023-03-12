const { Model } = require("objection");

class TicketsHistories extends Model {
    static get tableName() {
        return 'tickets_histories';
    }
}

module.exports = TicketsHistories;