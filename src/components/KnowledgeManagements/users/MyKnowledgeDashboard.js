import {
  getUserOwnContents,
  fetchUserPoints,
  fetchUserBadges,
  fetchUserMissions,
  fetchLeaderboard,
} from "@/services/knowledge-management.services";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Grid,
  Skeleton,
  Empty,
  Button,
  Flex,
  Space,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  LikeOutlined,
  CommentOutlined,
  EyeOutlined,
  TrophyOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  UserBadgeGallery,
  UserMissionList,
  Leaderboard,
  UserXPProgress,
} from "../components";
import {
  useCompleteMission,
  useUserPoints as useGamificationPoints,
  useUserBadges as useGamificationBadges,
  useUserMissions as useGamificationMissions,
  useLeaderboard as useGamificationLeaderboard,
  useUserGamificationSummary,
} from "@/hooks/knowledge-management/useGamification";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MyKnowledgeDashboard = () => {
  const screens = useBreakpoint();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data using useQueries for parallel requests
  const [
    contentsQuery,
    pointsQuery,
    badgesQuery,
    missionsQuery,
    leaderboardQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: ["user-contents-stats"],
        queryFn: () => getUserOwnContents({ limit: 1, includeStats: true }),
        staleTime: 60000, // 1 minute
      },
      {
        queryKey: ["user-points"],
        queryFn: fetchUserPoints,
        staleTime: 60000, // 1 minute
      },
      {
        queryKey: ["user-badges"],
        queryFn: fetchUserBadges,
        staleTime: 300000, // 5 minutes
      },
      {
        queryKey: ["user-missions"],
        queryFn: fetchUserMissions,
        staleTime: 300000, // 5 minutes
      },
      {
        queryKey: ["leaderboard", 10],
        queryFn: () => fetchLeaderboard(10),
        staleTime: 120000, // 2 minutes
      },
    ],
  });

  // Fetch gamification data using dedicated hooks
  const {
    data: gamificationPoints,
    isLoading: loadingGamificationPoints,
    refetch: refetchGamificationPoints,
  } = useGamificationPoints();
  const {
    data: gamificationBadges,
    isLoading: loadingGamificationBadges,
    refetch: refetchGamificationBadges,
  } = useGamificationBadges();
  const {
    data: gamificationMissions,
    isLoading: loadingGamificationMissions,
    refetch: refetchGamificationMissions,
  } = useGamificationMissions();
  const {
    data: gamificationLeaderboard,
    isLoading: loadingGamificationLeaderboard,
    refetch: refetchGamificationLeaderboard,
  } = useGamificationLeaderboard();

  // Use summary hook for comprehensive badge check
  const { refetch: refetchGamificationSummary } = useUserGamificationSummary();

  const isLoading =
    contentsQuery.isLoading || pointsQuery.isLoading || badgesQuery.isLoading;
  const hasError =
    contentsQuery.isError ||
    pointsQuery.isError ||
    badgesQuery.isError ||
    missionsQuery.isError ||
    leaderboardQuery.isError;

  // Extract data
  const contentStats = contentsQuery.data?.stats || {};
  const userPoints = pointsQuery.data?.data || {};
  const userBadges = badgesQuery.data?.data || badgesQuery.data || [];
  const userMissions = missionsQuery.data?.data || missionsQuery.data || [];
  const leaderboardData =
    leaderboardQuery.data?.data || leaderboardQuery.data || [];

  // Gamification data (prioritize gamification hooks over basic queries)
  const finalUserBadges = gamificationBadges || userBadges;
  const finalUserMissions = gamificationMissions || userMissions;
  const finalLeaderboard = gamificationLeaderboard || leaderboardData;

  // Debug: Log badge data
  console.log("🔍 [DASHBOARD] Badge data debug:");
  console.log("- gamificationBadges:", gamificationBadges);
  console.log("- userBadges:", userBadges);
  console.log("- finalUserBadges:", finalUserBadges);

  // Mission completion handler
  const { mutateAsync: completeMission } = useCompleteMission();

  // Manual refresh handler
  const handleRefreshGamification = async () => {
    setRefreshing(true);
    try {
      // PENTING: Refetch summary dulu untuk trigger badge check
      await refetchGamificationSummary();

      // Kemudian refetch semua data gamifikasi
      await Promise.all([
        pointsQuery.refetch(),
        badgesQuery.refetch(),
        missionsQuery.refetch(),
        leaderboardQuery.refetch(),
        refetchGamificationPoints(),
        refetchGamificationBadges(),
        refetchGamificationMissions(),
        refetchGamificationLeaderboard(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteMission = async (missionId) => {
    try {
      await completeMission(missionId);
    } catch (error) {
      console.error("Failed to complete mission:", error);
    }
  };

  // Status statistics
  const statusStats = [
    {
      key: "published",
      label: "Dipublikasikan",
      value: contentStats.published || 0,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    },
    {
      key: "pending",
      label: "Menunggu Review",
      value: contentStats.pending || 0,
      icon: <ClockCircleOutlined style={{ color: "#1890ff" }} />,
    },
    {
      key: "draft",
      label: "Draft",
      value: contentStats.draft || 0,
      icon: <EditOutlined style={{ color: "#faad14" }} />,
    },
    {
      key: "rejected",
      label: "Ditolak",
      value: contentStats.rejected || 0,
      icon: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
    },
  ];

  // Engagement statistics
  const engagementStats = [
    {
      key: "total_likes",
      label: "Total Suka",
      value: contentStats.total_likes || 0,
      icon: <LikeOutlined style={{ color: "#ff4d4f" }} />,
    },
    {
      key: "total_comments",
      label: "Total Komentar",
      value: contentStats.total_comments || 0,
      icon: <CommentOutlined style={{ color: "#1890ff" }} />,
    },
    {
      key: "total_views",
      label: "Total Views",
      value: contentStats.total_views || 0,
      icon: <EyeOutlined style={{ color: "#722ed1" }} />,
    },
  ];

  if (hasError) {
    return (
      <Empty description="Gagal memuat dashboard" style={{ margin: "40px" }} />
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: screens.md ? "16px" : "12px" }}>
      {/* Header Card - SocmedPost Style */}
      <Card
        style={{
          marginBottom: "16px",
          padding: 0,
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
        bodyStyle={{ padding: 0 }}
        hoverable
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#898989";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#EDEFF1";
        }}
      >
        <Flex style={{ minHeight: "80px" }}>
          {/* Icon Section - Reddit Style */}
          <div
            style={{
              width: "60px",
              backgroundColor: "#F8F9FA",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid #EDEFF1",
            }}
          >
            <TrophyOutlined
              style={{
                fontSize: 24,
                color: "#FF4500",
              }}
            />
          </div>

          {/* Content Section */}
          <Flex
            vertical
            style={{ flex: 1, padding: "12px 16px" }}
          >
            <Flex align="center" justify="space-between" style={{ marginBottom: "4px" }}>
              <Text strong style={{ fontSize: "16px", color: "#1A1A1B" }}>
                Dashboard Saya
              </Text>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefreshGamification}
                size="small"
                loading={refreshing}
                style={{ 
                  color: "#878A8C",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1A1A1B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#878A8C";
                }}
              >
                {screens.md && "Refresh"}
              </Button>
            </Flex>
            <Text
              type="secondary"
              style={{ fontSize: "14px", lineHeight: "1.4" }}
            >
              Pantau statistik konten, progres level, badge, misi, dan leaderboard Anda
            </Text>
          </Flex>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        {/* User XP Progress - Enhanced */}
        <Col span={24}>
          <UserXPProgress
            userPoints={gamificationPoints || userPoints}
            loading={loadingGamificationPoints || pointsQuery.isLoading}
          />
        </Col>

        {/* Content Status Statistics */}
        <Col span={24}>
          <Card
            style={{
              marginBottom: "16px",
              padding: 0,
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}
            bodyStyle={{ padding: 0 }}
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
                <FileTextOutlined
                  style={{
                    fontSize: 20,
                    color: "#FF4500",
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{ flex: 1, padding: "16px" }}>
                <Text strong style={{ fontSize: "16px", color: "#1A1A1B", marginBottom: "16px", display: "block" }}>
                  Status Konten
                </Text>
                <Row gutter={[12, 12]}>
                  {statusStats.map((stat) => (
                    <Col xs={12} sm={6} key={stat.key}>
                      {isLoading ? (
                        <Skeleton.Button active block style={{ height: "60px" }} />
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "12px 8px",
                            backgroundColor: "#FAFAFA",
                            borderRadius: "6px",
                            border: "1px solid #F0F0F0",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F5F5F5";
                            e.currentTarget.style.borderColor = "#D0D0D0";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#FAFAFA";
                            e.currentTarget.style.borderColor = "#F0F0F0";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div style={{ marginBottom: "4px" }}>{stat.icon}</div>
                          <div style={{ fontSize: "20px", fontWeight: "600", color: "#1A1A1B" }}>
                            {stat.value}
                          </div>
                          <div style={{ fontSize: "12px", color: "#878A8C" }}>
                            {stat.label}
                          </div>
                        </div>
                      )}
                    </Col>
                  ))}
                </Row>
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Engagement Statistics */}
        <Col span={24}>
          <Card
            style={{
              marginBottom: "16px",
              padding: 0,
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}
            bodyStyle={{ padding: 0 }}
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
                <LikeOutlined
                  style={{
                    fontSize: 20,
                    color: "#FF4500",
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{ flex: 1, padding: "16px" }}>
                <Text strong style={{ fontSize: "16px", color: "#1A1A1B", marginBottom: "16px", display: "block" }}>
                  Statistik Engagement
                </Text>
                <Row gutter={[12, 12]}>
                  {engagementStats.map((stat) => (
                    <Col xs={24} sm={8} key={stat.key}>
                      {isLoading ? (
                        <Skeleton.Button active block style={{ height: "60px" }} />
                      ) : (
                        <Flex
                          align="center"
                          gap="12px"
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#FAFAFA",
                            borderRadius: "6px",
                            border: "1px solid #F0F0F0",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F5F5F5";
                            e.currentTarget.style.borderColor = "#D0D0D0";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#FAFAFA";
                            e.currentTarget.style.borderColor = "#F0F0F0";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div>{stat.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "20px", fontWeight: "600", color: "#1A1A1B" }}>
                              {stat.value}
                            </div>
                            <div style={{ fontSize: "12px", color: "#878A8C" }}>
                              {stat.label}
                            </div>
                          </div>
                        </Flex>
                      )}
                    </Col>
                  ))}
                </Row>
              </div>
            </Flex>
          </Card>
        </Col>

        {/* User Badge Gallery - Full Width */}
        <Col span={24}>
          <UserBadgeGallery
            userBadges={finalUserBadges}
            loading={loadingGamificationBadges || badgesQuery.isLoading}
          />
        </Col>

        {/* Leaderboard - Full Width */}
        <Col span={24}>
          <Leaderboard
            leaderboardData={finalLeaderboard}
            loading={
              loadingGamificationLeaderboard || leaderboardQuery.isLoading
            }
          />
        </Col>

        {/* User Missions - Full Width */}
        <Col span={24}>
          <UserMissionList
            userMissions={finalUserMissions}
            loading={loadingGamificationMissions || missionsQuery.isLoading}
            onCompleteMission={handleCompleteMission}
          />
        </Col>
      </Row>
    </div>
  );
};

export default MyKnowledgeDashboard;
