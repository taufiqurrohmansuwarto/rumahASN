import { useEffect, useRef, useCallback } from "react";
import { useMyChannels, useMessages } from "@/hooks/useRasnChat";
import { message, Button } from "antd";

// Hook untuk handle browser notifications
export const useChatNotifications = (currentChannelId) => {
  const prevMessageCountRef = useRef({});
  const notificationPermissionRef = useRef(null);
  const { data: myChannels } = useMyChannels();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Browser tidak support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      notificationPermissionRef.current = "granted";
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      notificationPermissionRef.current = permission;
      return permission === "granted";
    }

    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((title, body, channelId) => {
    if (notificationPermissionRef.current !== "granted") return;
    if (document.hasFocus()) return; // Don't show if app is focused

    try {
      const notification = new Notification(title, {
        body,
        icon: "/logo192.png",
        tag: `chat-${channelId}`,
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = `/rasn-chat/${channelId}`;
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (e) {
      console.error("Error showing notification:", e);
    }
  }, []);

  // Check for new messages in channels
  useEffect(() => {
    if (!myChannels) return;

    myChannels.forEach((channel) => {
      const prevCount = prevMessageCountRef.current[channel.id] || 0;
      const currentCount = channel.unread_count || 0;

      // If unread count increased and it's not the current channel
      if (currentCount > prevCount && channel.id !== currentChannelId) {
        showNotification(
          `Pesan baru di #${channel.name}`,
          `${currentCount} pesan belum dibaca`,
          channel.id
        );
      }

      prevMessageCountRef.current[channel.id] = currentCount;
    });
  }, [myChannels, currentChannelId, showNotification]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    requestPermission,
    showNotification,
    isSupported: "Notification" in window,
    permission: notificationPermissionRef.current,
  };
};

// Component to prompt user to enable notifications
const ChatNotifications = () => {
  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      message.warning("Browser Anda tidak mendukung notifikasi");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      message.success("Notifikasi diaktifkan!");
      // Show test notification
      new Notification("Rumah ASN Chat", {
        body: "Notifikasi telah diaktifkan. Anda akan menerima pemberitahuan saat ada pesan baru.",
        icon: "/logo192.png",
      });
    } else if (permission === "denied") {
      message.error("Notifikasi diblokir. Silakan aktifkan melalui pengaturan browser.");
    }
  };

  if (!("Notification" in window)) {
    return null;
  }

  if (Notification.permission === "granted") {
    return null;
  }

  if (Notification.permission === "denied") {
    return null;
  }

  return (
    <Button size="small" onClick={handleEnableNotifications}>
      Aktifkan Notifikasi
    </Button>
  );
};

export default ChatNotifications;

