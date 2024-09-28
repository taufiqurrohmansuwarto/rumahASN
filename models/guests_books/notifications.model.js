const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Notifications extends Model {
  static get tableName() {
    return "guests_books.notifications";
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = Notifications;
