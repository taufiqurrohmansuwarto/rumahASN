import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  getAdminNotifications,
  getNotificationStats,
  broadcastNotification,
  updateAdminNotification,
  deleteAdminNotification,
} from "@/services/knowledge-management.services";

// Get all notifications (admin view) with filters
export const useAdminNotifications = (query = {}) => {
  return useQuery({
    queryKey: ["admin-notifications", query],
    queryFn: () => getAdminNotifications(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: true,
  });
};

// Get notification statistics
export const useNotificationStats = (detailed = false) => {
  return useQuery({
    queryKey: ["notification-stats", detailed],
    queryFn: () => getNotificationStats(detailed),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for dashboard updates
  });
};

// Broadcast notification to multiple users
export const useBroadcastNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: broadcastNotification,
    onSuccess: (data) => {
      const { sent, requested, success_rate, notification_type } = data;
      
      // Show detailed success message
      message.success(
        `Broadcast berhasil dikirim ke ${sent}/${requested} pengguna (${success_rate})`
      );

      // Show additional info for low success rate
      if (sent < requested) {
        message.warning(
          `${requested - sent} pengguna tidak dapat menerima notifikasi`,
          5
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    },
    onError: (error) => {
      console.error("Failed to broadcast notification:", error);
      
      // Parse error message for better UX
      const errorMessage = error?.response?.data?.message || "Gagal mengirim broadcast";
      message.error(errorMessage);
    },
  });
};

// Update notification (admin only)
export const useUpdateAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminNotification,
    onSuccess: (data, variables) => {
      const { updated_fields } = data;
      
      // Show success message with updated fields info
      message.success(
        `Notifikasi berhasil diupdate${updated_fields?.length ? ` (${updated_fields.join(', ')})` : ''}`
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    },
    onError: (error) => {
      console.error("Failed to update notification:", error);
      
      const errorMessage = error?.response?.data?.message || "Gagal mengupdate notifikasi";
      message.error(errorMessage);
    },
  });
};

// Delete notification (admin only)
export const useDeleteAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminNotification,
    onSuccess: (data, variables) => {
      message.success("Notifikasi berhasil dihapus");

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    },
    onError: (error) => {
      console.error("Failed to delete notification:", error);
      message.error("Gagal menghapus notifikasi");
    },
  });
};

// Hook for admin notification analytics and insights
export const useNotificationAnalytics = () => {
  const { data: basicStats } = useNotificationStats(false);
  const { data: detailedStats } = useNotificationStats(true);
  
  const analytics = {
    // Basic metrics
    totalNotifications: basicStats?.total || 0,
    unreadCount: basicStats?.unread || 0,
    readRate: basicStats?.total ? 
      ((basicStats.total - basicStats.unread) / basicStats.total * 100).toFixed(1) + '%' : '0%',
    
    // Type distribution
    typeDistribution: basicStats?.by_type || {},
    mostActiveType: basicStats?.by_type ? 
      Object.entries(basicStats.by_type).sort(([,a], [,b]) => b - a)[0]?.[0] : null,
    
    // Detailed metrics (if available)
    validityRate: detailedStats?.validity_rate || '100%',
    invalidCount: detailedStats?.invalid || 0,
    invalidationReasons: detailedStats?.by_invalidation_reason || {},
    recentActivity: detailedStats?.recent_activity || [],
  };

  return {
    basicStats,
    detailedStats,
    analytics,
    isLoading: !basicStats && !detailedStats,
  };
};

// Hook for admin bulk operations
export const useAdminNotificationBulkActions = () => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateAdminNotification();
  const deleteMutation = useDeleteAdminNotification();

  const bulkUpdate = async (notificationIds, updateData) => {
    try {
      const promises = notificationIds.map(id => 
        updateMutation.mutateAsync({ id, data: updateData })
      );
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        message.success(`${successful} notifikasi berhasil diupdate`);
      }
      if (failed > 0) {
        message.warning(`${failed} notifikasi gagal diproses`);
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    } catch (error) {
      console.error("Bulk update failed:", error);
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
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      message.error("Gagal menghapus beberapa notifikasi");
    }
  };

  const bulkInvalidate = async (notificationIds, reason) => {
    const invalidationData = {
      is_valid: false,
      invalidated_at: new Date().toISOString(),
      invalidation_reason: reason,
    };

    await bulkUpdate(notificationIds, invalidationData);
  };

  const bulkRestore = async (notificationIds) => {
    const restoreData = {
      is_valid: true,
      invalidated_at: null,
      invalidation_reason: null,
    };

    await bulkUpdate(notificationIds, restoreData);
  };

  return {
    bulkUpdate,
    bulkDelete,
    bulkInvalidate,
    bulkRestore,
    isLoading: updateMutation.isPending || deleteMutation.isPending,
  };
};

// Hook for notification filters and search (admin version)
export const useAdminNotificationFilters = () => {
  const queryClient = useQueryClient();

  const applyFilters = (filters) => {
    queryClient.invalidateQueries({ 
      queryKey: ["admin-notifications", filters] 
    });
  };

  const clearFilters = () => {
    queryClient.invalidateQueries({ 
      queryKey: ["admin-notifications", {}] 
    });
  };

  // Predefined filter presets for quick access
  const filterPresets = {
    unread: { is_read: false },
    invalid: { include_invalid: true, is_valid: false },
    recent: { 
      date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    },
    systemOnly: { type: 'system' },
    contentRelated: { type: ['like', 'comment', 'share', 'content_status'] },
  };

  const applyPreset = (presetName) => {
    const preset = filterPresets[presetName];
    if (preset) {
      applyFilters(preset);
    }
  };

  return {
    applyFilters,
    clearFilters,
    applyPreset,
    filterPresets,
  };
};

// Hook for broadcast notification templates
export const useBroadcastTemplates = () => {
  const templates = {
    systemMaintenance: {
      type: 'system',
      title: 'Pemeliharaan Sistem',
      message: 'Sistem akan mengalami pemeliharaan pada {date}. Mohon maaf atas ketidaknyamanannya.',
    },
    newFeature: {
      type: 'system',
      title: 'Fitur Baru Tersedia',
      message: 'Fitur baru telah tersedia di platform. Silakan jelajahi dan berikan feedback Anda.',
    },
    contentModeration: {
      type: 'content_status',
      title: 'Status Konten Berubah',
      message: 'Status konten Anda telah diperbarui. Silakan periksa dashboard Anda untuk detail.',
    },
    achievement: {
      type: 'system',
      title: 'Pencapaian Baru',
      message: 'Selamat! Anda telah mencapai milestone baru di platform knowledge management.',
    },
  };

  const applyTemplate = (templateName, customData = {}) => {
    const template = templates[templateName];
    if (!template) return null;

    return {
      ...template,
      ...customData,
      message: customData.message || template.message.replace(
        /\{(\w+)\}/g, 
        (match, key) => customData[key] || match
      ),
    };
  };

  return {
    templates,
    applyTemplate,
    availableTemplates: Object.keys(templates),
  };
};