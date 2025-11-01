const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AIInsightParuhWaktu extends Model {
  static get tableName() {
    return "ai_insight.paruh_waktu";
  }

  static get idColumn() {
    return "id";
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = AIInsightParuhWaktu;
