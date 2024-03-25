const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Events extends Model {
  static get tableName() {
    return "events";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = Events;
