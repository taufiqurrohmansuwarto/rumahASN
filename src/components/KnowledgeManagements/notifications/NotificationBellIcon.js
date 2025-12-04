import React, { useState } from "react";
import { Badge, Dropdown, Empty, Button, Typography, Flex, Spin } from "antd";
import {
  EyeOutlined,
  SettingOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { IconBellRinging } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { NOTIFICATION_ATTR } from "@/utils/client-utils";
import {
  useUnreadNotificationsCount,
  useUserNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/knowledge-management/useNotifications";
import NotificationIcon from "./NotificationIcon";

const { Text, Title } = Typography;

const NotificationBellIcon = ({
  size = 20,
  style = {},
  placement = "bottomRight",
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Hooks
  const { data: unreadData, refetch: refetchUnreadCount } =
    useUnreadNotificationsCount();
  const { data: recentNotifications, isLoading } = useUserNotifications({
    page: 1,
    limit: 5, // Only show 5 recent in dropdown
  });
  const markAsReadMutation = useMarkNotificationAsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = recentNotifications?.data || [];

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
        refetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Close dropdown
    setDropdownOpen(false);

    // Navigate to notifications page with specific filter if needed
    if (notification.content_id) {
      router.push(
        `/asn-connect/asn-knowledge/my-knowledge/notifications?content_id=${notification.content_id}`
      );
    } else {
      router.push("/asn-connect/asn-knowledge/my-knowledge/notifications");
    }
  };

  const handleSeeAllClick = () => {
    setDropdownOpen(false);
    router.push("/asn-connect/asn-knowledge/my-knowledge/notifications");
  };

  const renderNotificationItem = (notification) => {
    const { id, type, title, message, is_read, timeAgo } = notification;

    return (
      <div
        key={id}
        onClick={() => handleNotificationClick(notification)}
        style={{
          padding: isMobile ? "8px 12px" : "12px 16px",
          cursor: "pointer",
          backgroundColor: is_read ? "white" : "#fff7ed",
        }}
      >
        <Flex gap="10px" align="flex-start">
          {/* Notification Icon */}
          <div style={{ flexShrink: 0, marginTop: "2px" }}>
            <NotificationIcon type={type} isRead={is_read} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Flex
              justify="space-between"
              align="flex-start"
              style={{ marginBottom: "4px" }}
            >
              <Text
                strong={!is_read}
                style={{
                  fontSize: "13px",
                  color: !is_read ? "#FF4500" : "#262626",
                  lineHeight: "1.3",
                }}
                ellipsis={{ tooltip: title }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#8c8c8c",
                  whiteSpace: "nowrap",
                  marginLeft: "8px",
                }}
              >
                {timeAgo}
              </Text>
            </Flex>

            <Text
              style={{
                fontSize: "12px",
                color: "#595959",
                lineHeight: "1.3",
                display: "block",
              }}
              ellipsis={{ tooltip: message, rows: 2 }}
            >
              {message}
            </Text>

            {/* Unread indicator */}
            {!is_read && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: "#FF4500",
                  borderRadius: "50%",
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>
        </Flex>
      </div>
    );
  };

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            padding: isMobile ? "16px" : "20px",
            textAlign: "center",
            width: isMobile ? "280px" : "350px",
            backgroundColor: "white",
          }}
        >
          <Spin size="small" />
          <Text
            style={{ color: "#8c8c8c", fontSize: "12px", marginLeft: "8px" }}
          >
            Memuat notifikasi...
          </Text>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div
          style={{
            padding: isMobile ? "16px" : "20px",
            width: isMobile ? "280px" : "350px",
            backgroundColor: "white",
          }}
        >
          <Empty
            image={
              <MessageOutlined style={{ fontSize: "32px", color: "#d9d9d9" }} />
            }
            style={{ height: "50px" }}
            description={
              <Text style={{ color: "#8c8c8c", fontSize: "13px" }}>
                Belum ada notifikasi
              </Text>
            }
          />
        </div>
      );
    }

    return (
      <div
        style={{
          width: isMobile ? "280px" : "350px",
          maxHeight: isMobile ? "350px" : "400px",
          overflowY: "auto",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "8px 12px" : "12px 16px",
            backgroundColor: "white",
          }}
        >
          <Flex justify="space-between" align="center">
            <Title
              level={5}
              style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}
            >
              Notifikasi
            </Title>
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                size="small"
                style={{ backgroundColor: "#FF4500" }}
              />
            )}
          </Flex>
        </div>

        {/* Recent Notifications */}
        <div
          style={{
            maxHeight: isMobile ? "250px" : "300px",
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          {notifications.map(renderNotificationItem)}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: isMobile ? "8px 12px" : "12px 16px",
            backgroundColor: "white",
          }}
        >
          <Flex gap="8px">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={handleSeeAllClick}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                flex: 1,
                fontSize: isMobile ? "11px" : "12px",
                height: isMobile ? "28px" : "32px",
              }}
            >
              Lihat Semua
            </Button>
            <Button
              type="default"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => {
                setDropdownOpen(false);
                router.push(
                  "/asn-connect/asn-knowledge/my-knowledge/notifications?settings=true"
                );
              }}
              style={{
                fontSize: isMobile ? "11px" : "12px",
                height: isMobile ? "28px" : "32px",
              }}
            >
              Pengaturan
            </Button>
          </Flex>
        </div>
      </div>
    );
  };

  return (
    <Dropdown
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      placement={placement}
      trigger={["click"]}
      menu={{
        items: [{ key: "content", label: renderDropdownContent() }],
      }}
      overlayStyle={{
        padding: 0,
        boxShadow: "none",
      }}
    >
      <div
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <Badge
          count={unreadCount}
          size="small"
          offset={[-2, 2]}
          style={{
            backgroundColor: "#FF4500",
            fontSize: "10px",
            minWidth: "16px",
            height: "16px",
            lineHeight: "16px",
          }}
        >
          <IconBellRinging
            size={NOTIFICATION_ATTR.size}
            color={unreadCount > 0 ? "#FF4500" : NOTIFICATION_ATTR.color}
            style={{
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBellIcon;
