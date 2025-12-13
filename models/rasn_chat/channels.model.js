const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Channel extends Model {
  static get tableName() {
    return "rasn_chat.channels";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get modifiers() {
    return {
      simpleSelect(query) {
        query.select("id", "name", "icon", "type", "created_at");
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");
    const Message = require("@/models/rasn_chat/messages.model");
    const PinnedMessage = require("@/models/rasn_chat/pinned-messages.model");
    const VideoCall = require("@/models/rasn_chat/video-calls.model");
    const KanbanProject = require("@/models/kanban/projects.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.channels.created_by",
          to: "users.custom_id",
        },
      },
      members: {
        relation: Model.HasManyRelation,
        modelClass: ChannelMember,
        join: {
          from: "rasn_chat.channels.id",
          to: "rasn_chat.channel_members.channel_id",
        },
      },
      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.channels.id",
          to: "rasn_chat.messages.channel_id",
        },
      },
      pinned_messages: {
        relation: Model.HasManyRelation,
        modelClass: PinnedMessage,
        join: {
          from: "rasn_chat.channels.id",
          to: "rasn_chat.pinned_messages.channel_id",
        },
      },
      video_calls: {
        relation: Model.HasManyRelation,
        modelClass: VideoCall,
        join: {
          from: "rasn_chat.channels.id",
          to: "rasn_chat.video_calls.channel_id",
        },
      },
      kanban_project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "rasn_chat.channels.kanban_project_id",
          to: "kanban.projects.id",
        },
      },
    };
  }

  // Create channel with owner
  static async createChannel({ name, description, icon, type, createdBy, kanbanProjectId }) {
    const trx = await Channel.startTransaction();

    try {
      // 1. Create channel
      const channel = await Channel.query(trx).insert({
        name,
        description,
        icon: icon || "💬",
        type: type || "public",
        kanban_project_id: kanbanProjectId || null,
        created_by: createdBy,
      });

      // 2. Add creator as owner
      const ChannelMember = require("@/models/rasn_chat/channel-members.model");
      const ChannelRole = require("@/models/rasn_chat/channel-roles.model");
      const ownerRole = await ChannelRole.query(trx).where("name", "owner").first();

      await ChannelMember.query(trx).insert({
        channel_id: channel.id,
        user_id: createdBy,
        role_id: ownerRole.id,
      });

      await trx.commit();
      return channel;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get channels accessible by user
  static async getAccessibleChannels(userId) {
    return Channel.query()
      .where((builder) => {
        builder
          .where("type", "public")
          .orWhereExists(
            Channel.relatedQuery("members").where("user_id", userId)
          );
      })
      .where("is_archived", false)
      .withGraphFetched("[creator(simpleWithImage), members]")
      .orderBy("created_at", "desc");
  }

  // Get user's channels (joined)
  static async getUserChannels(userId) {
    return Channel.query()
      .whereExists(Channel.relatedQuery("members").where("user_id", userId))
      .where("is_archived", false)
      .withGraphFetched("[creator(simpleWithImage)]")
      .orderBy("name", "asc");
  }

  // Check if user is member
  async isMember(userId) {
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");
    const member = await ChannelMember.query()
      .where("channel_id", this.id)
      .where("user_id", userId)
      .first();
    return !!member;
  }

  // Get member count
  async getMemberCount() {
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");
    const result = await ChannelMember.query()
      .where("channel_id", this.id)
      .count("* as count")
      .first();
    return parseInt(result.count);
  }

  // Archive channel
  async archive() {
    return this.$query().patch({ is_archived: true });
  }

  // Unarchive channel
  async unarchive() {
    return this.$query().patch({ is_archived: false });
  }
}

module.exports = Channel;

