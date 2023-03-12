const { Model } = require("objection");

class TicketsReactions extends Model{
    static get tableName(){
        return 'tickets_reactions';
    }
}

module.exports = TicketsReactions;