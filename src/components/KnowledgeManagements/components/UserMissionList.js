import React from "react";
import { Card, Typography, List, Progress, Tag, Button, Flex, Grid, Empty } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined 
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const UserMissionList = ({ userMissions, loading = false, onCompleteMission }) => {
  // Extract missions from response data format
  const missionsData = userMissions?.data || [];
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
      title={
        <Flex align="center" gap="small">
          <TrophyOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#1A1A1B" }}>
            Mission Aktif ({activeMissions.length})
          </Title>
        </Flex>
      }
      style={{
        borderRadius: "12px",
        border: "1px solid #EDEFF1",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      bodyStyle={{
        padding: isMobile ? "16px" : "20px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {activeMissions.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "#666" }}>
              Belum ada mission yang tersedia.
              <br />
              Mission baru akan segera hadir!
            </Text>
          }
          style={{ margin: "40px 0" }}
        />
      ) : (
        <List
          dataSource={[...inProgressMissions, ...completedMissions]}
          renderItem={(mission) => (
            <List.Item
              style={{
                padding: isMobile ? "12px 0" : "16px 0",
                borderBottom: "1px solid #F0F0F0",
              }}
            >
              <div style={{ width: "100%" }}>
                <Flex justify="space-between" align="flex-start" gap="medium">
                  {/* Mission Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="small" style={{ marginBottom: "6px" }}>
                      {getStatusIcon(mission.status)}
                      <Text
                        strong
                        style={{
                          color: "#1A1A1B",
                          fontSize: isMobile ? "14px" : "15px",
                          textDecoration: mission.status === "completed" ? "line-through" : "none",
                          opacity: mission.status === "completed" ? 0.7 : 1,
                        }}
                      >
                        {mission.title}
                      </Text>
                    </Flex>

                    {mission.description && (
                      <Text
                        style={{
                          color: "#666",
                          fontSize: isMobile ? "12px" : "13px",
                          display: "block",
                          marginBottom: "8px",
                          lineHeight: "1.4",
                        }}
                      >
                        {mission.description}
                      </Text>
                    )}

                    {/* Mission Details */}
                    <Flex align="center" gap="small" wrap>
                      <Tag 
                        color={getMissionTypeColor(mission.frequency)} 
                        style={{ fontSize: "11px" }}
                      >
                        {getMissionTypeLabel(mission.frequency)}
                      </Tag>
                      
                      {mission.target_count && (
                        <Tag color="blue" style={{ fontSize: "11px" }}>
                          Target: {mission.target_count}x
                        </Tag>
                      )}
                      
                      <Tag color="gold" style={{ fontSize: "11px" }}>
                        <StarOutlined style={{ fontSize: "10px", marginRight: "2px" }} />
                        {mission.points_reward} XP
                      </Tag>

                      <Text style={{ color: "#999", fontSize: "11px" }}>
                        <CalendarOutlined style={{ fontSize: "10px", marginRight: "4px" }} />
                        {getStatusText(mission.status)}
                      </Text>
                    </Flex>

                    {/* Progress Bar (jika ada target_count dan current progress) */}
                    {mission.target_count > 1 && mission.current_progress !== undefined && (
                      <div style={{ marginTop: "8px" }}>
                        <Progress
                          percent={(mission.current_progress / mission.target_count) * 100}
                          size="small"
                          strokeColor="#FF4500"
                          format={() => `${mission.current_progress}/${mission.target_count}`}
                        />
                      </div>
                    )}

                    {/* Completed Date */}
                    {mission.status === "completed" && mission.completed_at && (
                      <Text style={{ color: "#52C41A", fontSize: "11px", display: "block", marginTop: "4px" }}>
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
                      style={{
                        backgroundColor: "#52C41A",
                        borderColor: "#52C41A",
                        fontSize: "11px",
                        flexShrink: 0,
                      }}
                      disabled={mission.target_count && mission.current_progress < mission.target_count}
                    >
                      Selesai
                    </Button>
                  )}
                </Flex>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default UserMissionList;