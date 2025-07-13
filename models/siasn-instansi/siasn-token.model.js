const { Model } = require("objection");
const knex = require("../../db");
Model.knex(knex);

class SiasnToken extends Model {
  static get tableName() {
    return "siasn_token";
  }

  static get idColumn() {
    return "id";
  }

  // realation with user
  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "siasn_token.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = SiasnToken;
