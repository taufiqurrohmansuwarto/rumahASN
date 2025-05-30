const Email = require("@/models/rasn_mail/emails.model");
const Recipient = require("@/models/rasn_mail/recipients.model");

class EmailService {
  // Send personal email
  static async sendPersonalEmail({
    senderId,
    subject,
    content,
    recipients = { to: [], cc: [], bcc: [] },
    attachments = [],
    parentId = null,
    priority = "normal",
  }) {
    return Email.createAndSend({
      priority,
      senderId,
      subject,
      content,
      recipients,
      attachments,
      type: "personal",
      parentId,
    });
  }

  // Send broadcast email
  static async sendBroadcastEmail({
    senderId,

    subject,
    content,
    broadcastGroupId,
    attachments = [],
  }) {
    return Email.createAndSend({
      senderId,
      subject,
      content,
      attachments,
      type: "broadcast",
      broadcastGroupId,
    });
  }

  // Get user's inbox
  static async getUserInbox(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "inbox",
      ...options,
    });
  }

  // Get user's sent emails
  static async getUserSentEmails(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "sent",
      ...options,
    });
  }

  // Get user's drafts
  static async getUserDrafts(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "drafts",
      ...options,
    });
  }

  // Get user's archive
  static async getUserArchive(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "archive",
      ...options,
    });
  }

  static async getUserSpam(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "spam",
      ...options,
    });
  }

  static async getUserImportant(userId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "important",
      ...options,
    });
  }

  // Get user's starred emails
  static async getUserStarred(userId, options = {}) {
    try {
      console.log(
        "Getting starred emails for user:",
        userId,
        "options:",
        options
      );

      const result = await Email.getStarredEmails(userId, options);

      console.log("Starred emails result:", {
        totalEmails: result.emails?.length || 0,
        total: result.total,
        page: result.page,
      });

      return result;
    } catch (error) {
      console.error("Error in getUserStarred:", error);

      // ✅ FALLBACK: Return empty result instead of throwing
      return {
        emails: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 25,
        totalPages: 0,
      };
    }
  }

  // Get email by ID with user context
  static async getEmailById(emailId, userId) {
    const email = await Email.query().findById(emailId).withGraphFetched(`[
        sender(simpleWithImage), 
        recipients.[user(simpleWithImage)], 
        attachments,
        parent.[sender(simpleWithImage)],
        replies.[sender(simpleWithImage)]
      ]`);

    if (!email) {
      throw new Error("Email not found");
    }

    // Check if user has access to this email
    const userRecipient = email.recipients.find(
      (r) => r.recipient_id === userId
    );
    const isSender = email.sender_id === userId;

    if (!userRecipient && !isSender) {
      throw new Error("Access denied");
    }

    // Auto mark as read if user is recipient
    if (userRecipient && !userRecipient.is_read) {
      await userRecipient.markAsRead();
    }

    const starStatus = await this.getStarStatus(emailId, userId);

    // recipients have many attributes type : to, cc, bcc
    email.recipients = {
      to: email.recipients.filter((r) => r.type === "to"),
      cc: email.recipients.filter((r) => r.type === "cc"),
      bcc: email.recipients.filter((r) => r.type === "bcc"),
    };

    email.is_starred = starStatus.is_starred;

    return email;
  }

  // Mark email as read
  static async markAsRead(emailId, userId) {
    const recipient = await Recipient.query().findOne({
      email_id: emailId,
      recipient_id: userId,
    });

    if (recipient) {
      await recipient.markAsRead();
    }

    return true;
  }

  // Mark email as unread
  static async markAsUnread(emailId, userId) {
    const recipient = await Recipient.query().findOne({
      email_id: emailId,
      recipient_id: userId,
    });

    if (recipient) {
      await recipient.markAsUnread();
    }

    return true;
  }

  // Move email to folder
  static async moveToFolder(emailId, userId, folder) {
    try {
      // Coba pakai stored function
      const result = await Email.knex().raw(
        "SELECT rasn_mail.safe_move_to_folder(?, ?, ?) as success",
        [emailId, userId, folder]
      );
      return result.rows[0].success;
    } catch (error) {
      console.error("Function failed, using fallback:", error);
      // Fallback ke update manual
      const Recipient = require("@/models/rasn_mail/recipients.model");
      const updated = await Recipient.query()
        .where("email_id", emailId)
        .where("recipient_id", userId)
        .patch({
          folder: folder,
          is_deleted: folder === "trash",
          deleted_at: folder === "trash" ? new Date() : null,
          updated_at: new Date(),
        });

      // Update archived flag jika diperlukan
      if (folder === "archive" && updated > 0) {
        await Email.query().findById(emailId).patch({ is_archived: true });
      } else if (folder !== "archive" && updated > 0) {
        // Check if any recipients still in archive
        const stillInArchive = await Recipient.query()
          .where("email_id", emailId)
          .where("folder", "archive")
          .where("is_deleted", false)
          .first();

        if (!stillInArchive) {
          await Email.query().findById(emailId).patch({ is_archived: false });
        }
      }

      return updated > 0;
    }
  }

  static async updatePriority(emailId, userId, priority) {
    const email = await Email.query()
      .where("id", emailId)
      .where("sender_id", userId)
      .first();

    if (email) {
      await email.$query().patch({ priority });
    }

    return true;
  }

  // Toggle star
  static async toggleStar(emailId, userId) {
    try {
      // First check if user is sender or recipient
      const email = await Email.query().findById(emailId);
      if (!email) {
        throw new Error("Email not found");
      }

      // Check if user is sender
      const isSender = email.sender_id === userId;

      // Check if user is recipient
      const recipient = await Recipient.query()
        .where("email_id", emailId)
        .where("recipient_id", userId)
        .first();

      if (!isSender && !recipient) {
        throw new Error("User has no access to this email");
      }

      // If user is recipient, toggle star on recipient record
      if (recipient) {
        await recipient.toggleStar();
        return {
          success: true,
          is_starred: !recipient.is_starred,
          message: !recipient.is_starred ? "Email starred" : "Email unstarred",
        };
      }

      // If user is sender but not recipient (sent email), create recipient record
      if (isSender && !recipient) {
        await Recipient.query().insert({
          email_id: emailId,
          recipient_id: userId,
          type: "to",
          is_starred: true,
          folder: "sent", // Sender sees it in sent folder
          is_read: true,
        });

        return {
          success: true,
          is_starred: true,
          message: "Email starred",
        };
      }

      throw new Error("Unable to toggle star");
    } catch (error) {
      console.error("Error toggling star:", error);
      throw error;
    }
  }

  static async getStarStatus(emailId, userId) {
    try {
      const recipient = await Recipient.query()
        .where("email_id", emailId)
        .where("recipient_id", userId)
        .first();

      return {
        success: true,
        is_starred: recipient?.is_starred || false,
      };
    } catch (error) {
      console.error("Error getting star status:", error);
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.get_unread_count(?) as count",
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // ✅ UPDATE METHOD INI untuk include semua counts
  static async getEmailStats(userId) {
    const stats = await Email.knex().raw(
      `
    SELECT 
      -- Unread count
      (SELECT COUNT(*) FROM rasn_mail.recipients r
       JOIN rasn_mail.emails e ON r.email_id = e.id
       WHERE r.recipient_id = ? AND r.folder = 'inbox'
       AND r.is_read = false AND r.is_deleted = false) as unread_count,
      
      -- Starred count  
      (SELECT COUNT(DISTINCT e.id) FROM rasn_mail.emails e
       LEFT JOIN rasn_mail.recipients r ON e.id = r.email_id
       WHERE e.is_starred = true
       AND (e.sender_id = ? OR (r.recipient_id = ? AND r.is_deleted = false))) as starred_count,
      
      -- Archive count
      (SELECT COUNT(*) FROM rasn_mail.recipients r
       WHERE r.recipient_id = ? AND r.folder = 'archive' 
       AND r.is_deleted = false) as archive_count,
      
      -- Spam count
      (SELECT COUNT(*) FROM rasn_mail.recipients r
       WHERE r.recipient_id = ? AND r.folder = 'spam'
       AND r.is_deleted = false) as spam_count,
       
      -- Draft count
      (SELECT COUNT(*) FROM rasn_mail.emails 
       WHERE sender_id = ? AND is_draft = true) as draft_count
  `,
      [userId, userId, userId, userId, userId, userId]
    );

    return stats.rows[0];
  }

  // Search emails
  static async searchEmails(userId, query, options = {}) {
    const { page = 1, limit = 25 } = options;

    const emails = await Email.query()
      .select([
        "rasn_mail.emails.*",
        "sender.username as sender_name",
        "recipients.is_read",
        "recipients.folder",
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
      .where("rasn_mail.recipients.is_deleted", false)
      .where((builder) => {
        builder.whereRaw(
          "to_tsvector('indonesian', COALESCE(rasn_mail.emails.subject, '') || ' ' || COALESCE(rasn_mail.emails.content, '')) @@ plainto_tsquery('indonesian', ?)",
          [query]
        );
      })
      .withGraphFetched("[sender, attachments]")
      .orderBy("rasn_mail.emails.created_at", "desc")
      .page(page - 1, limit);

    return emails;
  }

  // Reply to email
  static async replyToEmail(
    originalEmailId,
    senderId,
    content,
    replyAll = false
  ) {
    const originalEmail = await Email.query()
      .findById(originalEmailId)
      .withGraphFetched("recipients.[user]");

    if (!originalEmail) {
      throw new Error("Original email not found");
    }

    // Build recipients list
    const recipients = { to: [originalEmail.sender_id], cc: [], bcc: [] };

    if (replyAll) {
      // Add all original recipients except sender
      const ccUsers = originalEmail.recipients
        .filter((r) => r.recipient_id !== senderId && r.type !== "bcc")
        .map((r) => r.recipient_id);
      recipients.cc = ccUsers;
    }

    // Create reply email
    const replySubject = originalEmail.subject.startsWith("Re: ")
      ? originalEmail.subject
      : `Re: ${originalEmail.subject}`;

    return this.sendPersonalEmail({
      senderId,
      subject: replySubject,
      content,
      recipients,
      parentId: originalEmailId,
    });
  }

  // Forward email
  static async forwardEmail(originalEmailId, senderId, recipients, content) {
    const originalEmail = await Email.query()
      .findById(originalEmailId)
      .withGraphFetched("[sender, attachments]");

    if (!originalEmail) {
      throw new Error("Original email not found");
    }

    const forwardSubject = originalEmail.subject.startsWith("Fwd: ")
      ? originalEmail.subject
      : `Fwd: ${originalEmail.subject}`;

    // Include original email content in forward
    const forwardContent = `
      ${content}
      
      ---------- Forwarded message ---------
      From: ${originalEmail.sender.username} <${originalEmail.sender.email}>
      Date: ${originalEmail.created_at}
      Subject: ${originalEmail.subject}
      
      ${originalEmail.content}
    `;

    return this.sendPersonalEmail({
      senderId,
      subject: forwardSubject,
      content: forwardContent,
      recipients,
      attachments: originalEmail.attachments, // Forward attachments
      parentId: originalEmailId,
    });
  }

  // Get email thread
  static async getEmailThread(emailId) {
    const email = await Email.query().findById(emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    // Find root email
    const rootId = email.parent_id || emailId;

    // Get all emails in thread
    const threadEmails = await Email.query()
      .where((builder) => {
        builder.where("id", rootId).orWhere("parent_id", rootId);
      })
      .withGraphFetched("[sender, recipients.[user], attachments]")
      .orderBy("created_at", "asc");

    return threadEmails;
  }

  // Soft delete email (move to trash)
  static async deleteEmail(emailId, userId) {
    const email = await Email.query().findById(emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    return email.deleteForUser(userId, "trash");
  }

  // Permanent delete email
  static async permanentDeleteEmail(emailId, userId) {
    const email = await Email.query().findById(emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    return email.permanentDeleteForUser(userId);
  }

  // Restore email from trash
  static async restoreEmail(emailId, userId) {
    const email = await Email.query().findById(emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    return email.restoreForUser(userId);
  }

  // Bulk delete emails
  static async bulkDeleteEmails(emailIds, userId, permanent = false) {
    const deletionType = permanent ? "permanent" : "trash";
    return Email.bulkDelete(emailIds, userId, deletionType);
  }

  // Get user's trash
  static async getUserTrash(userId, options = {}) {
    const { page = 1, limit = 25, search = "" } = options;

    let query = Email.query()
      .select([
        "emails.*",
        "sender.username as sender_name",
        "ed.deleted_at as user_deleted_at",
        "ed.deletion_type",
      ])
      .join("public.users as sender", "emails.sender_id", "sender.custom_id")
      .join("rasn_mail.email_deletions as ed", function () {
        this.on("emails.id", "=", "ed.email_id").andOn(
          "ed.user_id",
          "=",
          Email.knex().raw("?", [userId])
        );
      })
      .where("ed.deletion_type", "trash")
      .whereNull("ed.restored_at")
      .withGraphFetched("[sender, attachments]");

    // Apply search
    if (search) {
      query = query.where(function () {
        this.where("emails.subject", "ilike", `%${search}%`)
          .orWhere("emails.content", "ilike", `%${search}%`)
          .orWhere("sender.username", "ilike", `%${search}%`);
      });
    }

    // Get total count
    const countQuery = query.clone().clearSelect().count("* as total");
    const [{ total }] = await countQuery;

    // Apply pagination
    const emails = await query
      .orderBy("ed.deleted_at", "desc")
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

  // Empty trash (permanent delete all)
  static async emptyTrash(userId) {
    const trashEmails = await Email.query()
      .join("rasn_mail.email_deletions as ed", "emails.id", "ed.email_id")
      .where("ed.user_id", userId)
      .where("ed.deletion_type", "trash")
      .whereNull("ed.restored_at")
      .pluck("emails.id");

    if (trashEmails.length === 0) {
      return 0;
    }

    return Email.bulkDelete(trashEmails, userId, "permanent");
  }

  // Auto cleanup old deleted emails (cron job)
  static async autoCleanupDeleted(daysOld = 30) {
    return Email.cleanupOldDeleted(daysOld);
  }

  // Create new draft
  static async createDraft({
    senderId,
    subject = "",
    content = "",
    recipients = { to: [], cc: [], bcc: [] },
    attachments = [],
    priority = "normal",
  }) {
    const trx = await Email.startTransaction();

    try {
      // Create draft email
      const draft = await Email.query(trx).insert({
        sender_id: senderId,
        subject,
        content,
        priority,
        is_draft: true,
        type: "personal",
      });

      // Handle recipients
      const allRecipients = [
        ...recipients.to.map((id) => ({
          email_id: draft.id,
          recipient_id: id,
          type: "to",
        })),
        ...recipients.cc.map((id) => ({
          email_id: draft.id,
          recipient_id: id,
          type: "cc",
        })),
        ...recipients.bcc.map((id) => ({
          email_id: draft.id,
          recipient_id: id,
          type: "bcc",
        })),
      ];

      if (allRecipients.length > 0) {
        const Recipient = require("@/models/rasn_mail/recipients.model");
        await Recipient.query(trx).insert(allRecipients);
      }

      // Handle attachments
      if (attachments.length > 0) {
        const Attachment = require("@/models/rasn_mail/attachments.model");
        await Attachment.query(trx)
          .whereIn("id", attachments)
          .patch({ email_id: draft.id });
      }

      await trx.commit();
      return draft;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Update existing draft
  static async updateDraft({
    draftId,
    senderId,
    subject,
    content,
    recipients,
    attachments,
    priority,
  }) {
    const trx = await Email.startTransaction();

    try {
      // Verify draft ownership
      const draft = await Email.query(trx)
        .findById(draftId)
        .where("sender_id", senderId)
        .where("is_draft", true);

      if (!draft) {
        throw new Error("Draft not found or access denied");
      }

      // Update email
      await draft.$query(trx).patch({
        subject,
        content,
        priority,
        updated_at: new Date(),
      });

      // Update recipients - delete and recreate
      const Recipient = require("@/models/rasn_mail/recipients.model");
      await Recipient.query(trx).delete().where("email_id", draftId);

      const allRecipients = [
        ...recipients.to.map((id) => ({
          email_id: draftId,
          recipient_id: id,
          type: "to",
        })),
        ...recipients.cc.map((id) => ({
          email_id: draftId,
          recipient_id: id,
          type: "cc",
        })),
        ...recipients.bcc.map((id) => ({
          email_id: draftId,
          recipient_id: id,
          type: "bcc",
        })),
      ];

      if (allRecipients.length > 0) {
        await Recipient.query(trx).insert(allRecipients);
      }

      // Update attachments
      const Attachment = require("@/models/rasn_mail/attachments.model");

      // Remove old attachments from this draft
      await Attachment.query(trx)
        .where("email_id", draftId)
        .patch({ email_id: null });

      // Attach new attachments
      if (attachments.length > 0) {
        await Attachment.query(trx)
          .whereIn("id", attachments)
          .patch({ email_id: draftId });
      }

      await trx.commit();

      // Return updated draft with relations
      return Email.query()
        .findById(draftId)
        .withGraphFetched("[recipients.[user], attachments]");
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get draft by ID
  static async getDraftById(draftId, userId) {
    const draft = await Email.query()
      .findById(draftId)
      .where("sender_id", userId)
      .where("is_draft", true)
      .withGraphFetched("[recipients.[user], attachments]");

    if (!draft) {
      throw new Error("Draft not found or access denied");
    }

    return draft;
  }

  // Delete draft
  static async deleteDraft(draftId, userId) {
    const trx = await Email.startTransaction();

    try {
      // Verify ownership
      const draft = await Email.query(trx)
        .findById(draftId)
        .where("sender_id", userId)
        .where("is_draft", true);

      if (!draft) {
        throw new Error("Draft not found or access denied");
      }

      // Delete related data (cascading will handle most, but let's be explicit)
      const Attachment = require("@/models/rasn_mail/attachments.model");
      const Recipient = require("@/models/rasn_mail/recipients.model");

      await Attachment.query(trx).delete().where("email_id", draftId);
      await Recipient.query(trx).delete().where("email_id", draftId);
      await Email.query(trx).deleteById(draftId);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Send draft (convert to sent email)
  static async sendDraft(draftId, userId) {
    const trx = await Email.startTransaction();

    try {
      // Get draft with recipients
      const draft = await Email.query(trx)
        .findById(draftId)
        .where("sender_id", userId)
        .where("is_draft", true)
        .withGraphFetched("[recipients]");

      if (!draft) {
        throw new Error("Draft not found or access denied");
      }

      if (draft.recipients.length === 0) {
        throw new Error("Cannot send draft without recipients");
      }

      // Convert draft to sent email
      await draft.$query(trx).patch({
        is_draft: false,
        sent_at: new Date(),
        updated_at: new Date(),
      });

      // Log activity
      await this.logEmailActivity(userId, "send", draftId);

      await trx.commit();

      return draft;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // ✅ TAMBAHKAN METHOD INI
  static async getUserLabelEmails(userId, labelId, options = {}) {
    return Email.getUserEmails({
      userId,
      folder: "label",
      labelId, // Pass labelId as option
      ...options,
    });
  }

  // Auto-save draft (debounced)
  static async autoSaveDraft(draftData) {
    try {
      if (draftData.id) {
        return await this.updateDraft(draftData);
      } else {
        return await this.createDraft(draftData);
      }
    } catch (error) {
      console.error("Auto-save draft error:", error);
      // Don't throw error for auto-save to avoid interrupting user
      return null;
    }
  }
}

module.exports = EmailService;
