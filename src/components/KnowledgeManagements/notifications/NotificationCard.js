import React from "react";
import { Card, Typography, Button, Flex, Avatar, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  CheckOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import NotificationIcon from "./NotificationIcon";

const { Text, Paragraph } = Typography;

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
  loading = false,
}) => {
  const {
    id,
    type,
    title,
    message,
    is_read,
    timeAgo,
    isRecent,
    isInvalid,
    invalidationInfo,
    actor,
    content,
    data,
  } = notification;

  const handleMarkAsRead = () => {
    if (!is_read && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  // Card styling based on read status and validity
  const getCardStyle = () => {
    let style = {
      marginBottom: "8px",
      border: "1px solid #EDEFF1",
      borderRadius: "8px",
      transition: "none",
      cursor: "pointer",
    };

    if (isInvalid) {
      style.backgroundColor = "#fafafa";
      style.borderColor = "#d9d9d9";
      style.opacity = 0.7;
    } else if (!is_read) {
      style.backgroundColor = "#FFF7ED";
      style.borderColor = "#FF4500";
      style.borderWidth = "1.5px";
    } else {
      style.backgroundColor = "white";
      style.borderColor = "#EDEFF1";
    }

    return style;
  };

  const getContentPreview = () => {
    if (content?.title) {
      return content.title;
    }
    if (data?.content_title) {
      return data.content_title;
    }
    return "Konten";
  };


  return (
    <Card
      size="small"
      style={getCardStyle()}
      hoverable={false}
      styles={{
        body: {
          padding: "12px",
          cursor: "pointer",
        }
      }}
      onClick={handleMarkAsRead}
    >
      <style jsx global>{`
        .notification-card * {
          transition: none !important;
        }
        .notification-card .ant-btn:hover,
        .notification-card .ant-btn:focus,
        .notification-card .ant-btn:active {
          background-color: inherit !important;
          border-color: inherit !important;
          color: inherit !important;
          box-shadow: none !important;
        }
      `}</style>

      <Flex gap="12px" align="flex-start" className="notification-card">
        {/* Notification Icon */}
        <NotificationIcon type={type} isRead={is_read} />

        {/* Content Area */}
        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
          {/* Header with actor and time */}
          <Flex
            justify="space-between"
            align="flex-start"
            style={{ marginBottom: "4px" }}
          >
            <Flex align="center" gap="8px" style={{ flex: 1, minWidth: 0 }}>
              {/* Actor Avatar (if available) */}
              {actor?.image && (
                <Avatar src={actor.image} size={20} style={{ flexShrink: 0 }} />
              )}

              {/* Title */}
              <Text
                strong={!is_read}
                style={{
                  color: isInvalid
                    ? "#8c8c8c"
                    : !is_read
                    ? "#FF4500"
                    : "#262626",
                  fontSize: "13px",
                  lineHeight: "1.4",
                }}
                ellipsis={{ tooltip: title }}
              >
                {title}
              </Text>
            </Flex>

            {/* Time and status indicators */}
            <Flex
              align="center"
              gap="4px"
              style={{ flexShrink: 0, marginLeft: "8px" }}
            >
              {isRecent && !is_read && (
                <Tag
                  color="#FF4500"
                  size="small"
                  style={{
                    fontSize: "10px",
                    padding: "0 4px",
                    margin: 0,
                    borderRadius: "4px",
                  }}
                >
                  BARU
                </Tag>
              )}

              {isInvalid && (
                <Tooltip
                  title={`Tidak valid: ${
                    invalidationInfo?.reason || "Unknown"
                  }`}
                >
                  <EyeInvisibleOutlined
                    style={{
                      color: "#8c8c8c",
                      fontSize: "12px",
                    }}
                  />
                </Tooltip>
              )}

              <Text
                style={{
                  color: "#8c8c8c",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                }}
              >
                {timeAgo}
              </Text>
            </Flex>
          </Flex>

          {/* Message */}
          <Paragraph
            style={{
              color: isInvalid ? "#8c8c8c" : "#595959",
              fontSize: "12px",
              lineHeight: "1.4",
              margin: "0 0 8px 0",
            }}
            ellipsis={{
              rows: 2,
              tooltip: message,
              expandable: false,
            }}
          >
            {message}
          </Paragraph>

          {/* Content Preview (if available) */}
          {getContentPreview() !== "Konten" && (
            <Text
              style={{
                color: "#8c8c8c",
                fontSize: "11px",
                fontStyle: "italic",
                marginBottom: "8px",
                display: "block",
              }}
              ellipsis={{ tooltip: getContentPreview() }}
            >
              pada &quot;{getContentPreview()}&quot;
            </Text>
          )}

          {/* Actions */}
          <Flex justify="flex-end" gap="4px">
            {!is_read && (
              <Tooltip title="Tandai sudah dibaca">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                  style={{
                    color: "#FF4500",
                    padding: "4px 8px",
                    height: "24px",
                    fontSize: "12px",
                  }}
                >
                  Tandai Dibaca
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Hapus notifikasi">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                loading={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                style={{
                  color: "#8c8c8c",
                  padding: "4px 8px",
                  height: "24px",
                  fontSize: "12px",
                }}
              >
                Hapus
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default NotificationCard;
