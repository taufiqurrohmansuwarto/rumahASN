const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);
const SyncPegawaiMaster = require("@/models/sync-pegawai.model");

class SiasnKp extends Model {
  static get tableName() {
    return "siasn_kp";
  }

  static get relationMappings() {
    return {
      pegawai: {
        relation: Model.BelongsToOneRelation,
        modelClass: SyncPegawaiMaster,
        join: {
          from: "siasn_kp.nipBaru",
          to: "sync_pegawai.nip_master",
        },
      },
    };
  }
}

module.exports = SiasnKp;
