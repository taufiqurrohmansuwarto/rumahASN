import { useEffect } from "react";
import { notification } from "antd";
import { TrophyOutlined, StarOutlined, CrownOutlined } from "@ant-design/icons";

const XPNotification = () => {
  // Function to show XP notification
  const showXPNotification = (xpAmount, action, additionalInfo = {}) => {
    const { levelUp = false, newLevel = 0, badgeEarned = null } = additionalInfo;

    // XP Notification
    notification.success({
      message: `+${xpAmount} XP`,
      description: getActionDescription(action),
      icon: <StarOutlined />,
      placement: "topRight",
      duration: 3,
    });

    // Level Up Notification (if applicable)
    if (levelUp) {
      setTimeout(() => {
        notification.info({
          message: `🎉 Level Up!`,
          description: `Selamat! Anda naik ke Level ${newLevel}`,
          icon: <CrownOutlined />,
          placement: "topRight",
          duration: 5,
        });
      }, 500);
    }

    // Badge Earned Notification (if applicable)
    if (badgeEarned) {
      setTimeout(() => {
        notification.success({
          message: `🏆 Badge Baru!`,
          description: `Anda mendapatkan badge "${badgeEarned.name}"`,
          icon: <TrophyOutlined />,
          placement: "topRight",
          duration: 5,
        });
      }, 1000);
    }
  };

  // Helper function to get action description
  const getActionDescription = (action) => {
    switch (action) {
      case "like_content":
        return "Menyukai konten";
      case "content_liked":
        return "Konten Anda disukai";
      case "comment_content":
        return "Memberikan komentar";
      case "publish_content":
        return "Menerbitkan konten";
      case "quest_complete":
        return "Menyelesaikan misi";
      case "read_complete":
        return "Membaca konten";
      default:
        return "Aktivitas di Knowledge Base";
    }
  };

  // Expose function to window for global usage
  useEffect(() => {
    window.showXPNotification = showXPNotification;
    
    return () => {
      delete window.showXPNotification;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default XPNotification;