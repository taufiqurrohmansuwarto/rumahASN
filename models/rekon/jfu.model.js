const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class RekonJfu extends Model {
  static get tableName() {
    return "rekon.jfu";
  }

  static get relationMappings() {
    const JfuSiasn = require("@/models/ref_siasn/jfu.model");
    const JfuSimaster = require("@/models/ref_simaster/jfu.model");

    return {
      JfuSiasn: {
        relation: Model.HasOneRelation,
        modelClass: JfuSiasn,
        join: {
          from: "rekon.jfu.id_siasn",
          to: "ref_siasn.jfu.id",
        },
      },
      JfuSimaster: {
        relation: Model.HasOneRelation,
        modelClass: JfuSimaster,
        join: {
          from: "rekon.jfu.id_simaster",
          to: "ref_simaster.jfu.id",
        },
      },
    };
  }
}

module.exports = RekonJfu;
