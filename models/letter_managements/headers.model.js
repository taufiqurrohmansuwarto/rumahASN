const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const User = require("@/models/users.model");

Model.knex(knex);

class Headers extends Model {
  static get tableName() {
    return "letter_managements.headers";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "letter_managements.headers.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Headers;
