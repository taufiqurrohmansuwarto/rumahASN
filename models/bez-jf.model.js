const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class BezJf extends Model {
  static get tableName() {
    return "bez_jf";
  }

  static get relationMappings() {
    const jenjang = require("@/models/bez-jf-jenjang.model");

    return {
      jenjang: {
        relation: Model.HasManyRelation,
        modelClass: jenjang,
        join: {
          from: "bez_jf.kode",
          to: "bez_jf_jenjang.kode",
        },
      },
    };
  }

  static get idColumn() {
    return "kode";
  }
}

module.exports = BezJf;
