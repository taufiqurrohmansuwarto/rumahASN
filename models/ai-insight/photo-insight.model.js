const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class PhotoInsight extends Model {
  static get tableName() {
    return "ai_insight.photo_insight";
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = PhotoInsight;
