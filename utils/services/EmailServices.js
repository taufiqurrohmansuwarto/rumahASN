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
  }) {
    return Email.createAndSend({
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

  // Get email by ID with user context
  static async getEmailById(emailId, userId) {
    const email = await Email.query().findById(emailId).withGraphFetched(`[
        sender, 
        recipients.[user], 
        attachments,
        parent.[sender],
        replies.[sender]
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

  // Move email to folder
  static async moveToFolder(emailId, userId, folder) {
    const recipient = await Recipient.query().findOne({
      email_id: emailId,
      recipient_id: userId,
    });

    if (recipient) {
      await recipient.moveToFolder(folder);
    }

    return true;
  }

  // Toggle star
  static async toggleStar(emailId, userId) {
    const email = await Email.query().findById(emailId);
    if (email) {
      await email.toggleStar(userId);
    }
    return true;
  }

  // Get unread count
  static async getUnreadCount(userId) {
    const result = await Email.knex().raw(
      "SELECT rasn_mail.get_unread_count(?) as count",
      [userId]
    );
    return parseInt(result.rows[0].count);
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
}

module.exports = EmailService;
