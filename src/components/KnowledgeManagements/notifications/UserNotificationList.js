import React, { useState } from "react";
import { List, Empty, Button, Skeleton, Typography, Flex, Spin } from "antd";
import { ReloadOutlined, InboxOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import NotificationCard from "./NotificationCard";

const { Text, Title } = Typography;

const UserNotificationList = ({
  notifications = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onMarkAsRead,
  onDelete,
  onRefresh,
  // Filter states for empty state context
  hasActiveFilters = false,
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const handleMarkAsRead = async (notificationId) => {
    setActionLoading((prev) => ({ ...prev, [notificationId]: "read" }));
    try {
      await onMarkAsRead(notificationId);
    } finally {
      setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleDelete = async (notificationId) => {
    setActionLoading((prev) => ({ ...prev, [notificationId]: "delete" }));
    try {
      await onDelete(notificationId);
    } finally {
      setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  const router = useRouter();

  const handleViewContent = (notification) => {
    if (notification.content_id) {
      router.push(`/asn-connect/asn-knowledge/${notification.content_id}`);
    }
  };

  // Empty state component
  const renderEmptyState = () => {

    const handleClearAllFilters = () => {
      router.push(
        {
          pathname: router.pathname,
          query: {},
        },
        undefined,
        { shallow: true }
      );
    };

    if (hasActiveFilters) {
      return (
        <Empty
          image={
            <InboxOutlined style={{ fontSize: "64px", color: "#d9d9d9" }} />
          }
          style={{ height: "80px", marginBottom: "16px" }}
          description={
            <Flex vertical align="center" gap="8px">
              <Title level={5} style={{ color: "#8c8c8c", margin: 0 }}>
                Tidak ada hasil yang sesuai
              </Title>
              <Text
                style={{
                  color: "#8c8c8c",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                Coba ubah filter atau kata kunci pencarian untuk melihat lebih
                banyak notifikasi
              </Text>
              <Button
                type="link"
                size="small"
                onClick={handleClearAllFilters}
                style={{ color: "#FF4500", padding: 0, marginTop: "8px" }}
              >
                Hapus semua filter
              </Button>
            </Flex>
          }
        />
      );
    }

    return (
      <Empty
        image={<InboxOutlined style={{ fontSize: "64px", color: "#d9d9d9" }} />}
        style={{ height: "80px", marginBottom: "16px" }}
        description={
          <Flex vertical align="center" gap="8px">
            <Title level={5} style={{ color: "#8c8c8c", margin: 0 }}>
              Belum ada notifikasi
            </Title>
            <Text
              style={{
                color: "#8c8c8c",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              Notifikasi akan muncul di sini ketika ada aktivitas terkait konten
              Anda, <br />
              seperti like, komentar, atau perubahan status
            </Text>
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                marginTop: "12px",
                fontSize: "12px",
                height: "32px",
                padding: "0 16px",
              }}
            >
              Muat Ulang
            </Button>
          </Flex>
        }
      />
    );
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div style={{ padding: "0 8px" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            padding: "12px",
            marginBottom: "8px",
            border: "1px solid #EDEFF1",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <Flex gap="12px">
            <Skeleton.Avatar size={32} />
            <div style={{ flex: 1 }}>
              <Skeleton.Input
                style={{ width: "60%", height: "16px", marginBottom: "8px" }}
                active
              />
              <Skeleton.Input
                style={{ width: "90%", height: "14px", marginBottom: "4px" }}
                active
              />
              <Skeleton.Input style={{ width: "40%", height: "12px" }} active />
            </div>
          </Flex>
        </div>
      ))}
    </div>
  );

  if (loading && notifications.length === 0) {
    return renderLoadingSkeleton();
  }

  if (!loading && notifications.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 12px" }}>
      <List
        dataSource={notifications}
        renderItem={(notification) => (
          <List.Item style={{ padding: 0, border: "none", marginBottom: "0" }}>
            <NotificationCard
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onViewContent={handleViewContent}
              loading={
                actionLoading[notification.id] === "read" ||
                actionLoading[notification.id] === "delete"
              }
            />
          </List.Item>
        )}
        style={{ backgroundColor: "transparent" }}
      />

      {/* Load More */}
      {hasMore && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Button
            type="default"
            size="small"
            loading={loading}
            onClick={onLoadMore}
            style={{
              borderColor: "#FF4500",
              color: "#FF4500",
              backgroundColor: "white",
              fontSize: "12px",
              fontWeight: 600,
              height: "32px",
              padding: "0 20px",
            }}
          >
            {loading ? "Memuat..." : "Muat Lebih Banyak"}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && notifications.length > 0 && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Spin size="small" />
          <Text
            style={{ color: "#8c8c8c", fontSize: "12px", marginLeft: "8px" }}
          >
            Memuat notifikasi...
          </Text>
        </div>
      )}

      {/* End message */}
      {!hasMore && notifications.length > 0 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
            — Semua notifikasi sudah dimuat —
          </Text>
        </div>
      )}
    </div>
  );
};

export default UserNotificationList;
