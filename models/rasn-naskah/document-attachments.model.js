const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class DocumentAttachments extends Model {
  static get tableName() {
    return "rasn_naskah.document_attachments";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Documents = require("@/models/rasn-naskah/documents.model");

    return {
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Documents,
        join: {
          from: "rasn_naskah.document_attachments.document_id",
          to: "rasn_naskah.documents.id",
        },
      },
      uploader: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.document_attachments.uploaded_by",
          to: "users.custom_id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      byDocument(query, documentId) {
        query.where("document_id", documentId);
      },
      orderByRecent(query) {
        query.orderBy("created_at", "desc");
      },
    };
  }
}

module.exports = DocumentAttachments;

