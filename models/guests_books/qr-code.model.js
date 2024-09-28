const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class QrCode extends Model {
  static get tableName() {
    return "guests_books.qr_code";
  }

  $beforeInsert() {
    this.id = nanoid();
  }
}

module.exports = QrCode;
