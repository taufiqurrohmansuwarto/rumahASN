const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContentVersions extends Model {
  static get tableName() {
    return "knowledge.content_versions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const KnowledgeContent = require("@/models/knowledge/contents.model");
    const User = require("@/models/users.model");

    return {
      content: {
        relation: Model.BelongsToOneRelation,
        modelClass: KnowledgeContent,
        join: {
          from: "knowledge.content_versions.content_id",
          to: "knowledge.contents.id",
        },
      },
      user_updated: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "knowledge.content_versions.updated_by",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = knowledgeContentVersions;
