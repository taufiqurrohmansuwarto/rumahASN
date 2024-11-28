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

  static get relationMappings() {
    const syncUnorMaster = require("@/models/sync-unor-master.model");
    return {
      skpd: {
        relation: Model.BelongsToOneRelation,
        modelClass: syncUnorMaster,
        join: {
          from: "sync_pegawai.skpd_id",
          to: "sync_unor_master.id",
        },
      },
    };
  }

  static get relationMappings() {}
}

module.exports = SyncPegawai;
