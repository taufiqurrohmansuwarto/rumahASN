const { Model } = require("objection");
const knex = require("../db");
// nanoid
const { nanoid } = require("nanoid");

Model.knex(knex);

class EventSponsors extends Model {
  $beforeInsert() {
    this.id = nanoid();
  }

  static get tableName() {
    return "event_sponsors";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = EventSponsors;
