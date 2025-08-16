const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KnowledgeUserInteractions extends Model {
  static get tableName() {
    return "knowledge.user_interactions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = KnowledgeUserInteractions;
