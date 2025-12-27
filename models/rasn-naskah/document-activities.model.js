const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class DocumentActivities extends Model {
  static get tableName() {
    return "rasn_naskah.document_activities";
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
          from: "rasn_naskah.document_activities.document_id",
          to: "rasn_naskah.documents.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.document_activities.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  static get jsonAttributes() {
    return ["metadata"];
  }

  static get modifiers() {
    return {
      byDocument(query, documentId) {
        query.where("document_id", documentId);
      },
      byUser(query, userId) {
        query.where("user_id", userId);
      },
      byAction(query, action) {
        query.where("action", action);
      },
      orderByRecent(query) {
        query.orderBy("created_at", "desc");
      },
    };
  }

  // Log activity helper
  static async log(documentId, userId, action, metadata = null, description = null) {
    return DocumentActivities.query().insert({
      document_id: documentId,
      user_id: userId,
      action,
      metadata,
      description,
    });
  }

  // Bulk log activities
  static async bulkLog(activities) {
    return DocumentActivities.query().insert(activities);
  }

  // Get activity timeline for document
  static async getTimeline(documentId, limit = 50) {
    return DocumentActivities.query()
      .where("document_id", documentId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc")
      .limit(limit);
  }
}

module.exports = DocumentActivities;

