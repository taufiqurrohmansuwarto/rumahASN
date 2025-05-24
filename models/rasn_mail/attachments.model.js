const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Attachment extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.attachments";
  }

  static get relationMappings() {
    const Email = require("@/models/rasn_mail/emails.model");

    return {
      email: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.attachments.email_id",
          to: "rasn_mail.emails.id",
        },
      },
    };
  }

  // Virtual property untuk formatted file size
  static get virtualAttributes() {
    return ["formatted_size"];
  }

  formatted_size() {
    const bytes = this.file_size;
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

module.exports = Attachment;
