const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Recipient extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.recipients";
  }

  // Method untuk mark as read
  async markAsRead() {
    if (!this.is_read) {
      await this.$query().patch({
        is_read: true,
        read_at: new Date().toISOString(),
      });
    }
    return this;
  }

  async markAsUnread() {
    if (this.is_read) {
      await this.$query().patch({
        is_read: false,
        read_at: null,
      });
    }
    return this;
  }

  // Method untuk move to folder
  async moveToFolder(folder) {
    await this.$query().patch({
      folder,
      is_deleted: folder === "trash",
      deleted_at: folder === "trash" ? new Date().toISOString() : null,
    });
    return this;
  }

  static get relationMappings() {
    const Email = require("@/models/rasn_mail/emails.model");
    const User = require("@/models/users.model");

    return {
      email: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.recipients.email_id",
          to: "rasn_mail.emails.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.recipients.recipient_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Recipient;
