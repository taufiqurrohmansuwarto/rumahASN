const { handleError } = require("@/utils/helper/controller-helper");
import {
  getUserNotifications as getNotificationsService,
  getUserUnreadCount,
  getUserNotificationTypeCounts,
  markAsRead,
  markAllAsRead,
  deleteUserNotification
} from "@/utils/services/knowledge-notifications.services";
import {
  NOTIFICATION_TYPES,
  formatNotificationForDisplay
} from "@/utils/helper/notification-helper";

export const getUserNotifications = async (req, res) => {
  try {
    const { customId } = req?.user;
    const filters = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      type: req?.query?.type,
      is_read: req?.query?.is_read,
      content_id: req?.query?.content_id,
      include_invalid: req?.query?.include_invalid === 'true' // Allow admin to see invalid
    };

    // Validate type if provided
    if (filters.type && !Object.values(NOTIFICATION_TYPES).includes(filters.type)) {
      return res.status(400).json({
        message: `Invalid notification type. Allowed types: ${Object.values(NOTIFICATION_TYPES).join(', ')}`
      });
    }

    // Run notifications query and type counts in parallel for first page
    const isFirstPage = parseInt(filters.page) === 1;
    const [notifications, typeCounts] = await Promise.all([
      getNotificationsService(customId, filters),
      isFirstPage ? getUserNotificationTypeCounts(customId) : Promise.resolve(null)
    ]);
    
    // Format notifications for display
    const formattedNotifications = {
      ...notifications,
      data: notifications.data.map(notification => formatNotificationForDisplay(notification))
    };

    // Include type counts only for first page to avoid unnecessary queries
    if (isFirstPage && typeCounts) {
      formattedNotifications.type_counts = typeCounts;
    }

    res.json(formattedNotifications);
  } catch (error) {
    handleError(res, error);
  }
};
export const getUserUnreadNotificationsCount = async (req, res) => {
  try {
    const { customId } = req?.user;
    const count = await getUserUnreadCount(customId);
    res.json({ 
      count,
      hasUnread: count > 0,
      message: count > 0 ? `You have ${count} unread notifications` : 'No unread notifications'
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const markNotificationAsRead = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    
    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required'
      });
    }
    
    const notification = await markAsRead(id, customId);
    
    // Format notification for display
    const formattedNotification = formatNotificationForDisplay(notification);
    
    res.json({
      message: 'Notification marked as read',
      notification: formattedNotification,
      success: true
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    
    if (!id) {
      return res.status(400).json({
        message: 'Notification ID is required'
      });
    }
    
    const result = await deleteUserNotification(id, customId);
    res.json({
      message: 'Notification deleted successfully',
      success: result.success
    });
  } catch (error) {
    handleError(res, error);
  }
};
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { customId } = req?.user;
    
    const result = await markAllAsRead(customId);
    const count = result.updated;
    
    res.json({
      message: count > 0 
        ? `${count} notification${count > 1 ? 's' : ''} marked as read`
        : 'No unread notifications to update',
      updated: count,
      success: true,
      hasUpdates: count > 0
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserNotificationStats = async (req, res) => {
  try {
    const { customId } = req?.user;

    const [unreadCount, typeCounts] = await Promise.all([
      getUserUnreadCount(customId),
      getUserNotificationTypeCounts(customId)
    ]);

    res.json({
      success: true,
      data: {
        unread_count: unreadCount?.count || 0,
        type_counts: typeCounts,
        total_count: Object.values(typeCounts).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};
