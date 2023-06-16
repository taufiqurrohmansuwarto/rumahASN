const { Model } = require("objection");
const knex = require("../db");
const { customAlphabet } = require("nanoid");

Model.knex(knex);

class Podcast extends Model {
  $beforeInsert() {
    const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);
    this.ticket_number = nanoid();
    this.id = uuid.v4();
  }

  static get tableName() {
    return "podcasts";
  }
}

module.exports = Podcast;
