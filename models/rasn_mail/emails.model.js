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

  async getStarStatusForUser(userId) {
    const Recipient = require("@/models/rasn_mail/recipients.model");
    return await Recipient.getStarStatus(this.id, userId);
  }

  // ✅ NEW: Method untuk toggle star for specific user
  async toggleStarForUser(userId) {
    const Recipient = require("@/models/rasn_mail/recipients.model");
    return await Recipient.toggleStarForUser(this.id, userId);
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
            is_starred: false,
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
            is_starred: false,
          })),
          ...cc.map((id) => ({
            email_id: email.id,
            recipient_id: id,
            type: "cc",
            is_starred: false,
          })),
          ...bcc.map((id) => ({
            email_id: email.id,
            recipient_id: id,
            type: "bcc",
            is_starred: false,
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
    labelId = null,
  }) {
    // ✅ PERBAIKAN: Pisahkan query untuk count dan data untuk menghindari masalah JOIN

    // 1. Buat base query tanpa relations
    let baseQuery = Email.query().join(
      "public.users as sender",
      "rasn_mail.emails.sender_id",
      "sender.custom_id"
    );

    // 2. Apply folder logic ke base query
    if (folder === "inbox") {
      baseQuery = baseQuery
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "inbox")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);
    } else if (folder === "sent") {
      baseQuery = baseQuery
        .where("rasn_mail.emails.sender_id", userId)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false)
        .where((builder) => {
          // Email benar-benar sudah dikirim (tidak dihapus dengan cara apapun oleh sender)
          builder.whereNotExists((subBuilder) => {
            subBuilder
              .select(1)
              .from("rasn_mail.email_deletions as ed")
              .whereRaw("ed.email_id = rasn_mail.emails.id")
              .where("ed.user_id", userId)
              .whereIn("ed.deletion_type", ["trash", "permanent"])
              .whereNull("ed.restored_at");
          });
        });
    } else if (folder === "drafts") {
      baseQuery = baseQuery
        .where("rasn_mail.emails.sender_id", userId)
        .where("rasn_mail.emails.is_draft", true)
        .where("rasn_mail.emails.is_deleted", false);
    } else if (folder === "starred") {
      return this.getStarredEmails(userId, { page, limit, search, unreadOnly });
    } else if (folder === "archive") {
      baseQuery = baseQuery
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "archive")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);
    } else if (folder === "spam") {
      baseQuery = baseQuery
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.folder", "spam")
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);
    } else if (folder === "label") {
      if (!labelId) {
        throw new Error("Label ID required for label folder");
      }

      baseQuery = baseQuery
        .join(
          "rasn_mail.email_labels as el",
          "rasn_mail.emails.id",
          "el.email_id"
        )
        .where("el.label_id", labelId)
        .where("el.user_id", userId)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false)
        .where((builder) => {
          builder
            .where("rasn_mail.emails.sender_id", userId)
            .orWhereExists((subBuilder) => {
              subBuilder
                .select(1)
                .from("rasn_mail.recipients as r")
                .whereRaw("r.email_id = rasn_mail.emails.id")
                .where("r.recipient_id", userId)
                .where("r.is_deleted", false);
            });
        });
    } else if (folder === "trash") {
      baseQuery = baseQuery
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
          builder
            .where((subBuilder) => {
              // Email di trash sebagai recipient
              subBuilder
                .where("rasn_mail.recipients.recipient_id", userId)
                .where("rasn_mail.recipients.folder", "trash")
                .where("rasn_mail.recipients.is_deleted", true);
            })
            .orWhere((subBuilder) => {
              // ATAU email di trash berdasarkan email_deletions
              subBuilder
                .where("ed.user_id", userId)
                .where("ed.deletion_type", "trash")
                .whereNull("ed.restored_at");
            });
        });
    } else if (folder === "important") {
      baseQuery = baseQuery
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
            .where("rasn_mail.emails.sender_id", userId)
            .orWhereExists((subBuilder) => {
              subBuilder
                .select(1)
                .from("rasn_mail.recipients as r")
                .whereRaw("r.email_id = rasn_mail.emails.id")
                .where("r.recipient_id", userId)
                .whereNotIn("r.folder", ["trash", "spam"])
                .where("r.is_deleted", false);
            });
        })
        .where((builder) => {
          builder
            .where("rasn_mail.emails.priority", "high")
            .orWhere("l.name", "important");
        })
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);
    }

    // 3. Apply search filter
    if (search) {
      baseQuery = baseQuery.where((builder) => {
        builder
          .where("rasn_mail.emails.subject", "ilike", `%${search}%`)
          .orWhere("rasn_mail.emails.content", "ilike", `%${search}%`)
          .orWhere("sender.username", "ilike", `%${search}%`);
      });
    }

    // 4. Apply unread filter - hanya untuk folder yang relevan
    if (unreadOnly && ["inbox", "archive", "spam"].includes(folder)) {
      baseQuery = baseQuery.where("rasn_mail.recipients.is_read", false);
    }

    // ✅ KHUSUS: Handle unread filter untuk sent emails menggunakan subquery
    if (unreadOnly && folder === "sent") {
      baseQuery = baseQuery.whereExists((subBuilder) => {
        subBuilder
          .select(1)
          .from("rasn_mail.recipients as r")
          .whereRaw("r.email_id = rasn_mail.emails.id")
          .where("r.is_read", false);
      });
    }

    // ✅ PERBAIKAN: Count dengan DISTINCT untuk menghindari duplicate dari JOIN
    const countQuery = baseQuery
      .clone()
      .clearSelect()
      .countDistinct("rasn_mail.emails.id as total")
      .first();

    const { total } = await countQuery;

    // ✅ PERBAIKAN: Data query dengan proper select dan distinct + recipient info
    let selectColumns = [
      "rasn_mail.emails.*",
      "sender.username as sender_name",
      "sender.email as sender_email",
      "sender.image as sender_image",
    ];

    // ✅ TAMBAHAN: Include recipient info untuk folder yang membutuhkan
    if (["inbox", "archive", "spam", "trash"].includes(folder)) {
      selectColumns.push(
        "rasn_mail.recipients.is_read",
        "rasn_mail.recipients.read_at",
        "rasn_mail.recipients.folder as recipient_folder",
        "rasn_mail.recipients.is_deleted as recipient_deleted"
      );
    }

    const dataQuery = baseQuery
      .clone()
      .select(selectColumns)
      .distinct("rasn_mail.emails.id", "rasn_mail.emails.created_at") // Include order by columns in distinct
      .orderBy("rasn_mail.emails.created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    // Get email IDs and basic info
    const emailResults = await dataQuery;
    const emailIds = emailResults.map((email) => email.id);

    // ✅ PERBAIKAN: Fetch full email data dengan relations secara terpisah
    const emails =
      emailIds.length > 0
        ? await Email.query()
            .whereIn("id", emailIds)
            .withGraphFetched(
              "[attachments, recipients.[user(simpleWithImage)]]"
            )
            .orderBy("created_at", "desc")
        : [];

    // ✅ PERBAIKAN: Merge basic info + recipient status dari join query dengan full data
    const finalEmails = emails.map((email) => {
      const basicInfo = emailResults.find((r) => r.id === email.id);

      // Merge recipient status untuk folder yang relevant
      let mergedEmail = {
        ...email,
        sender_name: basicInfo?.sender_name,
        sender_email: basicInfo?.sender_email,
        sender_image: basicInfo?.sender_image,
      };

      // ✅ TAMBAHAN: Set recipient status dari join query untuk current user
      if (["inbox", "archive", "spam", "trash"].includes(folder) && basicInfo) {
        mergedEmail.is_read = basicInfo.is_read;
        mergedEmail.read_at = basicInfo.read_at;
        mergedEmail.recipient_folder = basicInfo.recipient_folder;
        mergedEmail.recipient_deleted = basicInfo.recipient_deleted;
      } else if (folder === "sent") {
        // ✅ KHUSUS UNTUK SENT: Tambahkan delivery information
        const recipients = email.recipients || [];
        const totalRecipients = recipients.length;
        const readCount = recipients.filter((r) => r.is_read).length;
        const unreadCount = totalRecipients - readCount;

        mergedEmail.delivery_status = {
          total_recipients: totalRecipients,
          read_count: readCount,
          unread_count: unreadCount,
          read_percentage:
            totalRecipients > 0
              ? Math.round((readCount / totalRecipients) * 100)
              : 0,
        };

        // Untuk sent emails, is_read menunjukkan apakah SEMUA recipient sudah baca
        mergedEmail.is_read = unreadCount === 0 && totalRecipients > 0;
        mergedEmail.read_at = email.sent_at || email.created_at;
        mergedEmail.recipient_folder = folder;
        mergedEmail.recipient_deleted = false;
      } else if (["drafts"].includes(folder)) {
        // ✅ TAMBAHAN: Untuk drafts, set default values karena tidak ada recipient info
        mergedEmail.is_read = true; // Draft emails are considered "read" by sender
        mergedEmail.read_at = email.created_at;
        mergedEmail.recipient_folder = folder;
        mergedEmail.recipient_deleted = false;
      }

      return mergedEmail;
    });

    return {
      emails: finalEmails,
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

  // ✅ TAMBAHKAN METHOD INI
  static async getStarredEmails(userId, options = {}) {
    const { page = 1, limit = 25, search = "" } = options;
    const offset = (page - 1) * limit;

    try {
      // ✅ STEP 1: Get count dengan query yang benar
      let countQuery = Email.query()
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.is_starred", true)
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);

      // Apply search filter untuk count
      if (search) {
        countQuery = countQuery
          .join(
            "public.users as sender",
            "rasn_mail.emails.sender_id",
            "sender.custom_id"
          )
          .where((builder) => {
            builder
              .where("rasn_mail.emails.subject", "ilike", `%${search}%`)
              .orWhere("rasn_mail.emails.content", "ilike", `%${search}%`)
              .orWhere("sender.username", "ilike", `%${search}%`);
          });
      }

      // ✅ FIX: Use proper count without DISTINCT issues
      const { count: total } = await countQuery
        .count("rasn_mail.emails.id as count")
        .first();

      // ✅ STEP 2: Get actual data dengan query terpisah
      let dataQuery = Email.query()
        .select([
          "rasn_mail.emails.*",
          "sender.username as sender_name",
          "sender.email as sender_email",
          "sender.image as sender_image",
          "recipients.is_read",
          "recipients.read_at",
          "recipients.folder as recipient_folder",
          "recipients.is_deleted as recipient_deleted",
          "recipients.is_starred",
        ])
        .join(
          "public.users as sender",
          "rasn_mail.emails.sender_id",
          "sender.custom_id"
        )
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.is_starred", true)
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false);

      // Apply search filter
      if (search) {
        dataQuery = dataQuery.where((builder) => {
          builder
            .where("rasn_mail.emails.subject", "ilike", `%${search}%`)
            .orWhere("rasn_mail.emails.content", "ilike", `%${search}%`)
            .orWhere("sender.username", "ilike", `%${search}%`);
        });
      }

      // Get basic email data
      const emailResults = await dataQuery
        .orderBy("rasn_mail.emails.created_at", "desc")
        .limit(limit)
        .offset(offset);

      // ✅ STEP 3: Get email IDs and fetch dengan relations
      const emailIds = emailResults.map((email) => email.id);

      let emails = [];
      if (emailIds.length > 0) {
        emails = await Email.query()
          .whereIn("id", emailIds)
          .withGraphFetched("[attachments, recipients.[user(simpleWithImage)]]")
          .orderBy("created_at", "desc");

        // ✅ STEP 4: Merge basic data dengan relations
        emails = emails.map((email) => {
          const basicInfo = emailResults.find((r) => r.id === email.id);
          return {
            ...email,
            sender_name: basicInfo?.sender_name,
            sender_email: basicInfo?.sender_email,
            sender_image: basicInfo?.sender_image,
            is_read: basicInfo?.is_read,
            read_at: basicInfo?.read_at,
            recipient_folder: basicInfo?.recipient_folder,
            recipient_deleted: basicInfo?.recipient_deleted,
            is_starred: basicInfo?.is_starred, // ✅ Include star status
          };
        });
      }

      return {
        emails,
        total: parseInt(total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total) / limit),
      };
    } catch (error) {
      console.error("Error in getStarredEmails:", error);

      // ✅ FALLBACK: Simple query jika ada error
      const fallbackQuery = Email.query()
        .select("rasn_mail.emails.*")
        .join(
          "rasn_mail.recipients",
          "rasn_mail.emails.id",
          "rasn_mail.recipients.email_id"
        )
        .where("rasn_mail.recipients.recipient_id", userId)
        .where("rasn_mail.recipients.is_starred", true)
        .where("rasn_mail.recipients.is_deleted", false)
        .where("rasn_mail.emails.is_draft", false)
        .withGraphFetched(
          "[sender, attachments, recipients.[user(simpleWithImage)]]"
        )
        .orderBy("rasn_mail.emails.created_at", "desc")
        .page(page - 1, limit);

      const result = await fallbackQuery;

      // Add star status untuk fallback
      const emails = result.results.map((email) => ({
        ...email,
        is_starred: true, // Karena sudah di-filter dari starred
      }));

      return {
        emails,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      };
    }
  }

  // ✅ TAMBAHKAN FALLBACK METHOD
  static async getUserEmailsFallback(userId, folder, options = {}) {
    const { page = 1, limit = 25, search = "" } = options;

    if (folder === "starred") {
      let query = Email.query()
        .select([
          "rasn_mail.emails.*",
          "sender.username as sender_name",
          "sender.email as sender_email",
          "sender.image as sender_image",
        ])
        .join(
          "public.users as sender",
          "rasn_mail.emails.sender_id",
          "sender.custom_id"
        )
        .where("rasn_mail.emails.is_starred", true)
        .where("rasn_mail.emails.is_draft", false)
        .where("rasn_mail.emails.is_deleted", false)
        .where((builder) => {
          builder
            .where("rasn_mail.emails.sender_id", userId)
            .orWhereExists((subBuilder) => {
              subBuilder
                .select(1)
                .from("rasn_mail.recipients as r")
                .whereRaw("r.email_id = rasn_mail.emails.id")
                .where("r.recipient_id", userId)
                .where("r.is_deleted", false);
            });
        })
        .withGraphFetched("[attachments, recipients.[user(simpleWithImage)]]");

      if (search) {
        query = query.where((builder) => {
          builder
            .where("rasn_mail.emails.subject", "ilike", `%${search}%`)
            .orWhere("rasn_mail.emails.content", "ilike", `%${search}%`)
            .orWhere("sender.username", "ilike", `%${search}%`);
        });
      }

      const totalQuery = query
        .clone()
        .clearSelect()
        .count("* as total")
        .first();
      const { total } = await totalQuery;

      const emails = await query
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

    // Untuk folder lain, gunakan method getUserEmails biasa
    return this.getUserEmails({ userId, folder, ...options });
  }
}

module.exports = Email;
