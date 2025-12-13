const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class VideoCall extends Model {
  static get tableName() {
    return "rasn_chat.video_calls";
  }

  $beforeInsert() {
    this.id = nanoid();
    // Generate room name for Jitsi
    if (!this.room_name) {
      this.room_name = `rasn-chat-${nanoid(10)}`;
    }
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Channel = require("@/models/rasn_chat/channels.model");
    const CallParticipant = require("@/models/rasn_chat/call-participants.model");

    return {
      starter: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.video_calls.started_by",
          to: "users.custom_id",
        },
      },
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: "rasn_chat.video_calls.channel_id",
          to: "rasn_chat.channels.id",
        },
      },
      participants: {
        relation: Model.HasManyRelation,
        modelClass: CallParticipant,
        join: {
          from: "rasn_chat.video_calls.id",
          to: "rasn_chat.call_participants.call_id",
        },
      },
    };
  }

  // Start a new call
  static async startCall({ channelId, startedBy, callType = "video", title = null }) {
    const call = await VideoCall.query().insert({
      channel_id: channelId,
      started_by: startedBy,
      call_type: callType,
      title,
      status: "active",
    });

    // Add starter as first participant
    const CallParticipant = require("@/models/rasn_chat/call-participants.model");
    await CallParticipant.joinCall(call.id, startedBy);

    // Create system message
    const Message = require("@/models/rasn_chat/messages.model");
    await Message.sendMessage({
      channelId,
      userId: startedBy,
      content: callType === "video" ? "📹 Memulai video call" : "📞 Memulai voice call",
      contentType: "system",
    });

    return call.$query().withGraphFetched("[starter(simpleWithImage), participants]");
  }

  // End call
  async endCall() {
    const trx = await VideoCall.startTransaction();

    try {
      // Update all participants who haven't left
      const CallParticipant = require("@/models/rasn_chat/call-participants.model");
      await CallParticipant.query(trx)
        .patch({ left_at: new Date().toISOString() })
        .where("call_id", this.id)
        .whereNull("left_at");

      // Update call status
      await this.$query(trx).patch({
        status: "ended",
        ended_at: new Date().toISOString(),
      });

      // Calculate duration and create system message
      const duration = this.ended_at
        ? Math.round((new Date(this.ended_at) - new Date(this.started_at)) / 1000)
        : 0;

      const Message = require("@/models/rasn_chat/messages.model");
      await Message.query(trx).insert({
        channel_id: this.channel_id,
        user_id: this.started_by,
        content: `📞 Panggilan berakhir (${this.formatDuration(duration)})`,
        content_type: "system",
      });

      await trx.commit();
      return this;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get active call in channel
  static async getActiveCall(channelId) {
    return VideoCall.query()
      .where("channel_id", channelId)
      .where("status", "active")
      .withGraphFetched("[starter(simpleWithImage), participants.[user(simpleWithImage)]]")
      .first();
  }

  // Get call history for channel
  static async getCallHistory(channelId, { page = 1, limit = 20 } = {}) {
    return VideoCall.query()
      .where("channel_id", channelId)
      .withGraphFetched("[starter(simpleWithImage)]")
      .orderBy("started_at", "desc")
      .page(page - 1, limit);
  }

  // Get current participants count
  async getParticipantCount() {
    const CallParticipant = require("@/models/rasn_chat/call-participants.model");
    const result = await CallParticipant.query()
      .where("call_id", this.id)
      .whereNull("left_at")
      .count("* as count")
      .first();
    return parseInt(result.count);
  }

  // Update max participants
  async updateMaxParticipants() {
    const currentCount = await this.getParticipantCount();
    if (currentCount > (this.max_participants || 0)) {
      await this.$query().patch({ max_participants: currentCount });
    }
  }

  // Format duration
  formatDuration(seconds) {
    if (!seconds) return "0 detik";
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

  // Get Jitsi config
  getJitsiConfig() {
    return {
      domain: "coaching-online.site", // Your Jitsi domain
      roomName: this.room_name,
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: true,
        startScreenSharing: false,
        enableEmailInStats: false,
        whiteboard: {
          enabled: true,
          collabServerBaseUrl: "https://siasn.bkd.jatimprov.go.id/whiteboard",
        },
      },
      interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        APP_NAME: "RASN Chat - Video Call",
      },
    };
  }
}

module.exports = VideoCall;

