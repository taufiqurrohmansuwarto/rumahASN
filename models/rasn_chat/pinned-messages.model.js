const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class PinnedMessage extends Model {
  static get tableName() {
    return "rasn_chat.pinned_messages";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Channel = require("@/models/rasn_chat/channels.model");
    const Message = require("@/models/rasn_chat/messages.model");

    return {
      pinned_by_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.pinned_messages.pinned_by",
          to: "users.custom_id",
        },
      },
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: "rasn_chat.pinned_messages.channel_id",
          to: "rasn_chat.channels.id",
        },
      },
      message: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.pinned_messages.message_id",
          to: "rasn_chat.messages.id",
        },
      },
    };
  }

  // Pin a message
  static async pinMessage(channelId, messageId, pinnedBy) {
    return PinnedMessage.query()
      .insert({
        channel_id: channelId,
        message_id: messageId,
        pinned_by: pinnedBy,
      })
      .onConflict(["channel_id", "message_id"])
      .ignore();
  }

  // Unpin a message
  static async unpinMessage(channelId, messageId) {
    return PinnedMessage.query()
      .delete()
      .where("channel_id", channelId)
      .where("message_id", messageId);
  }

  // Toggle pin
  static async togglePin(channelId, messageId, userId) {
    const existing = await PinnedMessage.query()
      .where("channel_id", channelId)
      .where("message_id", messageId)
      .first();

    if (existing) {
      await PinnedMessage.unpinMessage(channelId, messageId);
      return { action: "unpinned" };
    } else {
      await PinnedMessage.pinMessage(channelId, messageId, userId);
      return { action: "pinned" };
    }
  }

  // Get pinned messages for channel
  static async getChannelPinnedMessages(channelId) {
    return PinnedMessage.query()
      .where("channel_id", channelId)
      .withGraphFetched("[message.[user(simpleWithImage), attachments], pinned_by_user(simpleWithImage)]")
      .orderBy("pinned_at", "desc");
  }

  // Check if message is pinned
  static async isPinned(channelId, messageId) {
    const pinned = await PinnedMessage.query()
      .where("channel_id", channelId)
      .where("message_id", messageId)
      .first();
    return !!pinned;
  }

  // Get pinned count for channel
  static async getPinnedCount(channelId) {
    const result = await PinnedMessage.query()
      .where("channel_id", channelId)
      .count("* as count")
      .first();
    return parseInt(result.count);
  }
}

module.exports = PinnedMessage;

