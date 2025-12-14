const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Mention extends Model {
  static get tableName() {
    return "rasn_chat.mentions";
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
          from: "rasn_chat.mentions.mentioned_user_id",
          to: "users.custom_id",
        },
      },
      mentioned_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.mentions.mentioned_user_id",
          to: "users.custom_id",
        },
      },
      message: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.mentions.message_id",
          to: "rasn_chat.messages.id",
        },
      },
    };
  }

  // Create mentions for a message
  static async createMentions(messageId, mentions) {
    const mentionRecords = mentions.map((m) => ({
      message_id: messageId,
      mentioned_user_id: m.userId || null,
      mention_type: m.type || "user",
    }));

    return Mention.query().insert(mentionRecords);
  }

  // Get unread mentions for user
  static async getUnreadMentions(userId, { page = 1, limit = 20 } = {}) {
    return Mention.query()
      .where("mentioned_user_id", userId)
      .where("is_read", false)
      .withGraphFetched("[message.[user(simpleWithImage), channel(simpleSelect)]]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }

  // Get all mentions for user (both read and unread)
  static async getAllMentions(userId, { page = 1, limit = 20, filter = "all" } = {}) {
    let query = Mention.query()
      .where("mentioned_user_id", userId)
      .withGraphFetched("[message.[user(simpleWithImage), channel(simpleSelect)]]")
      .orderBy("created_at", "desc");

    // Filter by read status if specified
    if (filter === "unread") {
      query = query.where("is_read", false);
    } else if (filter === "read") {
      query = query.where("is_read", true);
    }

    return query.page(page - 1, limit);
  }

  // Mark mention as read
  static async markAsRead(mentionId) {
    return Mention.query()
      .patchAndFetchById(mentionId, { is_read: true });
  }

  // Mark all mentions as read for user
  static async markAllAsRead(userId) {
    return Mention.query()
      .patch({ is_read: true })
      .where("mentioned_user_id", userId)
      .where("is_read", false);
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    const result = await Mention.query()
      .where("mentioned_user_id", userId)
      .where("is_read", false)
      .count("* as count")
      .first();

    return parseInt(result.count);
  }

  // Get mentions in channel for user
  static async getChannelMentions(channelId, userId) {
    return Mention.query()
      .where("mentioned_user_id", userId)
      .whereExists(
        Mention.relatedQuery("message").where("channel_id", channelId)
      )
      .withGraphFetched("[message.[user(simpleWithImage)]]")
      .orderBy("created_at", "desc");
  }
}

module.exports = Mention;

