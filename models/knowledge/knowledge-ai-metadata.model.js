const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeKnowledgeAiMetadata extends Model {
  static get tableName() {
    return "knowledge.knowledge_ai_metadata";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = knowledgeKnowledgeAiMetadata;
