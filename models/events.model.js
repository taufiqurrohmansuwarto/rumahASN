const { Model } = require("objection");
const knex = require("../db");
// nanoid
const { nanoid } = require("nanoid");

Model.knex(knex);

class Events extends Model {
  $beforeInsert() {
    this.id = nanoid();
    this.kode_event = nanoid(10);
  }

  static get tableName() {
    return "events";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = Events;
