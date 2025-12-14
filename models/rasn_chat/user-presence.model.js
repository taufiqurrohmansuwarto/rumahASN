const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class UserPresence extends Model {
  static get tableName() {
    return "rasn_chat.user_presence";
  }

  static get idColumn() {
    return "user_id";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.user_presence.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  // Update user presence
  static async updatePresence(userId, { status, statusText = null, statusEmoji = null }) {
    return UserPresence.query()
      .insert({
        user_id: userId,
        status,
        status_text: statusText,
        status_emoji: statusEmoji,
        last_seen: new Date().toISOString(),
      })
      .onConflict("user_id")
      .merge();
  }

  // Set user online
  static async setOnline(userId) {
    return UserPresence.updatePresence(userId, { status: "online" });
  }

  // Set user offline
  static async setOffline(userId) {
    return UserPresence.updatePresence(userId, { status: "offline" });
  }

  // Set user away
  static async setAway(userId) {
    return UserPresence.updatePresence(userId, { status: "away" });
  }

  // Set user busy
  static async setBusy(userId, statusText = null) {
    return UserPresence.updatePresence(userId, { 
      status: "busy",
      statusText,
    });
  }

  // Update last seen
  static async updateLastSeen(userId) {
    return UserPresence.query()
      .patch({ last_seen: new Date().toISOString() })
      .where("user_id", userId);
  }

  // Get user presence
  static async getPresence(userId) {
    return UserPresence.query()
      .where("user_id", userId)
      .withGraphFetched("user(simpleWithImage)")
      .first();
  }

  // Get online users - only show users with recent heartbeat (last 2 minutes)
  static async getOnlineUsers() {
    const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    return UserPresence.query()
      .whereIn("status", ["online", "away", "busy"])
      .where("last_seen", ">=", cutoffTime)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("last_seen", "desc");
  }

  // Get online users in channel - only show users with recent heartbeat (last 2 minutes)
  static async getOnlineUsersInChannel(channelId) {
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");
    const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    return UserPresence.query()
      .whereIn("status", ["online", "away", "busy"])
      .where("last_seen", ">=", cutoffTime)
      .whereIn(
        "user_id",
        ChannelMember.query().select("user_id").where("channel_id", channelId)
      )
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("last_seen", "desc");
  }

  // Set users offline if inactive for X minutes
  static async setInactiveUsersOffline(inactiveMinutes = 5) {
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000).toISOString();

    return UserPresence.query()
      .patch({ status: "offline" })
      .whereIn("status", ["online", "away"])
      .where("last_seen", "<", cutoffTime);
  }

  // Get presence status color
  getStatusColor() {
    const colors = {
      online: "#22C55E", // green
      away: "#F59E0B", // yellow
      busy: "#EF4444", // red
      offline: "#6B7280", // gray
    };
    return colors[this.status] || colors.offline;
  }

  // Get presence status label
  getStatusLabel() {
    const labels = {
      online: "Online",
      away: "Away",
      busy: "Busy",
      offline: "Offline",
    };
    return labels[this.status] || "Offline";
  }
}

module.exports = UserPresence;

