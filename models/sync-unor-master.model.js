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

  static get relationMappings() {
    const rekonUnor = require("@/models/rekon/unor.model");
    return {
      rekon_unor: {
        relation: Model.HasManyRelation,
        modelClass: rekonUnor,
        join: {
          from: "sync_unor_master.id",
          through: {
            from: "rekon.unor.simaster_id",
            to: "sync_unor_master.id",
          },
          to: "rekon.unor.simaster_id",
        },
      },
    };
  }
}

module.exports = SyncUnorMaster;
