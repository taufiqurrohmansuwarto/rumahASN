const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class ParuhWaktu extends Model {
  $beforeInsert() {
    this.id = nanoid();
  }

  static get tableName() {
    return "ai_insight.paruh_waktu";
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = ParuhWaktu;
