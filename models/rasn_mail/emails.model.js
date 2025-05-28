const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Email extends Model {
  static get tableName() {
    return "rasn_mail.emails";
  }

  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get virtualAttributes() {
    return ["attachment_count", "is_unread"];
  }

  attachment_count() {
    return this.attachments ? this.attachments.length : 0;
  }

  is_unread() {
    if (this.recipients && this.recipients.length > 0) {
      return this.recipients.some((r) => !r.is_read);
    }
    return false;
  }

  // Method untuk send email
  async send() {
    if (this.is_draft) {
      await this.$query().patch({
        is_draft: false,
        sent_at: new Date().toISOString(),
      });
    }
    return this;
  }

  // Method untuk mark as starred
  async toggleStar(userId) {
    return this.$query().patch({
      is_starred: !this.is_starred,
    });
  }

  // Static method untuk create dan send email
  static async createAndSend({
    senderId,
    subject,
    content,
    recipients = { to: [], cc: [], bcc: [] },
    attachments = [],
    priority = "normal",
    type = "personal",
    broadcastGroupId = null,
    parentId = null,
  }) {
    const trx = await Email.startTransaction();

    try {
      // 1. Create email
      const email = await Email.query(trx).insert({
        sender_id: senderId,
        subject,
        content,
        type,
        priority,
        parent_id: parentId,
        thread_subject: parentId ? null : subject,
        is_draft: false,
        sent_at: new Date().toISOString(),
      });

      // 2. Handle recipients
      let allRecipients = [];

      if (type === "broadcast" && broadcastGroupId) {
        // Get broadcast recipients
        const BroadcastGroup = require("@/models/rasn_mail/broadcast-groups.model");
        const broadcastUsers = await BroadcastGroup.query(trx)
          .findById(broadcastGroupId)
          .withGraphFetched("members");

        if (broadcastUsers && broadcastUsers.members) {
          allRecipients = broadcastUsers.members.map((member) => ({
            email_id: email.id,
            recipient_id: member.user_id,
            type: "to",
          }));
        }
      } else {
        // Personal email recipients
        const { to = [], cc = [], bcc = [] } = recipients;
        allRecipients = [
          ...to.map((id) => ({
            email_id: email.id,
            recipient_id: id,
            type: "to",
          })),
          ...cc.map((id) => ({
            email_id: email.id,
            recipient_id: id,
            type: "cc",
          })),
          ...bcc.map((id) => ({
            email_id: email.id,
            recipient_id: id,
            type: "bcc",
          })),
        ];
      }

      // 3. Insert recipients
      if (allRecipients.length > 0) {
        const Recipient = require("@/models/rasn_mail/recipients.model");
        await Recipient.query(trx).insert(allRecipients);
      }

      // 4. Handle attachments
      if (attachments.length > 0) {
        const Attachment = require("@/models/rasn_mail/attachments.model");
        const attachmentRecords = attachments.map((att) => ({
          email_id: email.id,
          file_name: att.file_name,
          file_url: att.file_url,
          file_size: att.file_size,
          mime_type: att.mime_type,
        }));
        await Attachment.query(trx).insert(attachmentRecords);
      }

      await trx.commit();
      return email;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const Recipient = require("@/models/rasn_mail/recipients.model");
    const Attachment = require("@/models/rasn_mail/attachments.model");
    const EmailLabel = require("@/models/rasn_mail/email-labels.model");

    return {
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.emails.sender_id",
          to: "users.custom_id",
        },
      },
      recipients: {
        relation: Model.HasManyRelation,
        modelClass: Recipient,
        join: {
          from: "rasn_mail.emails.id",
          to: "rasn_mail.recipients.email_id",
        },
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: Attachment,
        join: {
          from: "rasn_mail.emails.id",
          to: "rasn_mail.attachments.email_id",
        },
      },
      emailLabels: {
        relation: Model.HasManyRelation,
        modelClass: EmailLabel,
        join: {
          from: "rasn_mail.emails.id",
          to: "rasn_mail.email_labels.email_id",
        },
      },
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.emails.parent_id",
          to: "rasn_mail.emails.id",
        },
      },
      replies: {
        relation: Model.HasManyRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.emails.id",
          to: "rasn_mail.emails.parent_id",
        },
      },
    };
  }

  // Static method untuk get user emails (inbox, sent, etc)
  static async getUserEmails({
    userId,
    folder = "inbox",
    page = 1,
    limit = 25,
    search = "",
    unreadOnly = false,
  }) {
    let query = Email.query()
      .select([
        "rasn_mail.emails.*",
        "sender.username as sender_name",
        "sender.email as sender_email",
        "sender.image as sender_image",
        // Untuk inbox/archive/spam/trash - ambil data dari recipients
        "recipients.is_read",
        "recipients.read_at",
        "recipients.folder",
        "recipients.is_deleted",
      ])
      .join(
        "public.users as sender",
        "rasn_mail.emails.sender_id",
        "sender.custom_id"
      )
      .withGraphFetched("[attachments, recipients.[user(simpleWithImage)]]");

    // Apply folder logic
    if (folder === "inbox") {
      query = query
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "inbox")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false);
    } else if (folder === "sent") {
      // Untuk sent, tidak perlu recipients data kecuali untuk counting
      query = query
        .leftJoin(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.emails.sender_id", userId)
        .where("rasn_mail.emails.is_draft", false);
    } else if (folder === "drafts") {
      query = query
        .leftJoin(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.emails.sender_id", userId)
        .where("rasn_mail.emails.is_draft", true);
    } else if (folder === "starred") {
      // ✅ FIXED: Starred emails dari semua folder (inbox, sent, archive)
      query = query.where((builder) => {
        // Email yang di-star dan user adalah sender
        builder
          .where((subBuilder) => {
            subBuilder
              .where("rasn_mail.emails.sender_id", userId)
              .where("rasn_mail.emails.is_starred", true);
          })
          // ATAU email yang di-star dan user adalah recipient
          .orWhere((subBuilder) => {
            subBuilder
              .join(
                "rasn_mail.recipients as star_recipients",
                "rasn_mail.emails.id",
                "star_recipients.email_id"
              )
              .where("star_recipients.recipient_id", userId)
              .where("rasn_mail.emails.is_starred", true)
              .where("star_recipients.is_deleted", false);
          });
      });
    } else if (folder === "archive") {
      // ✅ FIXED: Archive berdasarkan recipients.folder
      query = query
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "archive")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false);
    } else if (folder === "spam") {
      // ✅ FIXED: Spam berdasarkan recipients.folder
      query = query
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "spam")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false);
    } else if (folder === "trash") {
      // ✅ FIXED: Trash berdasarkan recipients.is_deleted atau email_deletions
      query = query
        .leftJoin(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .leftJoin("rasn_mail.email_deletions as ed", function () {
          this.on("rasn_mail.emails.id", "=", "ed.email_id").andOn(
            "ed.user_id",
            "=",
            Email.knex().raw("?", [userId])
          );
        })
        .where((builder) => {
          // Email di trash sebagai recipient
          builder
            .where((subBuilder) => {
              subBuilder
                .where("rasn_mail.recipients.recipient_id", userId)
                .where("rasn_mail.recipients.folder", "trash")
                .where("rasn_mail.recipients.is_deleted", true);
            })
            // ATAU email di trash berdasarkan email_deletions
            .orWhere((subBuilder) => {
              subBuilder
                .where("ed.user_id", userId)
                .where("ed.deletion_type", "trash")
                .whereNull("ed.restored_at");
            });
        });
    } else if (folder === "important") {
      // Email dengan priority high atau dengan label "important"
      query = query
        .leftJoin(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .leftJoin(
          "rasn_mail.email_labels as el",
          "rasn_mail.emails.id",
          "el.email_id"
        )
        .leftJoin("rasn_mail.labels as l", function () {
          this.on("el.label_id", "=", "l.id").andOn(
            "l.name",
            "=",
            Email.knex().raw("?", ["important"])
          );
        })
        .where((builder) => {
          builder
            .where((subBuilder) => {
              // User sebagai recipient dan folder bukan trash/spam
              subBuilder
                .where("rasn_mail.recipients.recipient_id", userId)
                .whereNotIn("rasn_mail.recipients.folder", ["trash", "spam"])
                .where("rasn_mail.recipients.is_deleted", false);
            })
            .orWhere("rasn_mail.emails.sender_id", userId);
        })
        .where((builder) => {
          // Priority tinggi ATAU label important
          builder
            .where("rasn_mail.emails.priority", "high")
            .orWhere("l.name", "important");
        })
        .where("rasn_mail.emails.is_draft", false);
    }

    // Apply search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("rasn_mail.emails.subject", "ilike", `%${search}%`)
          .orWhere("rasn_mail.emails.content", "ilike", `%${search}%`)
          .orWhere("sender.username", "ilike", `%${search}%`);
      });
    }

    // Apply unread filter - hanya untuk folder yang relevan
    if (unreadOnly && ["inbox", "archive", "spam"].includes(folder)) {
      query = query.where("rasn_mail.recipients.is_read", false);
    }

    // Get total count
    const totalQuery = query.clone().clearSelect().count("* as total").first();
    const { total } = await totalQuery;

    // Apply pagination and sorting
    const emails = await query
      .distinct("rasn_mail.emails.id") // Avoid duplicates from joins
      .orderBy("rasn_mail.emails.created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      emails,
      total: parseInt(total),
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Check if email is deleted for specific user
  async isDeletedForUser(userId) {
    const EmailDeletion = require("@/models/rasn_mail/email-deletions.model");
    const deletion = await EmailDeletion.query()
      .findOne({
        email_id: this.id,
        user_id: userId,
      })
      .where("restored_at", null);

    return !!deletion;
  }

  // Soft delete for user
  async deleteForUser(userId, deletionType = "soft") {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.delete_email_for_user(?, ?, ?) as success",
      [this.id, userId, deletionType]
    );
    return result.rows[0].success;
  }

  // Restore for user
  async restoreForUser(userId) {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.restore_email_for_user(?, ?) as success",
      [this.id, userId]
    );
    return result.rows[0].success;
  }

  // Permanent delete
  async permanentDeleteForUser(userId) {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.permanent_delete_email(?, ?) as success",
      [this.id, userId]
    );
    return result.rows[0].success;
  }

  // Static method untuk bulk delete
  static async bulkDelete(emailIds, userId, deletionType = "soft") {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.bulk_delete_emails(?, ?, ?) as count",
      [emailIds, userId, deletionType]
    );
    return parseInt(result.rows[0].count);
  }

  // Static method untuk cleanup old deleted emails
  static async cleanupOldDeleted(daysOld = 30) {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.cleanup_old_deleted_emails(?) as count",
      [daysOld]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Email;
