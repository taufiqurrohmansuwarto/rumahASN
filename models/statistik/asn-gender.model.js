const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class ASNGender extends Model {
  static get tableName() {
    return "statistik.asn_gender";
  }

  static get relationMappings() {
    const SyncUnorMaster = require("@/models/sync-unor-master.model");

    return {
      perangkat_daerah: {
        relation: Model.BelongsToOneRelation,
        modelClass: SyncUnorMaster,
        join: {
          from: "statistik.asn_gender.unor_id",
          to: "sync_unor_master.id",
        },
      },
    };
  }
}

module.exports = ASNGender;
