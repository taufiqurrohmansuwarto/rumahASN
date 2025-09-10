/**
 * Notification Helper Utilities
 * Provides helper functions for notification management and processing
 */

/**
 * Notification type constants
 */
export const NOTIFICATION_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  SHARE: "share",
  CONTENT_STATUS: "content_status",
  MENTION: "mention",
  SYSTEM: "system",
};

/**
 * Invalidation reason constants
 */
export const INVALIDATION_REASONS = {
  COMMENT_DELETED: "comment_deleted",
  CONTENT_DELETED: "content_deleted",
  USER_DEACTIVATED: "user_deactivated",
  ADMIN_ACTION: "admin_action",
  SYSTEM_CLEANUP: "system_cleanup",
};

/**
 * Time window constants (in days)
 */
export const TIME_WINDOWS = {
  LIKE_REMOVAL: 7, // 7 days window for like notifications
  SHARE_REMOVAL: 7, // 7 days window for share notifications
  RECENT_ACTIVITY: 7, // Recent activity timeframe
  SPAM_PREVENTION: 1, // 24 hours for spam prevention
};

/**
 * Check if a notification should be invalidated vs deleted
 * Based on notification type and content nature
 */
export const getNotificationStrategy = (notificationType) => {
  const ephemeralTypes = [NOTIFICATION_TYPES.LIKE, NOTIFICATION_TYPES.SHARE];
  const contentTypes = [NOTIFICATION_TYPES.COMMENT, NOTIFICATION_TYPES.MENTION];
  const persistentTypes = [
    NOTIFICATION_TYPES.CONTENT_STATUS,
    NOTIFICATION_TYPES.SYSTEM,
  ];

  if (ephemeralTypes.includes(notificationType)) {
    return "DELETE"; // Remove completely
  }

  if (contentTypes.includes(notificationType)) {
    return "INVALIDATE"; // Keep but mark invalid
  }

  if (persistentTypes.includes(notificationType)) {
    return "KEEP"; // Never remove/invalidate
  }

  return "INVALIDATE"; // Default to invalidate for unknown types
};

/**
 * Format notification message based on type and context
 */
export const formatNotificationMessage = (type, context = {}) => {
  const { contentTitle, actorName, isDeleted = false } = context;

  const baseMessages = {
    [NOTIFICATION_TYPES.LIKE]: `${
      actorName || "Seseorang"
    } menyukai konten "${contentTitle}"`,
    [NOTIFICATION_TYPES.COMMENT]: `${
      actorName || "Seseorang"
    } berkomentar pada "${contentTitle}"`,
    [NOTIFICATION_TYPES.SHARE]: `${
      actorName || "Seseorang"
    } membagikan konten "${contentTitle}"`,
    [NOTIFICATION_TYPES.MENTION]: `${
      actorName || "Seseorang"
    } menyebut Anda dalam "${contentTitle}"`,
    [NOTIFICATION_TYPES.CONTENT_STATUS]: `Status konten "${contentTitle}" telah berubah`,
  };

  let message = baseMessages[type] || `Aktivitas pada konten "${contentTitle}"`;

  if (isDeleted && type === NOTIFICATION_TYPES.COMMENT) {
    message = `${
      actorName || "Seseorang"
    } berkomentar pada "${contentTitle}" (komentar telah dihapus)`;
  }

  return message;
};

/**
 * Format notification title based on type
 */
export const formatNotificationTitle = (type, context = {}) => {
  const { isDeleted = false } = context;

  const baseTitles = {
    [NOTIFICATION_TYPES.LIKE]: "Konten Anda Disukai",
    [NOTIFICATION_TYPES.COMMENT]: "Komentar Baru",
    [NOTIFICATION_TYPES.SHARE]: "Konten Anda Dibagikan",
    [NOTIFICATION_TYPES.MENTION]: "Anda Disebutkan",
    [NOTIFICATION_TYPES.CONTENT_STATUS]: "Status Konten Berubah",
    [NOTIFICATION_TYPES.SYSTEM]: "Pemberitahuan Sistem",
  };

  let title = baseTitles[type] || "Pemberitahuan";

  if (isDeleted && type === NOTIFICATION_TYPES.COMMENT) {
    title = "Komentar (Dihapus)";
  }

  return title;
};

/**
 * Calculate time window based on notification type
 */
export const getTimeWindow = (notificationType, customDays = null) => {
  if (customDays) {
    return customDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }

  const timeWindowDays = {
    [NOTIFICATION_TYPES.LIKE]: TIME_WINDOWS.LIKE_REMOVAL,
    [NOTIFICATION_TYPES.SHARE]: TIME_WINDOWS.SHARE_REMOVAL,
  };

  const days = timeWindowDays[notificationType] || TIME_WINDOWS.RECENT_ACTIVITY;
  return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
};

/**
 * Check if notification is within spam prevention window
 */
export const isWithinSpamWindow = (lastNotificationDate) => {
  if (!lastNotificationDate) return false;

  const spamWindow = TIME_WINDOWS.SPAM_PREVENTION * 24 * 60 * 60 * 1000;
  const timeDiff = Date.now() - new Date(lastNotificationDate).getTime();

  return timeDiff < spamWindow;
};

/**
 * Validate notification data before creation
 */
export const validateNotificationData = (data, fromAdmin = false) => {
  const required = ["user_id", "type", "title", "message"];
  const errors = [];

  for (const field of required) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (data.type && !Object.values(NOTIFICATION_TYPES).includes(data.type)) {
    errors.push(`Invalid notification type: ${data.type}`);
  }

  const sameActor = data.user_id === data.actor_id;

  if (sameActor) {
    errors.push("Cannot create notification for self-action");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate notification data object
 */
export const generateNotificationData = (type, context = {}) => {
  const {
    userId,
    actorId,
    contentId,
    commentId,
    contentTitle,
    actorName,
    additionalData = {},
  } = context;

  return {
    user_id: userId,
    actor_id: actorId,
    content_id: contentId,
    comment_id: commentId,
    type,
    title: formatNotificationTitle(type, context),
    message: formatNotificationMessage(type, { contentTitle, actorName }),
    data: {
      content_title: contentTitle,
      action: type,
      ...additionalData,
    },
  };
};

/**
 * Format notification for display in UI
 */
export const formatNotificationForDisplay = (notification) => {
  const createdAt = new Date(notification.created_at);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo;
  if (diffMins < 1) timeAgo = "Baru saja";
  else if (diffMins < 60) timeAgo = `${diffMins} menit lalu`;
  else if (diffHours < 24) timeAgo = `${diffHours} jam lalu`;
  else if (diffDays < 7) timeAgo = `${diffDays} hari lalu`;
  else timeAgo = createdAt.toLocaleDateString("id-ID");

  return {
    ...notification,
    timeAgo,
    isRecent: diffHours < 24,
    isInvalid: !notification.is_valid,
    invalidationInfo: notification.is_valid
      ? null
      : {
          reason: notification.invalidation_reason,
          invalidatedAt: notification.invalidated_at,
        },
  };
};

/**
 * Group notifications by type for display
 */
export const groupNotificationsByType = (notifications) => {
  const groups = {};

  notifications.forEach((notification) => {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
  });

  return groups;
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.LIKE]: "heart",
    [NOTIFICATION_TYPES.COMMENT]: "message",
    [NOTIFICATION_TYPES.SHARE]: "share",
    [NOTIFICATION_TYPES.MENTION]: "at",
    [NOTIFICATION_TYPES.CONTENT_STATUS]: "file-text",
    [NOTIFICATION_TYPES.SYSTEM]: "bell",
  };

  return icons[type] || "bell";
};

/**
 * Get notification color theme based on type
 */
export const getNotificationColor = (type, isRead = false) => {
  const colors = {
    [NOTIFICATION_TYPES.LIKE]: isRead ? "#ffcccb" : "#ff6b6b",
    [NOTIFICATION_TYPES.COMMENT]: isRead ? "#cce5ff" : "#4dabf7",
    [NOTIFICATION_TYPES.SHARE]: isRead ? "#d4edda" : "#51cf66",
    [NOTIFICATION_TYPES.MENTION]: isRead ? "#fff3cd" : "#ffd43b",
    [NOTIFICATION_TYPES.CONTENT_STATUS]: isRead ? "#e2e3e5" : "#6c757d",
    [NOTIFICATION_TYPES.SYSTEM]: isRead ? "#f8d7da" : "#dc3545",
  };

  return colors[type] || (isRead ? "#e9ecef" : "#6c757d");
};
