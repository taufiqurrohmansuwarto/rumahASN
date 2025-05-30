import { handleError } from "@/utils/helper/controller-helper";
import EmailService from "@/utils/services/EmailServices";
const BroadcastGroup = require("@/models/rasn_mail/broadcast-groups.model");
const User = require("@/models/users.model");

const Label = require("@/models/rasn_mail/labels.model");
const EmailLabel = require("@/models/rasn_mail/email-labels.model");
const Email = require("@/models/rasn_mail/emails.model");

const serialize = (emails) => {
  if (!emails?.recipients) return emails;

  const mapRecipients = (type) =>
    emails.recipients
      ?.filter((e) => e.type === type)
      ?.map((recipient) => ({
        id: recipient.user?.custom_id,
        name: recipient.user?.username,
        email: recipient.user?.email,
        image: recipient.user?.image,
      })) || [];

  return {
    ...emails,
    recipients: {
      to: mapRecipients("to"),
      cc: mapRecipients("cc"),
      bcc: mapRecipients("bcc"),
    },
  };
};

export const getEmails = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      folder = "inbox",
      page = 1,
      limit = 25,
      search = "",
      unreadOnly = false,
      labelId = null,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      labelId,
    };

    let result;
    switch (folder) {
      case "inbox":
        result = await EmailService.getUserInbox(userId, {
          ...options,
          unreadOnly: unreadOnly === "true",
        });
        break;
      case "label": // ✅ TAMBAHKAN CASE INI
        if (!labelId) {
          return res.status(400).json({
            success: false,
            message: "Label ID required",
          });
        }
        result = await EmailService.getUserLabelEmails(
          userId,
          labelId,
          options
        );
        break;
      case "sent":
        result = await EmailService.getUserSentEmails(userId, options);
        break;
      case "drafts":
        result = await EmailService.getUserDrafts(userId, options);
        break;
      case "move":
        // Handle move to different folders
        await EmailService.moveToFolder(id, userId, value);
        break;
      case "archive":
        result = await EmailService.getUserArchive(userId, options);
        break;
      case "starred":
        result = await EmailService.getUserStarred(userId, options);
        break;
      case "important":
        result = await EmailService.getUserImportant(userId, options);
        break;
      default:
        result = await EmailService.getUserInbox(userId, {
          ...options,
          folder,
        });
    }

    const hasil = {
      success: true,
      data: {
        ...result,
        emails: result?.emails?.map(serialize) || [],
      },
    };

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const createEmail = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      subject,
      content,
      recipients,
      attachments = [],
      type = "personal",
      broadcastGroupId,
      parentId,
      priority = "normal",
    } = req.body;

    let result;
    if (type === "broadcast") {
      result = await EmailService.sendBroadcastEmail({
        senderId: userId,
        subject,
        content,
        broadcastGroupId,
        attachments,
      });
    } else {
      result = await EmailService.sendPersonalEmail({
        senderId: userId,
        subject,
        content,
        recipients,
        attachments,
        parentId,
        priority,
      });
    }

    res.status(201).json({
      success: true,
      data: { emailId: result.id },
      message: "Email sent successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getEmailPersonal = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;

    const email = await EmailService.getEmailById(id, userId);
    res.json({
      success: true,
      data: email,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const changeActionEmail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { action, value } = req?.body;

    switch (action) {
      case "read":
        await EmailService.markAsRead(id, userId);
        break;
      case "unread":
        await EmailService.markAsUnread(id, userId);
        break;
      case "star":
        await EmailService.toggleStar(id, userId);
        break;
      case "move":
        await EmailService.moveToFolder(id, userId, value);
        break;
      case "priority":
        await EmailService.updatePriority(id, userId, value);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    res.json({
      success: true,
      message: `Email ${action}ed successfully`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const replyEmail = async (req, res) => {
  try {
    const { originalEmailId, content, replyAll = false } = req.body;
    const { customId: userId } = req?.user;
    const result = await EmailService.replyToEmail(
      originalEmailId,
      userId,
      content,
      replyAll
    );
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const forwardEmail = async (req, res) => {
  try {
    const { originalEmailId, content, recipients } = req.body;
    const { customId: userId } = req?.user;
    const result = await EmailService.forwardEmail(
      originalEmailId,
      userId,
      recipients,
      content
    );
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const emailSearch = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { q, page = 1, limit = 25 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { results: [], total: 0 } });
    }

    const results = await EmailService.searchEmails(userId, q, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getStatsEmail = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const stats = await EmailService.getEmailStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    handleError(res, error);
  }
};

export const getBroadcastGroups = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const result = await BroadcastGroup.query()
      .where("created_by", userId)
      .orWhere("type", "!=", "custom")
      .withGraphFetched("[creator, members.[user]")
      .orderBy("created_at", "desc");

    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const createBroadcastGroup = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { name, description, type, criteria, userIds = [] } = req.body;

    const group = await BroadcastGroup.query().insertGraph({
      created_by: userId,
      name,
      description,
      type,
      criteria,
      members:
        type === "custom" ? userIds.map((userId) => ({ user_id: userId })) : [],
    });
    res.status(201).json({
      success: true,
      data: group,
      message: "Broadcast group created successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { permanent = false } = req?.body;

    if (permanent) {
      const result = await EmailService.permanentDeleteEmail(id, userId);
      res.json({ success: true, data: result });
    } else {
      const result = await EmailService.deleteEmail(id, userId);
      res.json({ success: true, data: result });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const restoreEmail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const result = await EmailService.restoreEmail(id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const bulkDeleteEmail = async (req, res) => {
  try {
    const { emailIds, permanent = false } = req.body;

    const { customId: userId } = req?.user;
    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: "Email IDs required" });
    }

    const deletedCount = await EmailService.bulkDeleteEmails(
      emailIds,
      userId,
      permanent
    );

    res.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} emails ${
        permanent ? "permanently deleted" : "moved to trash"
      }`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteTrash = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const result = await EmailService.emptyTrash(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getTrash = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { page = 1, limit = 25, search = "" } = req.query;
    const result = await EmailService.getUserTrash(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserDrafts = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const { customId: userId } = req?.user;
    const result = await EmailService.getUserDrafts(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const createOrUpdateDraft = async (req, res) => {
  try {
    const {
      id = null, // draft ID for update
      subject,
      content,
      recipients = { to: [], cc: [], bcc: [] },
      attachments = [],
      priority = "normal",
    } = req.body;

    const { customId: userId } = req?.user;

    let draft;

    if (id) {
      draft = await EmailService.updateDraft({
        draftId: id,
        senderId: userId,
        subject,
        content,
        recipients,
        attachments,
        priority,
      });
    } else {
      // Create new draft
      draft = await EmailService.createDraft({
        senderId: userId,
        subject,
        content,
        recipients,
        attachments,
        priority,
      });
    }

    res.status(201).json({
      success: true,
      data: draft,
      message: id ? "Draft updated successfully" : "Draft created successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getSingleDraft = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const result = await EmailService.getDraftById(id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateDraft = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { subject, content, recipients, attachments, priority } = req.body;

    const draft = await EmailService.updateDraft({
      draftId: id,
      senderId: userId,
      subject,
      content,
      recipients,
      attachments,
      priority,
    });

    res.json({
      success: true,
      data: draft,
      message: "Draft updated successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteDraft = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const result = await EmailService.deleteDraft(id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const sendDraft = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const result = await EmailService.sendDraft(id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await User.query()
      .where("username", "ilike", `%${q}%`)
      .andWhere("group", "=", "MASTER")
      .andWhere("role", "=", "USER")
      .select(
        "custom_id as id",
        "username",
        "image",
        "organization_id as org_id"
      )
      .limit(5);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const getLabels = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const result = await Label.getUserLabels(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const createLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { name, color = "#1890ff" } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Label name is required",
      });
    }

    // Check if label already exists for this user
    const existingLabel = await Label.query()
      .where("user_id", userId)
      .where("name", name)
      .first();

    if (existingLabel) {
      return res.status(400).json({
        success: false,
        message: "Label dengan nama ini sudah ada",
      });
    }

    const label = await Label.query().insert({
      user_id: userId,
      name,
      color,
      is_system: false,
    });

    res.status(201).json({
      success: true,
      data: label,
      message: "Label berhasil dibuat",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const label = await Label.query()
      .findById(id)
      .where("user_id", userId)
      .where("is_system", false); // Only allow delete custom labels

    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label tidak ditemukan atau tidak dapat dihapus",
      });
    }

    // Delete all email_labels relationships first
    await EmailLabel.query().delete().where("label_id", id);

    // Delete the label
    await label.$query().delete();

    res.json({
      success: true,
      message: "Label berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { name, color } = req.body;

    const label = await Label.query()
      .findById(id)
      .where("user_id", userId)
      .where("is_system", false); // Only allow update custom labels

    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label tidak ditemukan atau tidak dapat diubah",
      });
    }

    const updatedLabel = await label.$query().patchAndFetch({
      ...(name && { name }),
      ...(color && { color }),
    });

    res.json({
      success: true,
      data: updatedLabel,
      message: "Label berhasil diperbarui",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const removeLabelFromEmail = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id: emailId, labelId } = req.query;

    const deleted = await EmailLabel.query()
      .delete()
      .where("email_id", emailId)
      .where("label_id", labelId)
      .where("user_id", userId);

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Label assignment tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Label berhasil dihapus dari email",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const assignLabelToEmail = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id: emailId, labelId = null } = req.query;

    if (!labelId) {
      return res.status(400).json({
        success: false,
        message: "Label ID is required",
      });
    }

    // Verify email exists and user has access
    const email = await Email.query().findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    const isRecipient = await email
      .$relatedQuery("recipients")
      .where("recipient_id", userId)
      .first();
    const isSender = email.sender_id === userId;

    if (!isRecipient && !isSender) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Verify label exists and user has access
    const label = await Label.query()
      .findById(labelId)
      .where((builder) => {
        builder.where("user_id", userId).orWhere("is_system", true);
      });

    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label tidak ditemukan",
      });
    }

    // Check if already assigned
    const existingAssignment = await EmailLabel.query()
      .where("email_id", emailId)
      .where("label_id", labelId)
      .where("user_id", userId)
      .first();

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Label sudah ditambahkan ke email ini",
      });
    }

    // Create assignment
    const emailLabel = await EmailLabel.query().insert({
      email_id: emailId,
      label_id: labelId,
      user_id: userId,
    });

    res.status(201).json({
      success: true,
      data: emailLabel,
      message: "Label berhasil ditambahkan ke email",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getEmailLabels = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id: emailId } = req.query;

    // Verify user has access to email
    const email = await Email.query().findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    // Check if user is sender or recipient
    const isRecipient = await email
      .$relatedQuery("recipients")
      .where("recipient_id", userId)
      .first();
    const isSender = email.sender_id === userId;

    if (!isRecipient && !isSender) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const emailLabels = await EmailLabel.query()
      .where("email_id", emailId)
      .where("user_id", userId)
      .withGraphFetched("label");

    res.json({
      success: true,
      data: emailLabels.map((el) => el.label),
    });
  } catch (error) {
    handleError(res, error);
  }
};
