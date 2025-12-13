const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Message extends Model {
  static get tableName() {
    return "rasn_chat.messages";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get modifiers() {
    return {
      notDeleted(query) {
        query.where("is_deleted", false);
      },
      withCounts(query) {
        query
          .select("rasn_chat.messages.*")
          .select(
            Message.relatedQuery("reactions").count().as("reaction_count")
          )
          .select(
            Message.relatedQuery("attachments").count().as("attachment_count")
          );
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Channel = require("@/models/rasn_chat/channels.model");
    const Reaction = require("@/models/rasn_chat/reactions.model");
    const Mention = require("@/models/rasn_chat/mentions.model");
    const Attachment = require("@/models/rasn_chat/attachments.model");
    const KanbanTask = require("@/models/kanban/tasks.model");
    const Email = require("@/models/rasn_mail/emails.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.messages.user_id",
          to: "users.custom_id",
        },
      },
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: "rasn_chat.messages.channel_id",
          to: "rasn_chat.channels.id",
        },
      },
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.messages.parent_id",
          to: "rasn_chat.messages.id",
        },
      },
      replies: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.messages.id",
          to: "rasn_chat.messages.parent_id",
        },
      },
      reactions: {
        relation: Model.HasManyRelation,
        modelClass: Reaction,
        join: {
          from: "rasn_chat.messages.id",
          to: "rasn_chat.reactions.message_id",
        },
      },
      mentions: {
        relation: Model.HasManyRelation,
        modelClass: Mention,
        join: {
          from: "rasn_chat.messages.id",
          to: "rasn_chat.mentions.message_id",
        },
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: Attachment,
        join: {
          from: "rasn_chat.messages.id",
          to: "rasn_chat.attachments.message_id",
        },
      },
      linked_task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "rasn_chat.messages.linked_task_id",
          to: "kanban.tasks.id",
        },
      },
      linked_email: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_chat.messages.linked_email_id",
          to: "rasn_mail.emails.id",
        },
      },
    };
  }

  // Send message
  static async sendMessage({
    channelId,
    userId,
    content,
    contentType = "text",
    parentId = null,
    linkedTaskId = null,
    linkedEmailId = null,
    mentions = [],
  }) {
    const trx = await Message.startTransaction();

    try {
      // 1. Create message
      const message = await Message.query(trx).insert({
        channel_id: channelId,
        user_id: userId,
        content,
        content_type: contentType,
        parent_id: parentId,
        linked_task_id: linkedTaskId,
        linked_email_id: linkedEmailId,
      });

      // 2. Update thread count if reply
      if (parentId) {
        await Message.query(trx)
          .patch({ thread_count: Message.raw("thread_count + 1") })
          .where("id", parentId);
      }

      // 3. Create mentions
      if (mentions.length > 0) {
        const Mention = require("@/models/rasn_chat/mentions.model");
        for (const m of mentions) {
          await Mention.query(trx).insert({
            message_id: message.id,
            mentioned_user_id: m.userId || null,
            mention_type: m.type || "user",
          });
        }
      }

      await trx.commit();
      return message.$query().withGraphFetched("[user(simpleWithImage), attachments, reactions]");
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get messages in channel
  static async getChannelMessages(channelId, { page = 1, limit = 50, before = null } = {}) {
    let query = Message.query()
      .where("channel_id", channelId)
      .whereNull("parent_id") // Only top-level messages
      .modify("notDeleted")
      .withGraphFetched("[user(simpleWithImage), attachments, reactions, mentions.[mentioned_user(simpleWithImage)], parent.[user(simpleWithImage)], linked_task, linked_email]")
      .orderBy("created_at", "desc");

    if (before) {
      query = query.where("created_at", "<", before);
    }

    return query.page(page - 1, limit);
  }

  // Get thread messages
  static async getThreadMessages(parentId) {
    return Message.query()
      .where("parent_id", parentId)
      .modify("notDeleted")
      .withGraphFetched("[user(simpleWithImage), attachments, reactions, mentions.[mentioned_user(simpleWithImage)]]")
      .orderBy("created_at", "asc");
  }

  // Edit message
  async editMessage(content) {
    return this.$query().patchAndFetch({
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    });
  }

  // Delete message (soft delete)
  async deleteMessage() {
    return this.$query().patch({ is_deleted: true });
  }

  // Search messages
  static async searchMessages(query, channelId = null, limit = 50) {
    let searchQuery = Message.query()
      .modify("notDeleted")
      .whereRaw(
        "to_tsvector('indonesian', content) @@ plainto_tsquery('indonesian', ?)",
        [query]
      )
      .withGraphFetched("[user(simpleWithImage), channel(simpleSelect)]")
      .orderBy("created_at", "desc")
      .limit(limit);

    if (channelId) {
      searchQuery = searchQuery.where("channel_id", channelId);
    }

    return searchQuery;
  }

  // Get recent messages for user (across all channels)
  static async getRecentForUser(userId, limit = 20) {
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");

    return Message.query()
      .modify("notDeleted")
      .whereIn(
        "channel_id",
        ChannelMember.query().select("channel_id").where("user_id", userId)
      )
      .withGraphFetched("[user(simpleWithImage), channel(simpleSelect)]")
      .orderBy("created_at", "desc")
      .limit(limit);
  }
}

module.exports = Message;

