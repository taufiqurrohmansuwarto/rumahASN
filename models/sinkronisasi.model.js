const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Sinkronisasi extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sinkronisasi";
  }

  static get relationMappings() {}
}

module.exports = Sinkronisasi;
