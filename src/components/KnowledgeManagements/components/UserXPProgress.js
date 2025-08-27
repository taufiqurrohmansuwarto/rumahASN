import React from "react";
import { Card, Progress, Typography, Space, Flex, Grid } from "antd";
import { TrophyOutlined, StarOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const UserXPProgress = ({ userPoints, loading = false }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
        borderRadius: "12px",
        border: "1px solid #EDEFF1",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      bodyStyle={{
        padding: isMobile ? "16px" : "20px",
      }}
    >
      <Flex justify="space-between" align="flex-start" gap="medium">
        {/* Level Badge */}
        <div
          style={{
            minWidth: isMobile ? "60px" : "80px",
            height: isMobile ? "60px" : "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "600",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(255, 69, 0, 0.3)",
          }}
        >
          <TrophyOutlined style={{ fontSize: isMobile ? "16px" : "20px", marginBottom: "2px" }} />
          <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700" }}>
            LV.{currentLevel}
          </div>
        </div>

        {/* Progress Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: "8px" }}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#1A1A1B" }}>
              Level {currentLevel}
            </Title>
            <Space size="small" align="center">
              <StarOutlined style={{ color: "#FFD700", fontSize: "14px" }} />
              <Text strong style={{ color: "#1A1A1B", fontSize: isMobile ? "14px" : "16px" }}>
                {currentXP.toLocaleString()} XP
              </Text>
            </Space>
          </Flex>

          {/* Progress Bar */}
          <Progress
            percent={Math.min(progressPercent, 100)}
            strokeColor={{
              "0%": "#FF4500",
              "100%": "#FFD700",
            }}
            trailColor="#F5F5F5"
            strokeWidth={isMobile ? 8 : 10}
            showInfo={false}
            style={{ marginBottom: "8px" }}
          />

          {/* Progress Text */}
          <Flex justify="space-between" align="center">
            <Text style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>
              {currentLevel < 10 ? `${xpNeededForNext} XP lagi ke Level ${currentLevel + 1}` : "Max Level!"}
            </Text>
            {currentLevel < 10 && (
              <Text style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>
                {Math.round(progressPercent)}%
              </Text>
            )}
          </Flex>
        </div>
      </Flex>

      {/* Level Benefits (Optional) */}
      {currentLevel > 1 && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#FFF7ED",
            borderRadius: "8px",
            border: "1px solid #FED7AA",
          }}
        >
          <Text style={{ color: "#EA580C", fontSize: "12px", fontWeight: "500" }}>
            🎉 Selamat! Anda telah mencapai Level {currentLevel}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default UserXPProgress;