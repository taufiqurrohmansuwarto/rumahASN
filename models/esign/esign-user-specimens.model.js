const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class UserSpecimens extends Model {
  static get tableName() {
    return "esign.user_specimens";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "esign.user_specimens.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = UserSpecimens;

