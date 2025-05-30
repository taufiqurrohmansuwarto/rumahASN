// models/rasn_mail/email-user-actions.model.js

const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class EmailUserAction extends Model {
  static get tableName() {
    return "rasn_mail.email_user_actions";
  }

  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const Email = require("@/models/rasn_mail/emails.model");
    const User = require("@/models/users.model");

    return {
      email: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.email_user_actions.email_id",
          to: "rasn_mail.emails.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.email_user_actions.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  // Instance methods for user actions
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

  async toggleStar() {
    const newStarValue = !this.is_starred;
    await this.$query().patch({
      is_starred: newStarValue,
      starred_at: newStarValue ? new Date().toISOString() : null,
    });
    return this;
  }

  async moveToFolder(folder) {
    const updateData = {
      folder,
      is_archived: folder === "archive",
    };

    // Handle soft delete
    if (folder === "trash") {
      updateData.deleted_at = new Date().toISOString();
    } else if (this.deleted_at) {
      // Restore from trash
      updateData.deleted_at = null;
    }

    await this.$query().patch(updateData);
    return this;
  }

  async snooze(until) {
    await this.$query().patch({
      is_snoozed: true,
      snoozed_until: until,
      folder: "inbox", // Snoozed emails go back to inbox
    });
    return this;
  }

  async unsnooze() {
    await this.$query().patch({
      is_snoozed: false,
      snoozed_until: null,
    });
    return this;
  }

  // Static methods
  static async getOrCreateForUser(emailId, userId, defaults = {}) {
    let action = await EmailUserAction.query()
      .where("email_id", emailId)
      .where("user_id", userId)
      .first();

    if (!action) {
      action = await EmailUserAction.query().insert({
        email_id: emailId,
        user_id: userId,
        ...defaults,
      });
    }

    return action;
  }

  static async getUserEmailStats(userId) {
    const stats = await EmailUserAction.query()
      .where("user_id", userId)
      .where("deleted_at", null)
      .select([
        EmailUserAction.raw("COUNT(*) as total_emails"),
        EmailUserAction.raw(
          "COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count"
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN is_starred = true THEN 1 END) as starred_count"
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN folder = ? THEN 1 END) as inbox_count",
          ["inbox"]
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN folder = ? THEN 1 END) as sent_count",
          ["sent"]
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN folder = ? THEN 1 END) as archive_count",
          ["archive"]
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN folder = ? THEN 1 END) as spam_count",
          ["spam"]
        ),
        EmailUserAction.raw(
          "COUNT(CASE WHEN is_snoozed = true THEN 1 END) as snoozed_count"
        ),
      ])
      .first();

    // Convert string counts to integers
    Object.keys(stats).forEach((key) => {
      stats[key] = parseInt(stats[key]) || 0;
    });

    return stats;
  }

  static async bulkUpdateFolder(emailIds, userId, folder) {
    const updateData = {
      folder,
      is_archived: folder === "archive",
    };

    if (folder === "trash") {
      updateData.deleted_at = new Date().toISOString();
    }

    const updated = await EmailUserAction.query()
      .whereIn("email_id", emailIds)
      .where("user_id", userId)
      .patch(updateData);

    return updated;
  }

  static async bulkToggleStar(emailIds, userId, isStarred) {
    const updated = await EmailUserAction.query()
      .whereIn("email_id", emailIds)
      .where("user_id", userId)
      .patch({
        is_starred: isStarred,
        starred_at: isStarred ? new Date().toISOString() : null,
      });

    return updated;
  }

  static async processSnoozeQueue() {
    // Process snoozed emails yang sudah waktunya
    const readyEmails = await EmailUserAction.query()
      .where("is_snoozed", true)
      .where("snoozed_until", "<=", new Date().toISOString());

    for (const action of readyEmails) {
      await action.unsnooze();
    }

    return readyEmails.length;
  }
}

module.exports = EmailUserAction;
