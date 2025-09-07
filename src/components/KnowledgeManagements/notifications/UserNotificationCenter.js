import React, { useState, useCallback, useEffect } from "react";
import { Flex, message } from "antd";
import { useRouter } from "next/router";
import {
  useUserNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useNotificationPolling,
} from "@/hooks/knowledge-management/useNotifications";

import UserNotificationHeader from "./UserNotificationHeader";
import NotificationFilters from "./NotificationFilters";
import UserNotificationList from "./UserNotificationList";

const UserNotificationCenter = () => {
  const router = useRouter();
  
  // Initialize filters from URL query params
  const [filters, setFilters] = useState({
    type: "all",
    is_read: "all", 
    search: "",
    page: 1,
    limit: 20,
  });

  const [allNotifications, setAllNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Update filters from URL on mount and when query changes
  useEffect(() => {
    const { type, status, search, page } = router.query;
    
    setFilters(prev => ({
      ...prev,
      type: type || "all",
      is_read: status || "all",
      search: search || "",
      page: parseInt(page) || 1,
    }));
  }, [router.query]);

  // Build query for API
  const buildQuery = useCallback(() => {
    const query = { 
      page: filters.page,
      limit: filters.limit,
    };
    
    if (filters.type !== "all") {
      query.type = filters.type;
    }
    
    if (filters.is_read !== "all") {
      query.is_read = filters.is_read;
    }
    
    if (filters.search) {
      query.search = filters.search;
    }

    return query;
  }, [filters]);

  // Hooks
  const { 
    data: notificationData, 
    isLoading, 
    refetch: refetchNotifications 
  } = useUserNotifications(buildQuery());
  
  const { 
    data: unreadData, 
    refetch: refetchUnreadCount 
  } = useUnreadNotificationsCount();
  
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();
  
  // Polling for real-time updates
  const { refreshNotifications } = useNotificationPolling(true, 30000); // 30 seconds

  // Update local notifications when data changes
  useEffect(() => {
    if (notificationData?.data) {
      if (filters.page === 1) {
        setAllNotifications(notificationData.data);
      } else {
        // Append for load more
        setAllNotifications(prev => [...prev, ...notificationData.data]);
      }
    }
  }, [notificationData, filters.page]);

  // Reset notifications when filters change (except page)
  useEffect(() => {
    if (filters.page === 1) {
      setAllNotifications([]);
    }
  }, [filters.type, filters.is_read, filters.search, filters.page]);

  // Extract data
  const notifications = allNotifications || [];
  const hasMore = notificationData?.hasMore || false;
  const totalCount = notificationData?.total || 0;
  const unreadCount = unreadData?.count || 0;

  // Calculate type counts for filters
  const getTypeCounts = () => {
    const counts = {};
    // This would ideally come from API, for now we'll use placeholder
    return counts;
  };

  // Check if has active filters
  const hasActiveFilters = 
    filters.type !== "all" || 
    filters.is_read !== "all" || 
    filters.search;

  // Helper function to build URL query string
  const buildURLQuery = (newFilters) => {
    const query = {};
    
    if (newFilters.type && newFilters.type !== "all") {
      query.type = newFilters.type;
    }
    
    if (newFilters.is_read && newFilters.is_read !== "all") {
      query.status = newFilters.is_read;
    }
    
    if (newFilters.search) {
      query.search = newFilters.search;
    }
    
    if (newFilters.page && newFilters.page > 1) {
      query.page = newFilters.page;
    }
    
    return query;
  };

  // Handlers with router.push
  const handleTypeChange = (type) => {
    const newFilters = { ...filters, type, page: 1 };
    const query = buildURLQuery(newFilters);
    
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleStatusChange = (status) => {
    const newFilters = { ...filters, is_read: status, page: 1 };
    const query = buildURLQuery(newFilters);
    
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleSearchChange = (search) => {
    const newFilters = { ...filters, search, page: 1 };
    const query = buildURLQuery(newFilters);
    
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleClearFilters = () => {
    // Clear all query params by pushing without query
    router.push({
      pathname: router.pathname,
      query: {},
    }, undefined, { shallow: true });
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      const newFilters = { ...filters, page: filters.page + 1 };
      const query = buildURLQuery(newFilters);
      
      router.push({
        pathname: router.pathname,
        query,
      }, undefined, { shallow: true });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchNotifications(),
        refetchUnreadCount(),
      ]);
      refreshNotifications();
      message.success("Notifikasi berhasil dimuat ulang");
    } catch (error) {
      console.error("Refresh failed:", error);
      message.error("Gagal memuat ulang notifikasi");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      
      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark as read failed:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      
      // Update local state
      setAllNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
    } catch (error) {
      console.error("Mark all as read failed:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteMutation.mutateAsync(notificationId);
      
      // Remove from local state
      setAllNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F8FAFC", 
        minHeight: "calc(100vh - 120px)",
        padding: "0",
      }}
    >
      <style jsx global>{`
        .user-notification-center * {
          transition: none !important;
        }
      `}</style>

      <div className="user-notification-center">
        {/* Header */}
        <UserNotificationHeader
          unreadCount={unreadCount}
          totalCount={totalCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={handleRefresh}
          loading={markAllAsReadMutation.isPending}
          refreshing={refreshing}
        />

        {/* Main Content */}
        <div style={{ padding: "16px 24px" }}>
          <Flex gap="20px" align="flex-start">
            
            {/* Left: Filters */}
            <div style={{ width: "300px", flexShrink: 0 }}>
              <NotificationFilters
                selectedType={filters.type}
                selectedStatus={filters.is_read}
                searchQuery={filters.search}
                typeCounts={getTypeCounts()}
                totalCount={totalCount}
                unreadCount={unreadCount}
                isLoading={isLoading}
              />
            </div>

            {/* Right: Notification List */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EDEFF1",
                  borderRadius: "8px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  minHeight: "600px",
                }}
              >
                <UserNotificationList
                  notifications={notifications}
                  loading={isLoading}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onRefresh={handleRefresh}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

          </Flex>
        </div>
      </div>
    </div>
  );
};

export default UserNotificationCenter;