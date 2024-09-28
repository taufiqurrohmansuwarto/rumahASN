const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Guests extends Model {
  static get tableName() {
    return "guests_books.guests";
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = Guests;
