const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);
const SyncPegawaiMaster = require("@/models/sync-pegawai.model");

class SiasnPg extends Model {
  static get tableName() {
    return "siasn_pg";
  }

  static get relationMappings() {
    return {
      pegawai: {
        relation: Model.BelongsToOneRelation,
        modelClass: SyncPegawaiMaster,
        join: {
          from: "siasn_pg.pns_id",
          to: "sync_pegawai.nip_master",
        },
      },
    };
  }
}

module.exports = SiasnPg;
