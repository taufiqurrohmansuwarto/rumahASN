import React from "react";
import { Card, Typography, List, Progress, Tag, Button, Empty, Flex } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined 
} from "@ant-design/icons";

const { Text } = Typography;

const UserMissionList = ({ userMissions, loading = false, onCompleteMission }) => {
  // Extract missions from response data format
  const missionsData = userMissions?.data || [];

  const getMissionTypeColor = (frequency) => {
    switch (frequency) {
      case "daily":
        return "blue";
      case "weekly":
        return "green";
      case "monthly":
        return "purple";
      case "once":
        return "orange";
      default:
        return "default";
    }
  };

  const getMissionTypeLabel = (frequency) => {
    switch (frequency) {
      case "daily":
        return "Harian";
      case "weekly":
        return "Mingguan";
      case "monthly":
        return "Bulanan";
      case "once":
        return "Sekali";
      default:
        return frequency;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52C41A" }} />;
      case "in_progress":
        return <ClockCircleOutlined style={{ color: "#1890FF" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#666" }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "in_progress":
        return "Sedang Berjalan";
      default:
        return "Belum Dimulai";
    }
  };

  // Filter dan sort missions
  const activeMissions = missionsData.filter(mission => mission.is_active);
  const inProgressMissions = activeMissions.filter(mission => mission.status !== "completed");
  const completedMissions = activeMissions.filter(mission => mission.status === "completed");

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
      <Flex style={{ minHeight: "60px" }}>
        {/* Icon Section */}
        <div
          style={{
            width: "60px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <TrophyOutlined
            style={{
              fontSize: 20,
              color: "#FF4500",
            }}
          />
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, maxHeight: "400px", overflowY: "auto" }}>
          <div style={{ padding: "16px 16px 8px 16px" }}>
            <Text strong style={{ fontSize: "16px", color: "#1A1A1B" }}>
              Mission Aktif ({activeMissions.length})
            </Text>
          </div>
          
          {activeMissions.length === 0 ? (
            <div style={{ padding: "16px" }}>
              <Empty description="Belum ada mission yang tersedia" />
            </div>
          ) : (
            <List
              dataSource={[...inProgressMissions, ...completedMissions]}
              renderItem={(mission) => (
                <List.Item 
                  style={{ 
                    display: "block", 
                    padding: "12px 16px",
                    borderBottom: "1px solid #F0F0F0",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Flex justify="space-between" align="flex-start" gap="12px">
                    {/* Mission Info */}
                    <div style={{ flex: 1 }}>
                      <Flex align="center" gap="8px" style={{ marginBottom: "8px" }}>
                        {getStatusIcon(mission.status)}
                        <Text 
                          strong 
                          style={{ 
                            textDecoration: mission.status === "completed" ? "line-through" : "none",
                            opacity: mission.status === "completed" ? 0.7 : 1,
                            color: "#1A1A1B"
                          }}
                        >
                          {mission.title}
                        </Text>
                      </Flex>

                      {mission.description && (
                        <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                          {mission.description}
                        </Text>
                      )}

                      <Flex align="center" gap="8px" wrap style={{ marginBottom: "8px" }}>
                        <Tag color={getMissionTypeColor(mission.frequency)} size="small">
                          {getMissionTypeLabel(mission.frequency)}
                        </Tag>
                        
                        {mission.target_count && (
                          <Tag color="blue" size="small">Target: {mission.target_count}x</Tag>
                        )}
                        
                        <Tag color="gold" size="small">
                          <StarOutlined /> {mission.points_reward} XP
                        </Tag>

                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <CalendarOutlined /> {getStatusText(mission.status)}
                        </Text>
                      </Flex>

                      {/* Progress Bar */}
                      {mission.target_count > 1 && mission.current_progress !== undefined && (
                        <Progress
                          percent={(mission.current_progress / mission.target_count) * 100}
                          size="small"
                          format={() => `${mission.current_progress}/${mission.target_count}`}
                          style={{ marginBottom: "8px" }}
                          strokeColor="#FF4500"
                        />
                      )}

                      {/* Completed Date */}
                      {mission.status === "completed" && mission.completed_at && (
                        <Text type="success" style={{ fontSize: "12px", display: "block" }}>
                          ✅ Selesai pada {new Date(mission.completed_at).toLocaleDateString('id-ID')}
                        </Text>
                      )}
                    </div>

                    {/* Action Button */}
                    {mission.status === "in_progress" && onCompleteMission && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onCompleteMission(mission.id)}
                        disabled={mission.target_count && mission.current_progress < mission.target_count}
                        style={{
                          backgroundColor: mission.target_count && mission.current_progress < mission.target_count 
                            ? undefined 
                            : "#FF4500",
                          borderColor: mission.target_count && mission.current_progress < mission.target_count 
                            ? undefined 
                            : "#FF4500",
                        }}
                      >
                        Selesai
                      </Button>
                    )}
                  </Flex>
                </List.Item>
              )}
            />
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default UserMissionList;