const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Reaction extends Model {
  static get tableName() {
    return "rasn_chat.reactions";
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
          from: "rasn_chat.reactions.user_id",
          to: "users.custom_id",
        },
      },
      message: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.reactions.message_id",
          to: "rasn_chat.messages.id",
        },
      },
    };
  }

  // Add reaction
  static async addReaction(messageId, userId, emoji) {
    return Reaction.query()
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji,
      })
      .onConflict(["message_id", "user_id", "emoji"])
      .ignore();
  }

  // Remove reaction
  static async removeReaction(messageId, userId, emoji) {
    return Reaction.query()
      .delete()
      .where("message_id", messageId)
      .where("user_id", userId)
      .where("emoji", emoji);
  }

  // Toggle reaction
  static async toggleReaction(messageId, userId, emoji) {
    const existing = await Reaction.query()
      .where("message_id", messageId)
      .where("user_id", userId)
      .where("emoji", emoji)
      .first();

    if (existing) {
      await Reaction.removeReaction(messageId, userId, emoji);
      return { action: "removed", emoji };
    } else {
      await Reaction.addReaction(messageId, userId, emoji);
      return { action: "added", emoji };
    }
  }

  // Get reactions for message grouped by emoji
  static async getMessageReactions(messageId) {
    const reactions = await Reaction.query()
      .where("message_id", messageId)
      .withGraphFetched("user(simpleWithImage)");

    // Group by emoji
    const grouped = {};
    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.user);
    }

    return Object.values(grouped);
  }

  // Get user's reactions for message
  static async getUserReactions(messageId, userId) {
    return Reaction.query()
      .where("message_id", messageId)
      .where("user_id", userId)
      .select("emoji");
  }
}

module.exports = Reaction;

