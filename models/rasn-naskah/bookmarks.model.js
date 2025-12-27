const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Bookmarks extends Model {
  static get tableName() {
    return "rasn_naskah.bookmarks";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Documents = require("@/models/rasn-naskah/documents.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.bookmarks.user_id",
          to: "users.custom_id",
        },
      },
      document: {
        relation: Model.BelongsToOneRelation,
        modelClass: Documents,
        join: {
          from: "rasn_naskah.bookmarks.document_id",
          to: "rasn_naskah.documents.id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      byUser(query, userId) {
        query.where("user_id", userId);
      },
      orderByRecent(query) {
        query.orderBy("created_at", "desc");
      },
    };
  }

  // Toggle bookmark
  static async toggle(userId, documentId, note = null) {
    const existing = await Bookmarks.query()
      .where("user_id", userId)
      .where("document_id", documentId)
      .first();

    if (existing) {
      await Bookmarks.query().deleteById(existing.id);
      return { action: "removed", bookmark: null };
    }

    const bookmark = await Bookmarks.query().insert({
      user_id: userId,
      document_id: documentId,
      note,
    });

    return { action: "added", bookmark };
  }

  // Check if bookmarked
  static async isBookmarked(userId, documentId) {
    const bookmark = await Bookmarks.query()
      .where("user_id", userId)
      .where("document_id", documentId)
      .first();

    return !!bookmark;
  }
}

module.exports = Bookmarks;

