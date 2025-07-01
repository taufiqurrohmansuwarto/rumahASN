const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Jfu extends Model {
  static get tableName() {
    return "ref_simaster.jfu";
  }

  static get relationMappings() {
    const RekonJfu = require("@/models/rekon/jfu.model");
    return {
      rekon_jfu: {
        relation: Model.HasOneRelation,
        modelClass: RekonJfu,
        join: {
          from: "ref_simaster.jfu.id",
          to: "rekon.jfu.id_simaster",
        },
      },
    };
  }
}

module.exports = Jfu;
