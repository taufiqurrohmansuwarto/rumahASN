const Notifications = require("@/models/knowledge/notifications.model");
const KnowledgeContent = require("@/models/knowledge/contents.model");
const UserInteraction = require("@/models/knowledge/user-interactions.model");

// Import helper functions
import {
  NOTIFICATION_TYPES,
  INVALIDATION_REASONS,
  TIME_WINDOWS,
  formatNotificationMessage,
  getTimeWindow,
  validateNotificationData,
  generateNotificationData
} from '@/utils/helper/notification-helper';

/**
 * Helper function to build notification query with relations
 */
const buildNotificationQuery = () => {
  return Notifications.query()
    .withGraphFetched(
      "[actor(simpleWithImage), user(simpleWithImage), content(simple), comment]"
    )
    .modifiers({
      simple: (builder) => {
        builder.select("id", "title", "summary", "type", "status");
      },
      simpleWithImage: (builder) => {
        builder.select("custom_id", "username", "image");
      },
    });
};

// user services
export const getUserNotifications = async (userId, filters = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    is_read, 
    content_id,
    include_invalid = false  // New option to include invalid notifications
  } = filters;

  let query = buildNotificationQuery()
    .where("user_id", userId)
    .orderBy("created_at", "desc");

  // Filter out invalid notifications by default
  if (!include_invalid) {
    query = query.where("is_valid", true);
  }

  // Apply other filters
  if (type) {
    query = query.where("type", type);
  }
  if (is_read !== undefined) {
    query = query.where("is_read", is_read === "true");
  }
  if (content_id) {
    query = query.where("content_id", content_id);
  }

  const results = await query.page(page - 1, limit);

  return {
    data: results.results,
    total: results.total,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: results.total > page * limit,
  };
};
export const getUserUnreadCount = async (userId) => {
  const result = await Notifications.query()
    .where("user_id", userId)
    .where("is_read", false)
    .where("is_valid", true)  // Only count valid notifications
    .count("* as count")
    .first();

  return parseInt(result.count) || 0;
};
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notifications.query()
    .findById(notificationId)
    .where("user_id", userId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.is_read) {
    return notification; // Already read
  }

  const updated = await Notifications.query()
    .findById(notificationId)
    .patch({
      is_read: true,
      read_at: new Date(),
      updated_at: new Date(),
    })
    .returning("*")
    .first();

  return updated;
};
export const markAllAsRead = async (userId) => {
  const updated = await Notifications.query()
    .where("user_id", userId)
    .where("is_read", false)
    .patch({
      is_read: true,
      read_at: new Date(),
      updated_at: new Date(),
    });

  return { updated };
};
export const deleteUserNotification = async (notificationId, userId) => {
  const deleted = await Notifications.query()
    .deleteById(notificationId)
    .where("user_id", userId);

  if (deleted === 0) {
    throw new Error("Notification not found or access denied");
  }

  return { success: true };
};

// admin services
export const getAllNotifications = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    user_id,
    type,
    is_read,
    is_sent,
    content_id,
    actor_id,
    date_from,
    date_to,
  } = filters;

  let query = buildNotificationQuery().orderBy("created_at", "desc");

  // Apply filters
  if (user_id) {
    query = query.where("user_id", user_id);
  }
  if (type) {
    query = query.where("type", type);
  }
  if (is_read !== undefined) {
    query = query.where("is_read", is_read === "true");
  }
  if (is_sent !== undefined) {
    query = query.where("is_sent", is_sent === "true");
  }
  if (content_id) {
    query = query.where("content_id", content_id);
  }
  if (actor_id) {
    query = query.where("actor_id", actor_id);
  }
  if (date_from) {
    query = query.where("created_at", ">=", date_from);
  }
  if (date_to) {
    query = query.where("created_at", "<=", date_to);
  }

  const results = await query.page(page - 1, limit);

  return {
    data: results.results,
    total: results.total,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: results.total > page * limit,
  };
};
export const getNotificationStats = async () => {
  const [totalResult, unreadResult, typeStats, recentActivity] =
    await Promise.all([
      // Total notifications
      Notifications.query().count("* as count").first(),

      // Unread count
      Notifications.query().where("is_read", false).count("* as count").first(),

      // By type
      Notifications.query().select("type").count("* as count").groupBy("type"),

      // Recent activity (last 7 days)
      Notifications.query()
        .where(
          "created_at",
          ">=",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
        .select("type", "created_at")
        .count("* as count")
        .groupBy("type")
        .orderBy("count", "desc")
        .limit(10),
    ]);

  const by_type = {};
  typeStats.forEach((stat) => {
    by_type[stat.type] = parseInt(stat.count);
  });

  return {
    total: parseInt(totalResult.count),
    unread: parseInt(unreadResult.count),
    by_type,
    recent_activity: recentActivity,
  };
};
export const createNotification = async (data) => {
  const notification = {
    user_id: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    content_id: data.content_id || null,
    comment_id: data.comment_id || null,
    actor_id: data.actor_id || null,
    is_read: false,
    is_sent: true,
    is_valid: true,  // Default to valid
    data: data.data || null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const created = await Notifications.query()
    .insert(notification)
    .returning("*");

  return created;
};
export const broadcastNotification = async (userIds, notificationData) => {
  // Validate input
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('userIds must be a non-empty array');
  }
  
  // Prepare notification data with defaults
  const baseNotificationData = {
    type: notificationData.type || NOTIFICATION_TYPES.SYSTEM,
    title: notificationData.title,
    message: notificationData.message,
    content_id: notificationData.content_id || null,
    comment_id: notificationData.comment_id || null,
    actor_id: notificationData.actor_id || null,
    data: notificationData.data || null
  };
  
  // Validate base notification data (using first user as example)
  const sampleData = { ...baseNotificationData, user_id: userIds[0] };
  const validation = validateNotificationData(sampleData);
  if (!validation.isValid) {
    throw new Error(`Invalid broadcast data: ${validation.errors.join(', ')}`);
  }

  const notifications = userIds.map((userId) => ({
    user_id: userId,
    ...baseNotificationData,
    is_read: false,
    is_sent: true,
    is_valid: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  const created = await Notifications.query()
    .insert(notifications)
    .returning("*");

  return {
    sent: created.length,
    notifications: created,
  };
};
export const updateNotification = async (id, data) => {
  const notification = await Notifications.query().findById(id);
  if (!notification) {
    throw new Error("Notification not found");
  }

  const updated = await Notifications.query()
    .findById(id)
    .patch({
      ...data,
      updated_at: new Date(),
    })
    .returning("*")
    .first();

  return updated;
};
export const deleteNotification = async (id) => {
  const deleted = await Notifications.query().deleteById(id);

  if (deleted === 0) {
    throw new Error("Notification not found");
  }

  return { success: true };
};

// system services (for triggering notifications)
export const createLikeNotification = async (contentId, actorId) => {
  // Get content and author info
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .select('id', 'title', 'author_id');

  if (!content || content.author_id === actorId) {
    return null; // Don't notify if user likes own content
  }

  // Check if notification already exists (prevent spam)
  const spamWindow = getTimeWindow(NOTIFICATION_TYPES.LIKE, TIME_WINDOWS.SPAM_PREVENTION);
  const existing = await Notifications.query()
    .where('user_id', content.author_id)
    .where('content_id', contentId)
    .where('actor_id', actorId)
    .where('type', NOTIFICATION_TYPES.LIKE)
    .where('created_at', '>=', new Date(Date.now() - spamWindow))
    .first();

  if (existing) {
    return existing; // Already notified recently
  }

  // Generate notification data using helper
  const notificationData = generateNotificationData(NOTIFICATION_TYPES.LIKE, {
    userId: content.author_id,
    actorId,
    contentId,
    contentTitle: content.title
  });

  // Validate data before creation
  const validation = validateNotificationData(notificationData);
  if (!validation.isValid) {
    throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
  }

  return await createNotification(notificationData);
};
export const createCommentNotification = async (
  contentId,
  commentId,
  actorId
) => {
  // Get content and comment info
  const [content, comment] = await Promise.all([
    KnowledgeContent.query()
      .findById(contentId)
      .select('id', 'title', 'author_id'),
    UserInteraction.query()
      .findById(commentId)
      .select('id', 'comment_text')
  ]);

  if (!content || !comment || content.author_id === actorId) {
    return null; // Don't notify if user comments on own content
  }

  // Generate notification data using helper
  const notificationData = generateNotificationData(NOTIFICATION_TYPES.COMMENT, {
    userId: content.author_id,
    actorId,
    contentId,
    commentId,
    contentTitle: content.title,
    additionalData: {
      comment_preview: comment.comment_text?.substring(0, 100) + '...'
    }
  });

  // Validate data before creation
  const validation = validateNotificationData(notificationData);
  if (!validation.isValid) {
    throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
  }

  return await createNotification(notificationData);
};
export const createContentStatusNotification = async (contentId, newStatus) => {
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .select('id', 'title', 'author_id', 'status');

  if (!content) {
    return null;
  }

  const statusMessages = {
    'published': {
      title: 'Konten Dipublikasi',
      message: `Konten "${content.title}" telah dipublikasi dan dapat dilihat publik`
    },
    'rejected': {
      title: 'Konten Ditolak',
      message: `Konten "${content.title}" ditolak. Silakan periksa dan perbaiki konten Anda`
    },
    'pending_revision': {
      title: 'Konten Perlu Revisi',
      message: `Konten "${content.title}" memerlukan revisi sebelum dapat dipublikasi`
    },
    'archived': {
      title: 'Konten Diarsipkan',
      message: `Konten "${content.title}" telah diarsipkan`
    }
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) {
    return null; // Unknown status
  }

  // Create notification data with custom title and message for status changes
  const notificationData = {
    user_id: content.author_id,
    type: NOTIFICATION_TYPES.CONTENT_STATUS,
    title: statusInfo.title,
    message: statusInfo.message,
    content_id: contentId,
    data: {
      content_title: content.title,
      old_status: content.status,
      new_status: newStatus,
      action: 'status_change'
    }
  };

  // Validate data before creation
  const validation = validateNotificationData(notificationData);
  if (!validation.isValid) {
    throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
  }

  return await createNotification(notificationData);
};

export const createMentionNotification = async (
  contentId,
  mentionedUserId,
  actorId
) => {
  if (mentionedUserId === actorId) {
    return null; // Don't notify if user mentions themselves
  }

  const content = await KnowledgeContent.query()
    .findById(contentId)
    .select("id", "title");

  if (!content) {
    return null;
  }

  // Generate notification data using helper
  const notificationData = generateNotificationData(NOTIFICATION_TYPES.MENTION, {
    userId: mentionedUserId,
    actorId,
    contentId,
    contentTitle: content.title
  });

  // Validate data before creation
  const validation = validateNotificationData(notificationData);
  if (!validation.isValid) {
    throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
  }

  return await createNotification(notificationData);
};

// Additional helper function for share notification
export const createShareNotification = async (contentId, actorId) => {
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .select("id", "title", "author_id");

  if (!content || content.author_id === actorId) {
    return null; // Don't notify if user shares own content
  }

  // Generate notification data using helper
  const notificationData = generateNotificationData(NOTIFICATION_TYPES.SHARE, {
    userId: content.author_id,
    actorId,
    contentId,
    contentTitle: content.title
  });

  // Validate data before creation
  const validation = validateNotificationData(notificationData);
  if (!validation.isValid) {
    throw new Error(`Invalid notification data: ${validation.errors.join(', ')}`);
  }

  return await createNotification(notificationData);
};

// ===== HYBRID APPROACH HELPER FUNCTIONS =====

/**
 * Remove ephemeral notifications (for like/unlike toggle)
 * DELETE strategy for temporary actions
 */
export const removeLikeNotification = async (contentId, actorId, timeWindowDays = null) => {
  const timeWindow = timeWindowDays || TIME_WINDOWS.LIKE_REMOVAL;
  const cutoff = new Date(Date.now() - getTimeWindow(NOTIFICATION_TYPES.LIKE, timeWindow));
  
  const deleted = await Notifications.query()
    .where('content_id', contentId)
    .where('actor_id', actorId)
    .where('type', NOTIFICATION_TYPES.LIKE)
    .where('created_at', '>=', cutoff)
    .delete();
  
  return { deleted, message: `Removed ${deleted} like notification(s)` };
};

/**
 * Remove share notifications (for share/unshare toggle)
 * DELETE strategy for temporary actions
 */
export const removeShareNotification = async (contentId, actorId, timeWindowDays = null) => {
  const timeWindow = timeWindowDays || TIME_WINDOWS.SHARE_REMOVAL;
  const cutoff = new Date(Date.now() - getTimeWindow(NOTIFICATION_TYPES.SHARE, timeWindow));
  
  const deleted = await Notifications.query()
    .where('content_id', contentId)
    .where('actor_id', actorId)
    .where('type', NOTIFICATION_TYPES.SHARE)
    .where('created_at', '>=', cutoff)
    .delete();
  
  return { deleted, message: `Removed ${deleted} share notification(s)` };
};

/**
 * Invalidate comment notifications (for comment delete)
 * INVALIDATE strategy for content actions - keep history
 */
export const invalidateCommentNotification = async (commentId, reason = INVALIDATION_REASONS.COMMENT_DELETED) => {
  // Get content info for proper message formatting
  const comment = await UserInteraction.query()
    .findById(commentId)
    .select('id', 'content_id');
    
  if (!comment) {
    return { updated: 0, message: 'Comment not found' };
  }
  
  const content = await KnowledgeContent.query()
    .findById(comment.content_id)
    .select('id', 'title');
  
  // Format message using helper
  const invalidMessage = formatNotificationMessage(NOTIFICATION_TYPES.COMMENT, {
    contentTitle: content?.title || 'konten',
    isDeleted: true
  });

  const updated = await Notifications.query()
    .where('comment_id', commentId)
    .where('type', NOTIFICATION_TYPES.COMMENT)
    .where('is_valid', true) // Only invalidate currently valid ones
    .patch({
      is_valid: false,
      invalidated_at: new Date(),
      invalidation_reason: reason,
      message: invalidMessage,
      updated_at: new Date()
    });
    
  return { updated, message: `Invalidated ${updated} comment notification(s)` };
};

/**
 * Restore comment notifications (for comment restore/undelete)
 * Restore previously invalidated notifications
 */
export const restoreCommentNotification = async (commentId) => {
  // Get original comment info to restore proper message
  const comment = await UserInteraction.query()
    .findById(commentId)
    .select('id', 'comment_text', 'content_id');
    
  if (!comment) {
    return { updated: 0, message: 'Comment not found' };
  }

  const content = await KnowledgeContent.query()
    .findById(comment.content_id)
    .select('id', 'title');

  // Format restored message using helper
  const restoredMessage = formatNotificationMessage(NOTIFICATION_TYPES.COMMENT, {
    contentTitle: content?.title || 'konten',
    isDeleted: false
  });

  const updated = await Notifications.query()
    .where('comment_id', commentId)
    .where('type', NOTIFICATION_TYPES.COMMENT)
    .where('is_valid', false)
    .where('invalidation_reason', INVALIDATION_REASONS.COMMENT_DELETED)
    .patch({
      is_valid: true,
      invalidated_at: null,
      invalidation_reason: null,
      message: restoredMessage,
      updated_at: new Date()
    });
    
  return { updated, message: `Restored ${updated} comment notification(s)` };
};

/**
 * Generic notification invalidation
 * For other types of content actions that need invalidation
 */
export const invalidateNotification = async (notificationId, reason, customMessage = null) => {
  const notification = await Notifications.query()
    .findById(notificationId)
    .where('is_valid', true);
    
  if (!notification) {
    return { updated: 0, message: 'Notification not found or already invalid' };
  }
  
  const updateData = {
    is_valid: false,
    invalidated_at: new Date(),
    invalidation_reason: reason,
    updated_at: new Date()
  };
  
  if (customMessage) {
    updateData.message = customMessage;
  }
  
  const updated = await Notifications.query()
    .findById(notificationId)
    .patch(updateData);
    
  return { updated: 1, message: 'Notification invalidated successfully' };
};

/**
 * Get notification statistics including invalid ones (for admin)
 */
export const getDetailedNotificationStats = async () => {
  const [totalResult, validResult, invalidResult, typeStats, invalidReasons, recentStats] = await Promise.all([
    // Total notifications
    Notifications.query().count('* as count').first(),
    
    // Valid notifications
    Notifications.query().where('is_valid', true).count('* as count').first(),
    
    // Invalid notifications  
    Notifications.query().where('is_valid', false).count('* as count').first(),
    
    // By type (valid only)
    Notifications.query()
      .where('is_valid', true)
      .select('type')
      .count('* as count')
      .groupBy('type'),
      
    // Invalid reasons breakdown
    Notifications.query()
      .where('is_valid', false)
      .whereNotNull('invalidation_reason')
      .select('invalidation_reason')
      .count('* as count')
      .groupBy('invalidation_reason'),
      
    // Recent activity (last 7 days)
    Notifications.query()
      .where('created_at', '>=', new Date(Date.now() - getTimeWindow(null, TIME_WINDOWS.RECENT_ACTIVITY)))
      .select('type', 'is_valid')
      .count('* as count')
      .groupBy('type', 'is_valid')
      .orderBy('count', 'desc')
      .limit(20)
  ]);

  const by_type = {};
  typeStats.forEach(stat => {
    by_type[stat.type] = parseInt(stat.count);
  });
  
  const by_invalidation_reason = {};
  invalidReasons.forEach(reason => {
    by_invalidation_reason[reason.invalidation_reason] = parseInt(reason.count);
  });

  return {
    total: parseInt(totalResult.count),
    valid: parseInt(validResult.count),
    invalid: parseInt(invalidResult.count),
    by_type,
    by_invalidation_reason,
    recent_activity: recentStats,
    validity_rate: totalResult.count > 0 ? ((validResult.count / totalResult.count) * 100).toFixed(2) + '%' : '100%',
    constants: {
      notification_types: Object.values(NOTIFICATION_TYPES),
      invalidation_reasons: Object.values(INVALIDATION_REASONS),
      time_windows: TIME_WINDOWS
    }
  };
};
