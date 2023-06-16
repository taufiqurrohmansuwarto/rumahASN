const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Podcast extends Model {
  $beforeInsert() {
    this.id = nanoid();
  }

  static get tableName() {
    return "podcasts";
  }
}

module.exports = Podcast;
