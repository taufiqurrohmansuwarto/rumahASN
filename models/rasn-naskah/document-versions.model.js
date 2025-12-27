const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class DocumentVersions extends Model {
  static get tableName() {
    return "rasn_naskah.document_versions";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Documents = require("@/models/rasn-naskah/documents.model");
    const DocumentReviews = require("@/models/rasn-naskah/document-reviews.model");

    return {
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Documents,
        join: {
          from: "rasn_naskah.document_versions.document_id",
          to: "rasn_naskah.documents.id",
        },
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.document_versions.created_by",
          to: "users.custom_id",
        },
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: DocumentReviews,
        join: {
          from: "rasn_naskah.document_versions.id",
          to: "rasn_naskah.document_reviews.document_version_id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      byDocument(query, documentId) {
        query.where("document_id", documentId);
      },
      orderByVersion(query) {
        query.orderBy("version_number", "desc");
      },
      latest(query) {
        query.orderBy("version_number", "desc").limit(1);
      },
    };
  }
}

module.exports = DocumentVersions;

