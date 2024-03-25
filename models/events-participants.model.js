const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class EventParticipants extends Model {
  static get tableName() {
    return "event_participants";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = EventParticipants;
