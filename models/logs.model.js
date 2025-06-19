const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Logs extends Model {
  static get tableName() {
    return "logs";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "logs.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Logs;
