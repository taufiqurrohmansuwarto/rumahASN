const { Model } = require("objection");
const knex = require("../db");
const DisparitasUnor = require("@/models/disparitas-unor.model");

Model.knex(knex);

class RefSIASNUnor extends Model {
  static get tableName() {
    return "ref_siasn_unor";
  }

  static get relationMappings() {
    const rekonUnor = require("@/models/rekon/unor.model");
    return {
      disparitas_unor: {
        relation: Model.HasOneRelation,
        modelClass: DisparitasUnor,
        join: {
          from: "ref_siasn_unor.Id",
          to: "disparitas_unor.id",
        },
      },
      rekon_unor: {
        relation: Model.HasManyRelation,
        modelClass: rekonUnor,
        join: {
          from: "ref_siasn_unor.Id",
          through: {
            from: "rekon.unor.id_siasn",
            to: "ref_siasn_unor.Id",
          },
          to: "rekon.unor.id_siasn",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = RefSIASNUnor;
