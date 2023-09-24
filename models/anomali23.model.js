const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Anomali23 extends Model {
  static get tableName() {
    return "anomali_23";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "anomali_23.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Anomali23;
