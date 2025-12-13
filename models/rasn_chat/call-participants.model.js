const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class CallParticipant extends Model {
  static get tableName() {
    return "rasn_chat.call_participants";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const VideoCall = require("@/models/rasn_chat/video-calls.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.call_participants.user_id",
          to: "users.custom_id",
        },
      },
      call: {
        relation: Model.BelongsToOneRelation,
        modelClass: VideoCall,
        join: {
          from: "rasn_chat.call_participants.call_id",
          to: "rasn_chat.video_calls.id",
        },
      },
    };
  }

  // Join call
  static async joinCall(callId, userId) {
    const participant = await CallParticipant.query().insert({
      call_id: callId,
      user_id: userId,
    });

    // Update max participants in call
    const VideoCall = require("@/models/rasn_chat/video-calls.model");
    const call = await VideoCall.query().findById(callId);
    if (call) {
      await call.updateMaxParticipants();
    }

    return participant;
  }

  // Leave call
  static async leaveCall(callId, userId) {
    const participant = await CallParticipant.query()
      .where("call_id", callId)
      .where("user_id", userId)
      .whereNull("left_at")
      .first();

    if (participant) {
      const duration = Math.round(
        (Date.now() - new Date(participant.joined_at).getTime()) / 1000
      );

      await participant.$query().patch({
        left_at: new Date().toISOString(),
        total_duration: duration,
      });
    }

    return participant;
  }

  // Get active participants in call
  static async getActiveParticipants(callId) {
    return CallParticipant.query()
      .where("call_id", callId)
      .whereNull("left_at")
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("joined_at", "asc");
  }

  // Check if user is in call
  static async isUserInCall(callId, userId) {
    const participant = await CallParticipant.query()
      .where("call_id", callId)
      .where("user_id", userId)
      .whereNull("left_at")
      .first();
    return !!participant;
  }

  // Get user's call history
  static async getUserCallHistory(userId, { page = 1, limit = 20 } = {}) {
    return CallParticipant.query()
      .where("user_id", userId)
      .withGraphFetched("[call.[channel(simpleSelect), starter(simpleWithImage)]]")
      .orderBy("joined_at", "desc")
      .page(page - 1, limit);
  }

  // Get total call time for user
  static async getUserTotalCallTime(userId) {
    const result = await CallParticipant.query()
      .where("user_id", userId)
      .sum("total_duration as total")
      .first();
    return parseInt(result.total) || 0;
  }

  // Format duration
  getFormattedDuration() {
    if (!this.total_duration) return "0 detik";
    const seconds = this.total_duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    } else if (minutes > 0) {
      return `${minutes} menit ${secs} detik`;
    } else {
      return `${secs} detik`;
    }
  }
}

module.exports = CallParticipant;

