const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Attachment extends Model {
  static get tableName() {
    return "rasn_chat.attachments";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const Message = require("@/models/rasn_chat/messages.model");

    return {
      message: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: "rasn_chat.attachments.message_id",
          to: "rasn_chat.messages.id",
        },
      },
    };
  }

  // Create attachment
  static async createAttachment({
    messageId,
    fileName,
    fileType,
    fileSize,
    fileUrl,
    thumbnailUrl = null,
    attachmentType = "file",
    duration = null,
    waveformData = null,
    transcription = null,
    metadata = null,
  }) {
    return Attachment.query().insert({
      message_id: messageId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      attachment_type: attachmentType,
      duration,
      waveform_data: waveformData,
      transcription,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  }

  // Get attachments for message
  static async getMessageAttachments(messageId) {
    return Attachment.query()
      .where("message_id", messageId)
      .orderBy("created_at", "asc");
  }

  // Get channel media gallery
  static async getChannelMedia(channelId, { type = null, page = 1, limit = 50 } = {}) {
    const Message = require("@/models/rasn_chat/messages.model");

    let query = Attachment.query()
      .join(
        "rasn_chat.messages",
        "rasn_chat.attachments.message_id",
        "rasn_chat.messages.id"
      )
      .where("rasn_chat.messages.channel_id", channelId)
      .where("rasn_chat.messages.is_deleted", false)
      .select("rasn_chat.attachments.*")
      .orderBy("rasn_chat.attachments.created_at", "desc");

    if (type) {
      query = query.where("rasn_chat.attachments.attachment_type", type);
    }

    return query.page(page - 1, limit);
  }

  // Get images only
  static async getChannelImages(channelId, { page = 1, limit = 50 } = {}) {
    return Attachment.getChannelMedia(channelId, { type: "image", page, limit });
  }

  // Get voice messages
  static async getChannelVoiceMessages(channelId, { page = 1, limit = 50 } = {}) {
    return Attachment.getChannelMedia(channelId, { type: "voice", page, limit });
  }

  // Delete attachment
  async deleteAttachment() {
    // Note: You may want to also delete the file from storage here
    return this.$query().delete();
  }

  // Get file icon based on type
  getFileIcon() {
    const type = this.attachment_type;
    const mimeType = this.file_type || "";

    if (type === "image") return "🖼️";
    if (type === "video") return "🎬";
    if (type === "voice") return "🎤";
    if (type === "document") {
      if (mimeType.includes("pdf")) return "📕";
      if (mimeType.includes("word")) return "📘";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📗";
      if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📙";
      return "📄";
    }
    return "📎";
  }

  // Format file size
  getFormattedSize() {
    const bytes = this.file_size || 0;
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Format duration for voice/video
  getFormattedDuration() {
    if (!this.duration) return null;
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

module.exports = Attachment;

