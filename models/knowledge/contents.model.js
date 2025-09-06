const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContents extends Model {
  static get tableName() {
    return "knowledge.contents";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Category = require("@/models/knowledge/categories.model");
    const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");
    const KnowledgeContentAttachments = require("@/models/knowledge/content-attachments.model");
    const KnowledgeContentsReferences = require("@/models/knowledge/contents-references.model");
    const KnowledgeUserInteractions = require("@/models/knowledge/user-interactions.model");
    const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");

    return {
      versions: {
        relation: Model.HasManyRelation,
        modelClass: KnowledgeContentVersions,
        join: {
          from: "knowledge.contents.id",
          to: "knowledge.content_versions.content_id",
        },
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: KnowledgeContentAttachments,
        join: {
          from: "knowledge.contents.id",
          to: "knowledge.content_attachments.content_id",
        },
      },
      references: {
        relation: Model.HasManyRelation,
        modelClass: KnowledgeContentsReferences,
        join: {
          from: "knowledge.contents.id",
          to: "knowledge.references.content_id",
        },
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.contents.author_id",
          to: "users.custom_id",
        },
      },
      user_verified: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.contents.verified_by",
          to: "users.custom_id",
        },
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: "knowledge.contents.category_id",
          to: "knowledge.category.id",
        },
      },
      user_interactions: {
        relation: Model.HasManyRelation,
        modelClass: KnowledgeUserInteractions,
        join: {
          from: "knowledge.contents.id",
          to: "knowledge.user_interactions.content_id",
        },
      },
      ai_metadata: {
        relation: Model.HasOneRelation,
        modelClass: KnowledgeAiMetadata,
        join: {
          from: "knowledge.contents.id",
          to: "knowledge.knowledge_ai_metadata.content_id",
        },
      },
    };
  }
}

module.exports = knowledgeContents;
