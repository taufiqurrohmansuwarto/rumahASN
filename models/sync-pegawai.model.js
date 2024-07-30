const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SyncPegawai extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sync_pegawai";
  }

  static get relationMappings() {}
}

module.exports = SyncPegawai;
