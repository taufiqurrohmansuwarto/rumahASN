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
    const siasnEmployee = require("@/models/siasn-employees.model");

    return {
      skpd: {
        relation: Model.BelongsToOneRelation,
        modelClass: syncUnorMaster,
        join: {
          from: "sync_pegawai.skpd_id",
          to: "sync_unor_master.id",
        },
      },
      siasn: {
        relation: Model.BelongsToOneRelation,
        modelClass: siasnEmployee,
        join: {
          from: "sync_pegawai.nip_master",
          to: "siasn_employees.nip_baru",
        },
      },
    };
  }
}

module.exports = SyncPegawai;
