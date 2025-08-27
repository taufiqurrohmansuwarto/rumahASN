import React from "react";
import { Card, Progress, Typography, Grid, Avatar, Flex } from "antd";
import { TrophyOutlined, StarOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const UserXPProgress = ({ userPoints, loading = false }) => {
  const screens = useBreakpoint();

  // Default values jika data belum ada (based on controller response format)
  const pointsData = userPoints?.data || {};
  const currentXP = pointsData?.points || 0;
  const currentLevel = pointsData?.levels || pointsData?.level || 1;

  // Hitung XP range untuk level saat ini dan berikutnya
  const getXPForLevel = (level) => {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 50;
  };

  const currentLevelMinXP = getXPForLevel(currentLevel);
  const nextLevelMinXP = getXPForLevel(currentLevel + 1);
  const xpNeededForNext = nextLevelMinXP - currentXP;
  const progressPercent = ((currentXP - currentLevelMinXP) / (nextLevelMinXP - currentLevelMinXP)) * 100;

  return (
    <Card 
      loading={loading}
      style={{
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
      styles={{ body: { padding: 0 } }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#898989";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
      }}
    >
      <Flex style={{ minHeight: "80px" }}>
        {/* Level Avatar Section */}
        <div
          style={{
            width: "80px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <Avatar 
            size={screens.md ? 64 : 56} 
            style={{ backgroundColor: "#FF4500" }}
            icon={<TrophyOutlined />}
          />
        </div>

        {/* Progress Info Section */}
        <div style={{ flex: 1, padding: "16px" }}>
          <Flex align="center" justify="space-between" style={{ marginBottom: "8px" }}>
            <Text strong style={{ fontSize: "16px", color: "#1A1A1B" }}>
              Level {currentLevel}
            </Text>
            <Flex align="center" gap="4px">
              <StarOutlined style={{ color: "#FFD700" }} />
              <Text strong style={{ color: "#1A1A1B" }}>{currentXP.toLocaleString()} XP</Text>
            </Flex>
          </Flex>

          {/* Progress Bar */}
          <Progress
            percent={Math.min(progressPercent, 100)}
            showInfo={false}
            style={{ marginBottom: "8px" }}
            strokeColor="#FF4500"
          />

          {/* Progress Text */}
          <Flex align="center" justify="space-between">
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {currentLevel < 10 ? `${xpNeededForNext} XP lagi ke Level ${currentLevel + 1}` : "Max Level!"}
            </Text>
            {currentLevel < 10 && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {Math.round(progressPercent)}%
              </Text>
            )}
          </Flex>

          {/* Level Achievement */}
          {currentLevel > 1 && (
            <div style={{ 
              marginTop: "12px", 
              padding: "8px 12px", 
              backgroundColor: "#f6ffed", 
              borderRadius: "4px",
              border: "1px solid #b7eb8f"
            }}>
              <Text type="success" style={{ fontSize: "12px" }}>
                🎉 Selamat! Anda telah mencapai Level {currentLevel}
              </Text>
            </div>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default UserXPProgress;