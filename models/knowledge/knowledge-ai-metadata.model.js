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
    const knowledgeContent = require("@/models/knowledge/contents.model");
    return {
      knowledgeContent: {
        relation: Model.BelongsToOneRelation,
        modelClass: knowledgeContent,
        join: {
          from: "knowledge.knowledge_ai_metadata.content_id",
          to: "knowledge.contents.id",
        },
      },
    };
  }
}

module.exports = knowledgeKnowledgeAiMetadata;
