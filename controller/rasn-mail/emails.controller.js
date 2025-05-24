import { handleError } from "@/utils/helper/controller-helper";
import EmailService from "@/utils/services/EmailServices";
const BroadcastGroup = require("@/models/rasn_mail/broadcast-groups.model");

export const getEmails = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      folder = "inbox",
      page = 1,
      limit = 25,
      search = "",
      unreadOnly = false,
    } = req.query;
    let result;
    switch (folder) {
      case "inbox":
        result = await EmailService.getUserInbox(userId, {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          unreadOnly: unreadOnly === "true",
        });
        break;
      case "sent":
        result = await EmailService.getUserSentEmails(userId, {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        });
        break;
      case "drafts":
        result = await EmailService.getUserDrafts(userId, {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        });
        break;
      default:
        result = await EmailService.getUserInbox(userId, {
          folder,
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        });
    }

    res.json({
      success: true,
      data: result,
    });
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
      case "star":
        await EmailService.toggleStar(id, userId);
        break;
      case "move":
        await EmailService.moveToFolder(id, userId, value);
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
    const unreadCount = await EmailService.getUnreadCount(userId);
    res.json({ success: true, data: { unreadCount } });
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
