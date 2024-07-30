const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SyncUnorMaster extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sync_unor_master";
  }

  static get relationMappings() {}
}

module.exports = SyncUnorMaster;
