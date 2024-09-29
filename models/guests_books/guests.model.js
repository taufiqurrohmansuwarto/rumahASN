const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");
const User = require("@/models/users.model");

Model.knex(knex);

class Guests extends Model {
  static get tableName() {
    return "guests_books.guests";
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
          from: "guests_books.guests.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Guests;
