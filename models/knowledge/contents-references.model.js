const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContentsReferences extends Model {
  static get tableName() {
    return "knowledge.references";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const KnowledgeContent = require("@/models/knowledge/contents.model");

    return {
      content: {
        relation: Model.BelongsToOneRelation,
        modelClass: KnowledgeContent,
        join: {
          from: "knowledge.references.content_id",
          to: "knowledge.contents.id",
        },
      },
    };
  }
}

module.exports = knowledgeContentsReferences;
