const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Unor extends Model {
  static get tableName() {
    return "rekon.unor";
  }

  static get relationMappings() {
    const UnorSiasn = require("@/models/ref-siasn-unor.model");
    const UnorSimaster = require("@/models/sync-unor-master.model");

    return {
      unorSiasn: {
        relation: Model.HasOneRelation,
        modelClass: UnorSiasn,
        join: {
          from: "rekon.unor.id_siasn",
          to: "ref_siasn_unor.'Id'",
        },
      },
      unorSimaster: {
        relation: Model.HasOneRelation,
        modelClass: UnorSimaster,
        join: {
          from: "rekon.unor.id_simaster",
          to: "sync_unor_master.id",
        },
      },
    };
  }
}

module.exports = Unor;
