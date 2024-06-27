const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class RefSIASNUnor extends Model {
  static get tableName() {
    return "ref_siasn_unor";
  }

  static get relationMappings() {
    return {
      disparitas_unor: {
        relation: Model.HasOneRelation,
        modelClass: DisparitasUnor,
        join: {
          from: "ref_siasn_unor.Id",
          to: "disparitas_unor.id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = RefSIASNUnor;
