import React, { useState, useCallback, useEffect, useRef } from "react";
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

    setFilters((prev) => ({
      ...prev,
      type: type || "all",
      is_read: status || "all",
      search: search || "",
      page: parseInt(page) || 1,
    }));
  }, [router.query]);

  // Build query for API - use router.query directly for immediate updates
  const buildQuery = useCallback(() => {
    const { type, status, search, page } = router.query;
    
    const query = {
      page: parseInt(page) || 1,
      limit: filters.limit,
    };

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.is_read = status;
    }

    if (search) {
      query.search = search;
    }

    return query;
  }, [router.query, filters.limit]);

  // Hooks - only query when router is ready
  const {
    data: notificationData,
    isLoading,
    refetch: refetchNotifications,
  } = useUserNotifications(buildQuery(), { enabled: router.isReady });

  const { data: unreadData, refetch: refetchUnreadCount } =
    useUnreadNotificationsCount();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  // Polling for real-time updates
  const { refreshNotifications } = useNotificationPolling(true, 30000); // 30 seconds

  // Store type counts from API response
  const [typeCounts, setTypeCounts] = useState({});
  
  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({});
  
  // Update local notifications when data changes
  useEffect(() => {
    if (notificationData?.data && router.isReady) {
      const { type, status, search, page } = router.query;
      const currentPage = parseInt(page) || 1;
      const currentFilters = { type: type || "all", status: status || "all", search: search || "" };
      
      // Check if filters changed (not just page)
      const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters);
      
      if (currentPage === 1 || filtersChanged) {
        // Replace data on first page or when filters change
        setAllNotifications(notificationData.data);
        // Store type counts from first page response
        if (notificationData.type_counts) {
          setTypeCounts(notificationData.type_counts);
        }
        
        // Update previous filters
        prevFiltersRef.current = currentFilters;
      } else {
        // Append for load more (only if not loading first page and filters same)
        setAllNotifications((prev) => [...prev, ...notificationData.data]);
      }
    }
  }, [notificationData, router.isReady, router.query]);

  // Extract data
  const notifications = allNotifications || [];
  const hasMore = notificationData?.hasMore || false;
  const totalCount = notificationData?.total || 0;
  const unreadCount = unreadData?.count || 0;

  // Get type counts from stored API response or fallback to local counting
  const getTypeCounts = () => {
    // Use stored type counts from API if available
    if (Object.keys(typeCounts).length > 0) {
      return typeCounts;
    }
    
    // Fallback: count from current notifications (less accurate due to pagination)
    const counts = {
      like: 0,
      comment: 0,
      share: 0,
      mention: 0,
      content_status: 0,
      system: 0
    };
    
    notifications.forEach(notification => {
      if (counts.hasOwnProperty(notification.type)) {
        counts[notification.type]++;
      }
    });
    
    return counts;
  };

  // Check if has active filters
  const hasActiveFilters =
    filters.type !== "all" || filters.is_read !== "all" || filters.search;

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

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      const newFilters = { ...filters, page: filters.page + 1 };
      const query = buildURLQuery(newFilters);

      router.push(
        {
          pathname: router.pathname,
          query,
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
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
      setAllNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
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
      setAllNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString(),
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
      setAllNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div
      style={{
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
        <div style={{ padding: "16px 0px" }}>
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
