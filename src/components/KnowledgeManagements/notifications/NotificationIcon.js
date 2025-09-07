import React from "react";
import {
  HeartFilled,
  MessageFilled,
  ShareAltOutlined,
  UserOutlined,
  FileTextOutlined,
  BellFilled,
} from "@ant-design/icons";

const NotificationIcon = ({ type, isRead = false }) => {
  const getIconConfig = (type) => {
    const configs = {
      like: {
        icon: HeartFilled,
        color: isRead ? "#ffcccb" : "#ff6b6b",
        bgColor: isRead ? "#fff5f5" : "#ffe6e6",
      },
      comment: {
        icon: MessageFilled,
        color: isRead ? "#cce5ff" : "#4dabf7",
        bgColor: isRead ? "#f0f8ff" : "#e6f4ff",
      },
      share: {
        icon: ShareAltOutlined,
        color: isRead ? "#d4edda" : "#51cf66",
        bgColor: isRead ? "#f0fff4" : "#e6f7e6",
      },
      mention: {
        icon: UserOutlined,
        color: isRead ? "#fff3cd" : "#ffd43b",
        bgColor: isRead ? "#fffdf0" : "#fff8e6",
      },
      content_status: {
        icon: FileTextOutlined,
        color: isRead ? "#e2e3e5" : "#6c757d",
        bgColor: isRead ? "#f8f9fa" : "#f1f3f4",
      },
      system: {
        icon: BellFilled,
        color: isRead ? "#f8d7da" : "#dc3545",
        bgColor: isRead ? "#fdf2f2" : "#fee6e6",
      },
    };

    return configs[type] || configs.system;
  };

  const config = getIconConfig(type);
  const IconComponent = config.icon;

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: config.bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconComponent
        style={{
          color: config.color,
          fontSize: "14px",
        }}
      />
    </div>
  );
};

export default NotificationIcon;