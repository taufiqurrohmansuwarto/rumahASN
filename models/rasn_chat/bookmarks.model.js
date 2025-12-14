const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Bookmark extends Model {
  static get tableName() {
    return "rasn_chat.bookmarks";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Message = require("@/models/rasn_chat/messages.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.bookmarks.user_id",
          to: "users.custom_id",
        },
      },
      message: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.bookmarks.message_id",
          to: "rasn_chat.messages.id",
        },
      },
    };
  }

  // Add bookmark
  static async addBookmark(userId, messageId, note = null) {
    return Bookmark.query()
      .insert({
        user_id: userId,
        message_id: messageId,
        note,
      })
      .onConflict(["user_id", "message_id"])
      .ignore();
  }

  // Remove bookmark
  static async removeBookmark(userId, messageId) {
    return Bookmark.query()
      .delete()
      .where("user_id", userId)
      .where("message_id", messageId);
  }

  // Toggle bookmark
  static async toggleBookmark(userId, messageId, note = null) {
    const existing = await Bookmark.query()
      .where("user_id", userId)
      .where("message_id", messageId)
      .first();

    if (existing) {
      await Bookmark.removeBookmark(userId, messageId);
      return { action: "removed", bookmarked: false };
    } else {
      await Bookmark.addBookmark(userId, messageId, note);
      return { action: "added", bookmarked: true };
    }
  }

  // Get user bookmarks
  static async getUserBookmarks(userId, { page = 1, limit = 20 } = {}) {
    return Bookmark.query()
      .where("user_id", userId)
      .withGraphFetched(
        "[message.[user(simpleWithImage), channel, attachments, reactions]]"
      )
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }

  // Check if message is bookmarked
  static async isBookmarked(userId, messageId) {
    const bookmark = await Bookmark.query()
      .where("user_id", userId)
      .where("message_id", messageId)
      .first();
    return !!bookmark;
  }

  // Update bookmark note
  static async updateNote(userId, messageId, note) {
    return Bookmark.query()
      .patch({ note })
      .where("user_id", userId)
      .where("message_id", messageId);
  }

  // Get bookmark count for user
  static async getBookmarkCount(userId) {
    const result = await Bookmark.query()
      .where("user_id", userId)
      .count("* as count")
      .first();
    return parseInt(result.count);
  }

  // Search user bookmarks
  static async searchBookmarks(userId, query, { page = 1, limit = 20 } = {}) {
    return Bookmark.query()
      .where("user_id", userId)
      .withGraphFetched(
        "[message.[user(simpleWithImage), channel, attachments]]"
      )
      .whereExists(
        Bookmark.relatedQuery("message").where("content", "ilike", `%${query}%`)
      )
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }
}

module.exports = Bookmark;
