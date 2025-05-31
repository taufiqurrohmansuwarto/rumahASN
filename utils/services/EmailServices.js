const EmailUserAction = require("@/models/rasn_mail/email-user-actions.model");
const Email = require("@/models/rasn_mail/emails.model");
const Recipient = require("@/models/rasn_mail/recipients.model");

class EmailService {
  // Get email thread (conversation)
  static async getEmailThread(emailId, userId) {
    try {
      // 1. Get current email
      const currentEmail = await Email.query()
        .findById(emailId)
        .withGraphFetched("[sender, recipients.[user]]");

      if (!currentEmail) {
        throw new Error("Email not found");
      }

      // 2. Find root email (original email in thread)
      const rootId = currentEmail.parent_id || emailId;

      // 3. Get all emails in thread (root + all replies)
      // ✅ FIXED: Handle self-send dengan DISTINCT dan proper JOIN
      const threadEmails = await Email.query()
        .distinct("rasn_mail.emails.id")
        .select([
          "rasn_mail.emails.*",
          "eua.is_read",
          "eua.is_starred",
          "eua.folder as user_folder",
        ])
        .where((builder) => {
          builder
            .where("rasn_mail.emails.id", rootId) // Root email
            .orWhere("rasn_mail.emails.parent_id", rootId) // Direct replies to root
            .orWhereExists((subBuilder) => {
              // Nested replies
              subBuilder
                .select(1)
                .from("rasn_mail.emails as parent")
                .whereRaw("parent.parent_id = ?", [rootId])
                .whereRaw("rasn_mail.emails.parent_id = parent.id");
            });
        })
        .leftJoin("rasn_mail.email_user_actions as eua", function () {
          this.on("rasn_mail.emails.id", "=", "eua.email_id").andOn(
            "eua.user_id",
            "=",
            Email.knex().raw("?", [userId])
          );
        })
        // ✅ FIXED: Filter permanently deleted, tapi allow missing user actions
        .where(function () {
          this.whereNull("eua.permanently_deleted").orWhere(
            "eua.permanently_deleted",
            false
          );
        })
        .withGraphFetched(
          `[
          sender(simpleWithImage), 
          recipients.[user(simpleWithImage)], 
          attachments
        ]`
        )
        .orderBy("rasn_mail.emails.created_at", "asc"); // Chronological order

      // ✅ SAFETY CHECK: Pastikan ada hasil
      if (!threadEmails || threadEmails.length === 0) {
        // Fallback ke single email
        return {
          success: true,
          data: {
            current_email_id: emailId,
            root_email_id: emailId,
            thread_count: 1,
            thread_emails: [this.serializeRecipients({ ...currentEmail })],
            thread_subject: currentEmail.thread_subject || currentEmail.subject,
          },
        };
      }

      // 4. Build thread structure
      const threadStructure = this.buildThreadStructure(threadEmails);

      // ✅ NEW: Serialize recipients untuk semua email dalam thread
      const serializedThreadStructure =
        this.serializeThreadEmails(threadStructure);

      // 5. Mark thread as read (optional, dengan error handling)
      try {
        await this.markThreadAsRead(
          threadEmails.map((e) => e.id),
          userId
        );
      } catch (markReadError) {
        console.warn("Could not mark thread as read:", markReadError);
        // Continue without failing
      }

      return {
        success: true,
        data: {
          current_email_id: emailId,
          root_email_id: rootId,
          thread_count: threadEmails.length,
          thread_emails: serializedThreadStructure,
          thread_subject: currentEmail.thread_subject || currentEmail.subject,
        },
      };
    } catch (error) {
      console.error("Error getting email thread:", error);
      throw error;
    }
  }

  // Build hierarchical thread structure
  static buildThreadStructure(emails) {
    // Create map for easy lookup
    const emailMap = {};
    emails.forEach((email) => {
      emailMap[email.id] = {
        ...email,
        replies: [],
      };
    });

    // Build hierarchy
    const rootEmails = [];
    emails.forEach((email) => {
      if (email.parent_id && emailMap[email.parent_id]) {
        // This is a reply, add to parent's replies
        emailMap[email.parent_id].replies.push(emailMap[email.id]);
      } else {
        // This is root email or orphaned email
        rootEmails.push(emailMap[email.id]);
      }
    });

    return rootEmails;
  }

  // Mark entire thread as read
  static async markThreadAsRead(emailIds, userId) {
    try {
      await EmailUserAction.query()
        .whereIn("email_id", emailIds)
        .where("user_id", userId)
        .where("is_read", false)
        .patch({
          is_read: true,
          read_at: new Date(),
          updated_at: new Date(),
        });

      return true;
    } catch (error) {
      console.error("Error marking thread as read:", error);
      return false;
    }
  }

  // Reply to email (with threading)
  static async replyToEmail({
    originalEmailId,
    senderId,
    subject,
    content,
    recipients,
    replyAll = false,
    attachments = [],
  }) {
    try {
      // Get original email untuk threading info
      const originalEmail = await Email.query()
        .findById(originalEmailId)
        .withGraphFetched("[recipients.[user]]");

      if (!originalEmail) {
        throw new Error("Original email not found");
      }

      // Determine thread root
      const threadRootId = originalEmail.parent_id || originalEmailId;

      // Build recipients untuk reply
      let replyRecipients = { to: [], cc: [], bcc: [] };

      if (replyAll) {
        // Reply All: include original sender + all recipients except current user
        const allOriginalRecipients = [
          originalEmail.sender_id,
          ...originalEmail.recipients
            .filter((r) => r.type !== "bcc") // Don't include BCC in reply all
            .map((r) => r.recipient_id),
        ].filter((id) => id !== senderId); // Exclude current user

        replyRecipients.to = [originalEmail.sender_id];
        replyRecipients.cc = allOriginalRecipients.filter(
          (id) => id !== originalEmail.sender_id
        );
      } else {
        // Regular Reply: only to original sender
        replyRecipients.to = [originalEmail.sender_id];
      }

      // Override recipients if provided
      if (recipients) {
        replyRecipients = recipients;
      }

      // Create reply email dengan threading
      const replyEmail = await Email.createAndSend({
        senderId,
        subject:
          subject ||
          (originalEmail.subject.startsWith("Re: ")
            ? originalEmail.subject
            : `Re: ${originalEmail.subject}`),
        content,
        recipients: replyRecipients,
        attachments,
        type: "personal",
        parentId: originalEmailId, // ✅ Link to original email
        priority: originalEmail.priority || "normal",
      });

      return {
        success: true,
        data: replyEmail,
        message: "Reply sent successfully",
        thread_root_id: threadRootId,
      };
    } catch (error) {
      console.error("Error sending reply:", error);
      throw error;
    }
  }

  // Helper method untuk serialize recipients
  static serializeRecipients(email) {
    if (email.recipients && Array.isArray(email.recipients)) {
      email.recipients = {
        to: email.recipients.filter((r) => r.type === "to"),
        cc: email.recipients.filter((r) => r.type === "cc"),
        bcc: email.recipients.filter((r) => r.type === "bcc"),
      };
    }
    return email;
  }

  // Helper method untuk serialize recipients dalam thread
  static serializeThreadEmails(threadEmails) {
    if (!threadEmails || !Array.isArray(threadEmails)) {
      return threadEmails;
    }

    return threadEmails.map((email) => {
      // Serialize recipients untuk email utama
      this.serializeRecipients(email);

      // Serialize recipients untuk replies (jika ada)
      if (email.replies && Array.isArray(email.replies)) {
        email.replies = this.serializeThreadEmails(email.replies);
      }

      return email;
    });
  }

  // Get email with thread context
  static async getEmailWithThread(emailId, userId) {
    try {
      // Get email detail
      const email = await this.getEmailById(emailId, userId);

      // Get thread if this email is part of one
      const threadResult = await this.getEmailThread(emailId, userId);

      // ✅ FIXED: Safe access dengan fallback
      const threadData = threadResult?.data || {
        current_email_id: emailId,
        root_email_id: emailId,
        thread_count: 1,
        thread_emails: [email],
        thread_subject: email.subject,
      };

      // ✅ NEW: Serialize recipients untuk semua email dalam thread
      if (threadData.thread_emails) {
        threadData.thread_emails = this.serializeThreadEmails(
          threadData.thread_emails
        );
      }

      return {
        success: true,
        data: {
          email,
          thread: threadData,
          has_thread: threadData.thread_count > 1,
        },
      };
    } catch (error) {
      console.error("Error getting email with thread:", error);

      // ✅ FALLBACK: Return email without thread on error
      try {
        const email = await this.getEmailById(emailId, userId);
        return {
          success: true,
          data: {
            email,
            thread: {
              current_email_id: emailId,
              root_email_id: emailId,
              thread_count: 1,
              thread_emails: [this.serializeRecipients({ ...email })],
              thread_subject: email.subject,
            },
            has_thread: false,
          },
        };
      } catch (fallbackError) {
        throw error; // Throw original error
      }
    }
  }

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
    return Email.getUserEmails({
      userId,
      folder: "starred",
      ...options,
    });
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
    try {
      // Get or create user action record
      const userAction = await EmailUserAction.getOrCreateForUser(
        emailId,
        userId,
        {
          folder: "inbox",
          is_read: false,
          is_starred: false,
        }
      );

      // Only update if currently unread
      if (!userAction.is_read) {
        await userAction.$query().patch({
          is_read: true,
          read_at: new Date(),
          updated_at: new Date(),
        });
      }

      return {
        success: true,
        message: "Email marked as read",
        was_unread: !userAction.is_read,
      };
    } catch (error) {
      console.error("Error marking email as read:", error);
      throw new Error("Failed to mark email as read");
    }
  }

  // Mark email as unread
  static async markAsUnread(emailId, userId) {
    try {
      // Get existing user action record
      const userAction = await EmailUserAction.query()
        .where({
          email_id: emailId,
          user_id: userId,
          permanently_deleted: false,
        })
        .first();

      if (!userAction) {
        throw new Error("Email not found or access denied");
      }

      // Only update if currently read
      if (userAction.is_read) {
        await userAction.$query().patch({
          is_read: false,
          read_at: null,
          updated_at: new Date(),
        });
      }

      return {
        success: true,
        message: "Email marked as unread",
        was_read: userAction.is_read,
      };
    } catch (error) {
      console.error("Error marking email as unread:", error);
      throw new Error("Failed to mark email as unread");
    }
  }

  // Move email to folder
  static async moveToFolder(emailId, userId, folder) {
    try {
      // Validate folder
      const validFolders = ["inbox", "sent", "archive", "trash", "spam"];
      if (!validFolders.includes(folder)) {
        throw new Error(`Invalid folder: ${folder}`);
      }

      // Get existing user action record
      const userAction = await EmailUserAction.query()
        .where({
          email_id: emailId,
          user_id: userId,
          permanently_deleted: false,
        })
        .first();

      if (!userAction) {
        throw new Error("Email not found or access denied");
      }

      // Prepare update data based on folder
      const updateData = {
        folder: folder,
        updated_at: new Date(),
      };

      // Handle trash folder - set deleted_at
      if (folder === "trash") {
        updateData.deleted_at = new Date();
      } else {
        // Moving out of trash - clear deleted_at
        updateData.deleted_at = null;
      }

      // Special handling for archive
      if (folder === "archive") {
        updateData.is_archived = true;
      } else if (userAction.folder === "archive" && folder !== "archive") {
        updateData.is_archived = false;
      }

      // Update the user action
      await userAction.$query().patch(updateData);

      return {
        success: true,
        message: `Email moved to ${folder}`,
        previous_folder: userAction.folder,
        new_folder: folder,
      };
    } catch (error) {
      console.error("Error moving email to folder:", error);
      throw new Error(`Failed to move email to ${folder}`);
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
      const userAction = await EmailUserAction.query()
        .where({
          email_id: emailId,
          user_id: userId,
        })
        .first();

      if (!userAction) {
        throw new Error("User has no action on this email");
      }

      await userAction.toggleStar();
      return {
        success: true,
        is_starred: !userAction.is_starred,
        message: !userAction.is_starred ? "Email starred" : "Email unstarred",
      };
    } catch (error) {
      console.error("Error toggling star:", error);
      throw error;
    }
  }

  static async getStarStatus(emailId, userId) {
    try {
      const userAction = await EmailUserAction.query()
        .where("email_id", emailId)
        .where("user_id", userId)
        .first();

      return {
        success: true,
        is_starred: userAction?.is_starred || false,
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

  // Soft delete email (move to trash)
  static async deleteEmail(emailId, userId) {
    const userAction = await EmailUserAction.getOrCreateForUser(
      emailId,
      userId
    );

    await userAction.$query().patch({
      folder: "trash",
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true, message: "Email moved to trash" };
  }

  // Permanent delete email
  static async permanentDeleteEmail(emailId, userId) {
    await EmailUserAction.query()
      .where({ email_id: emailId, user_id: userId })
      .patch({
        permanently_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      });

    return { success: true, message: "Email permanently deleted" };
  }

  // Restore email from trash
  static async restoreEmail(emailId, userId) {
    try {
      // Get existing user action record (including permanently deleted)
      const userAction = await EmailUserAction.query()
        .where({
          email_id: emailId,
          user_id: userId,
        })
        .first();

      if (!userAction) {
        throw new Error("Email not found or access denied");
      }

      // Check if permanently deleted
      if (userAction.permanently_deleted) {
        throw new Error("Cannot restore permanently deleted email");
      }

      // Restore to inbox
      await userAction.$query().patch({
        folder: "inbox",
        deleted_at: null,
        updated_at: new Date(),
      });

      return {
        success: true,
        message: "Email restored to inbox",
      };
    } catch (error) {
      console.error("Error restoring email:", error);
      throw new Error("Failed to restore email");
    }
  }

  // Bulk delete emails
  static async bulkDeleteEmails(emailIds, userId, permanent = false) {
    try {
      if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
        throw new Error("Email IDs required");
      }

      let updatedCount;

      if (permanent) {
        // Permanent delete - mark as permanently deleted
        updatedCount = await EmailUserAction.query()
          .whereIn("email_id", emailIds)
          .where("user_id", userId)
          .patch({
            permanently_deleted: true,
            deleted_at: new Date(),
            updated_at: new Date(),
          });
      } else {
        // Soft delete - move to trash
        updatedCount = await EmailUserAction.query()
          .whereIn("email_id", emailIds)
          .where("user_id", userId)
          .where("permanently_deleted", false)
          .patch({
            folder: "trash",
            deleted_at: new Date(),
            updated_at: new Date(),
          });
      }

      return {
        success: true,
        deletedCount: updatedCount,
        message: `${updatedCount} emails ${
          permanent ? "permanently deleted" : "moved to trash"
        }`,
      };
    } catch (error) {
      console.error("Error bulk deleting emails:", error);
      throw new Error("Failed to bulk delete emails");
    }
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
