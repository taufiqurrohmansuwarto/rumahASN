const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

/**
 * Model untuk tracking active video conference sessions
 * Digunakan untuk persistence saat user refresh/logout
 */
class CCVideoSessions extends Model {
  $beforeInsert() {
    this.id = nanoid();
    this.joined_at = new Date().toISOString();
    this.last_heartbeat = new Date().toISOString();
  }

  static get tableName() {
    return "cc_video_sessions";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Meeting = require("@/models/cc_meetings.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "cc_video_sessions.user_id",
          to: "users.custom_id",
        },
      },
      meeting: {
        relation: Model.BelongsToOneRelation,
        modelClass: Meeting,
        join: {
          from: "cc_video_sessions.meeting_id",
          to: "cc_meetings.id",
        },
      },
    };
  }

  // Helper: Check if session is stale (heartbeat timeout)
  isStale(timeoutMs = 2 * 60 * 1000) {
    const lastHeartbeat = new Date(this.last_heartbeat);
    const now = new Date();
    return now - lastHeartbeat > timeoutMs;
  }
}

module.exports = CCVideoSessions;
