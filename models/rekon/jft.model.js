const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Jft extends Model {
  static get tableName() {
    return "rekon.jft";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const JftSiasn = require("@/models/ref_siasn/jft.model");
    const JftSimaster = require("@/models/simaster-jft.model");

    return {
      JftSiasn: {
        relation: Model.HasOneRelation,
        modelClass: JftSiasn,
        join: {
          from: "rekon.jft.id_siasn",
          to: "ref_siasn.jft.id",
        },
      },
      JftSimaster: {
        relation: Model.HasOneRelation,
        modelClass: JftSimaster,
        join: {
          from: "rekon.jft.id_simaster",
          to: "simaster_jft.id",
        },
      },
    };
  }
}

module.exports = Jft;
