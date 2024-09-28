const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Visits extends Model {
  static get tableName() {
    return "guests_books.visits";
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = Visits;
