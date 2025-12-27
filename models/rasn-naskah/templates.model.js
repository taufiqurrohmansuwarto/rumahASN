const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Templates extends Model {
  static get tableName() {
    return "rasn_naskah.templates";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Documents = require("@/models/rasn-naskah/documents.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.templates.created_by",
          to: "users.custom_id",
        },
      },
      documents: {
        relation: Model.HasManyRelation,
        modelClass: Documents,
        join: {
          from: "rasn_naskah.templates.id",
          to: "rasn_naskah.documents.template_id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      public(query) {
        query.where("is_public", true);
      },
      byCategory(query, category) {
        query.where("category", category);
      },
      byUser(query, userId) {
        query.where("created_by", userId);
      },
      popular(query) {
        query.orderBy("usage_count", "desc");
      },
    };
  }

  // Increment usage count
  static async incrementUsage(templateId) {
    return Templates.query()
      .findById(templateId)
      .increment("usage_count", 1);
  }
}

module.exports = Templates;

