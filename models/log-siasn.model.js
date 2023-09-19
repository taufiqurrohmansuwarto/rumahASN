const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class LogSiasn extends Model {
  static get tableName() {
    return "log_siasn";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "log_siasn.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = LogSiasn;
