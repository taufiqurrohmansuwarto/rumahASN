import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  getUserNotifications,
  getUserUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/knowledge-management.services";

// Get user notifications with filters
export const useUserNotifications = (query = {}) => {
  return useQuery({
    queryKey: ["user-notifications", query],
    queryFn: () => getUserNotifications(query),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    enabled: true,
  });
};

// Get unread notifications count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: getUserUnreadNotificationsCount,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });
};

// Mark single notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data, variables) => {
      // Show success message
      message.success("Notifikasi ditandai sebagai sudah dibaca");

      // Update cache immediately for better UX
      queryClient.setQueryData(["unread-notifications-count"], (oldData) => {
        if (oldData && oldData.count > 0) {
          return {
            ...oldData,
            count: oldData.count - 1,
            hasUnread: oldData.count - 1 > 0,
            message: oldData.count - 1 > 0 
              ? `You have ${oldData.count - 1} unread notifications` 
              : 'No unread notifications'
          };
        }
        return oldData;
      });

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
      message.error("Gagal menandai notifikasi sebagai sudah dibaca");
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (data) => {
      // Show success message
      const updatedCount = data.updated || 0;
      if (updatedCount > 0) {
        message.success(`${updatedCount} notifikasi ditandai sebagai sudah dibaca`);
      } else {
        message.info("Tidak ada notifikasi yang perlu ditandai sebagai sudah dibaca");
      }

      // Reset unread count to 0
      queryClient.setQueryData(["unread-notifications-count"], {
        count: 0,
        hasUnread: false,
        message: 'No unread notifications'
      });

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
      message.error("Gagal menandai semua notifikasi sebagai sudah dibaca");
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (data, variables) => {
      // Show success message
      message.success("Notifikasi berhasil dihapus");

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
    onError: (error) => {
      console.error("Failed to delete notification:", error);
      message.error("Gagal menghapus notifikasi");
    },
  });
};

// Hook for notification polling (real-time updates)
export const useNotificationPolling = (enabled = true, interval = 30000) => {
  const queryClient = useQueryClient();

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications-count", "polling"],
    queryFn: getUserUnreadNotificationsCount,
    enabled: enabled,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fresh for polling
  });

  // Method to manually refresh notifications
  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
  };

  return {
    unreadCount,
    refreshNotifications,
  };
};

// Hook for notification actions (bulk operations)
export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const bulkMarkAsRead = async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => markAsReadMutation.mutateAsync(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        message.success(`${successful} notifikasi berhasil ditandai sebagai sudah dibaca`);
      }
      if (failed > 0) {
        message.warning(`${failed} notifikasi gagal diproses`);
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    } catch (error) {
      console.error("Bulk mark as read failed:", error);
      message.error("Gagal memproses beberapa notifikasi");
    }
  };

  const bulkDelete = async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => deleteMutation.mutateAsync(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        message.success(`${successful} notifikasi berhasil dihapus`);
      }
      if (failed > 0) {
        message.warning(`${failed} notifikasi gagal dihapus`);
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      message.error("Gagal menghapus beberapa notifikasi");
    }
  };

  return {
    bulkMarkAsRead,
    bulkDelete,
    isLoading: markAsReadMutation.isPending || markAllAsReadMutation.isPending || deleteMutation.isPending,
  };
};

// Hook for notification filters and search
export const useNotificationFilters = () => {
  const queryClient = useQueryClient();

  const applyFilters = (filters) => {
    // Invalidate with new filters
    queryClient.invalidateQueries({ 
      queryKey: ["user-notifications", filters] 
    });
  };

  const clearFilters = () => {
    queryClient.invalidateQueries({ 
      queryKey: ["user-notifications", {}] 
    });
  };

  return {
    applyFilters,
    clearFilters,
  };
};