const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class ChannelMember extends Model {
  static get tableName() {
    return "rasn_chat.channel_members";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Channel = require("@/models/rasn_chat/channels.model");
    const ChannelRole = require("@/models/rasn_chat/channel-roles.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.channel_members.user_id",
          to: "users.custom_id",
        },
      },
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: "rasn_chat.channel_members.channel_id",
          to: "rasn_chat.channels.id",
        },
      },
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChannelRole,
        join: {
          from: "rasn_chat.channel_members.role_id",
          to: "rasn_chat.channel_roles.id",
        },
      },
    };
  }

  // Get member with role
  static async getMember(channelId, userId) {
    return ChannelMember.query()
      .where("channel_id", channelId)
      .where("user_id", userId)
      .withGraphFetched("role")
      .first();
  }

  // Add member to channel
  static async addMember(channelId, userId, roleId = null) {
    const ChannelRole = require("@/models/rasn_chat/channel-roles.model");

    // Get member role if not specified
    if (!roleId) {
      const memberRole = await ChannelRole.getMemberRole();
      roleId = memberRole?.id || "ch-role-member";
    }

    return ChannelMember.query()
      .insert({
        channel_id: channelId,
        user_id: userId,
        role_id: roleId,
      })
      .onConflict(["channel_id", "user_id"])
      .ignore();
  }

  // Remove member from channel
  static async removeMember(channelId, userId) {
    return ChannelMember.query()
      .delete()
      .where("channel_id", channelId)
      .where("user_id", userId);
  }

  // Update member role
  static async updateRole(channelId, userId, roleId) {
    return ChannelMember.query()
      .patch({ role_id: roleId })
      .where("channel_id", channelId)
      .where("user_id", userId);
  }

  // Get all members of channel
  static async getChannelMembers(channelId) {
    return ChannelMember.query()
      .where("channel_id", channelId)
      .withGraphFetched("[user(simpleWithImage), role]")
      .orderBy("joined_at", "asc");
  }

  // Update last read timestamp
  static async updateLastRead(channelId, userId) {
    return ChannelMember.query()
      .patch({ last_read_at: new Date().toISOString() })
      .where("channel_id", channelId)
      .where("user_id", userId);
  }

  // Toggle mute
  static async toggleMute(channelId, userId) {
    const member = await ChannelMember.getMember(channelId, userId);
    if (!member) return null;

    return ChannelMember.query()
      .patchAndFetchById(member.id, { muted: !member.muted });
  }

  // Update notification preference
  static async updateNotificationPref(channelId, userId, pref) {
    return ChannelMember.query()
      .patch({ notification_pref: pref })
      .where("channel_id", channelId)
      .where("user_id", userId);
  }

  // Check if user has permission in channel
  async hasPermission(permission) {
    if (!this.role) {
      await this.$fetchGraph("role");
    }
    return this.role?.hasPermission(permission) || false;
  }

  // Get unread count for user in channel
  static async getUnreadCount(channelId, userId) {
    const member = await ChannelMember.getMember(channelId, userId);
    if (!member || !member.last_read_at) return 0;

    const Message = require("@/models/rasn_chat/messages.model");
    const result = await Message.query()
      .where("channel_id", channelId)
      .where("created_at", ">", member.last_read_at)
      .where("is_deleted", false)
      .count("* as count")
      .first();

    return parseInt(result.count);
  }
}

module.exports = ChannelMember;

