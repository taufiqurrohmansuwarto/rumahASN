const { handleError } = require("@/utils/helper/controller-helper");
import {
  getAllNotifications as getAllNotificationsService,
  getNotificationStats as getStatsService,
  getDetailedNotificationStats,
  broadcastNotification as broadcastService,
  updateNotification as updateNotificationService,
  deleteNotification as deleteNotificationService
} from "@/utils/services/knowledge-notifications.services";
import {
  NOTIFICATION_TYPES,
  INVALIDATION_REASONS,
  formatNotificationForDisplay,
  groupNotificationsByType
} from "@/utils/helper/notification-helper";

export const getAllNotifications = async (req, res) => {
  try {
    const filters = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      user_id: req?.query?.user_id,
      type: req?.query?.type,
      is_read: req?.query?.is_read,
      is_sent: req?.query?.is_sent,
      content_id: req?.query?.content_id,
      actor_id: req?.query?.actor_id,
      date_from: req?.query?.date_from,
      date_to: req?.query?.date_to,
      include_invalid: req?.query?.include_invalid !== 'false' // Admin sees all by default
    };

    // Validate type if provided
    if (filters.type && !Object.values(NOTIFICATION_TYPES).includes(filters.type)) {
      return res.status(400).json({
        message: `Invalid notification type. Allowed types: ${Object.values(NOTIFICATION_TYPES).join(', ')}`
      });
    }

    // Validate date format
    if (filters.date_from && isNaN(new Date(filters.date_from))) {
      return res.status(400).json({
        message: 'Invalid date_from format. Use YYYY-MM-DD or ISO format'
      });
    }
    if (filters.date_to && isNaN(new Date(filters.date_to))) {
      return res.status(400).json({
        message: 'Invalid date_to format. Use YYYY-MM-DD or ISO format'
      });
    }

    const notifications = await getAllNotificationsService(filters);
    
    // Format notifications for admin display
    const formattedNotifications = {
      ...notifications,
      data: notifications.data.map(notification => formatNotificationForDisplay(notification)),
      grouped: req?.query?.group_by_type === 'true' 
        ? groupNotificationsByType(notifications.data)
        : null
    };

    res.json(formattedNotifications);
  } catch (error) {
    handleError(res, error);
  }
};
export const getNotificationStats = async (req, res) => {
  try {
    const detailed = req?.query?.detailed === 'true';
    
    const stats = detailed 
      ? await getDetailedNotificationStats()
      : await getStatsService();
    
    res.json({
      ...stats,
      metadata: {
        generated_at: new Date().toISOString(),
        detailed_view: detailed,
        available_types: Object.values(NOTIFICATION_TYPES),
        available_invalidation_reasons: Object.values(INVALIDATION_REASONS)
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const broadcastNotification = async (req, res) => {
  try {
    const { user_ids, type, title, message, content_id, data } = req?.body;

    // Enhanced validation
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        message: 'user_ids is required and must be a non-empty array',
        example: { user_ids: ['user1', 'user2'] }
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        message: 'title and message are required',
        example: { title: 'System Update', message: 'System will be down for maintenance' }
      });
    }

    if (user_ids.length > 1000) {
      return res.status(400).json({
        message: 'Maximum 1000 users allowed per broadcast',
        provided: user_ids.length
      });
    }

    // Validate notification type
    const notificationType = type || NOTIFICATION_TYPES.SYSTEM;
    if (!Object.values(NOTIFICATION_TYPES).includes(notificationType)) {
      return res.status(400).json({
        message: `Invalid notification type: ${notificationType}`,
        allowed_types: Object.values(NOTIFICATION_TYPES)
      });
    }

    const notificationData = {
      type: notificationType,
      title,
      message,
      content_id,
      actor_id: req?.user?.customId,
      data
    };

    const result = await broadcastService(user_ids, notificationData);
    
    res.json({
      message: `Broadcast sent successfully to ${result.sent} user${result.sent > 1 ? 's' : ''}`,
      sent: result.sent,
      requested: user_ids.length,
      success_rate: `${((result.sent / user_ids.length) * 100).toFixed(1)}%`,
      notification_type: notificationType,
      notifications: req?.query?.include_notifications === 'true' ? result.notifications : undefined
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const updateNotification = async (req, res) => {
  try {
    const { id } = req?.query;
    const updateData = req?.body;

    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required'
      });
    }

    // Remove sensitive fields that shouldn't be updated via API
    const sanitizedData = { ...updateData };
    delete sanitizedData.id;
    delete sanitizedData.user_id;
    delete sanitizedData.actor_id; // Don't allow changing actor
    delete sanitizedData.created_at;
    
    // Validate type if being updated
    if (sanitizedData.type && !Object.values(NOTIFICATION_TYPES).includes(sanitizedData.type)) {
      return res.status(400).json({
        message: `Invalid notification type: ${sanitizedData.type}`,
        allowed_types: Object.values(NOTIFICATION_TYPES)
      });
    }
    
    // Validate invalidation reason if provided
    if (sanitizedData.invalidation_reason && !Object.values(INVALIDATION_REASONS).includes(sanitizedData.invalidation_reason)) {
      return res.status(400).json({
        message: `Invalid invalidation reason: ${sanitizedData.invalidation_reason}`,
        allowed_reasons: Object.values(INVALIDATION_REASONS)
      });
    }

    const notification = await updateNotificationService(id, sanitizedData);
    const formattedNotification = formatNotificationForDisplay(notification);
    
    res.json({
      message: 'Notification updated successfully',
      notification: formattedNotification,
      updated_fields: Object.keys(sanitizedData)
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req?.query;
    
    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required'
      });
    }
    
    const result = await deleteNotificationService(id);
    
    res.json({
      message: 'Notification deleted successfully',
      success: result.success,
      deleted_id: id
    });
  } catch (error) {
    handleError(res, error);
  }
};
