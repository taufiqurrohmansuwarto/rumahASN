const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class LogSealBsre extends Model {
  static get tableName() {
    return "log_seal_bsre";
  }

  static get relationMappings() {
    const user = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "log_seal_bsre.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = LogSealBsre;
