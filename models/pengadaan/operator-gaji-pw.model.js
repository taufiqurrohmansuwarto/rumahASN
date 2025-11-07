const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class OperatorGajiPW extends Model {
  static get tableName() {
    return "pengadaan.operator_gaji_pw";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "pengadaan.operator_gaji_pw.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = OperatorGajiPW;
