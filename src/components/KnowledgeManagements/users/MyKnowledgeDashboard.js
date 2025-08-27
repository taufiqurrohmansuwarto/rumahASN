import { 
  getUserOwnContents, 
  fetchUserPoints, 
  fetchUserBadges, 
  fetchUserMissions,
  fetchLeaderboard 
} from "@/services/knowledge-management.services";
import { useQueries } from "@tanstack/react-query";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Flex,
  Avatar,
  Progress,
  Grid,
  Skeleton,
  Empty,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  LikeOutlined,
  CommentOutlined,
  EyeOutlined,
  TrophyOutlined,
  StarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { 
  UserBadgeGallery, 
  UserMissionList, 
  Leaderboard,
  UserXPProgress 
} from "../components";
import { 
  useCompleteMission,
  useUserPoints as useGamificationPoints,
  useUserBadges as useGamificationBadges,
  useUserMissions as useGamificationMissions,
  useLeaderboard as useGamificationLeaderboard
} from "@/hooks/knowledge-management/useGamification";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MyKnowledgeDashboard = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch user data using useQueries for parallel requests
  const [contentsQuery, pointsQuery, badgesQuery, missionsQuery, leaderboardQuery] = useQueries({
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
  const { data: gamificationPoints, isLoading: loadingGamificationPoints } = useGamificationPoints();
  const { data: gamificationBadges, isLoading: loadingGamificationBadges } = useGamificationBadges();
  const { data: gamificationMissions, isLoading: loadingGamificationMissions } = useGamificationMissions();
  const { data: gamificationLeaderboard, isLoading: loadingGamificationLeaderboard } = useGamificationLeaderboard();

  const isLoading = contentsQuery.isLoading || pointsQuery.isLoading || badgesQuery.isLoading;
  const hasError = contentsQuery.isError || pointsQuery.isError || badgesQuery.isError || missionsQuery.isError || leaderboardQuery.isError;

  // Extract data
  const contentStats = contentsQuery.data?.stats || {};
  const userPoints = pointsQuery.data?.data || {};
  const userBadges = badgesQuery.data?.data || badgesQuery.data || [];
  const userMissions = missionsQuery.data?.data || missionsQuery.data || [];
  const leaderboardData = leaderboardQuery.data?.data || leaderboardQuery.data || [];
  
  // Gamification data (prioritize gamification hooks over basic queries)
  const finalUserBadges = gamificationBadges?.data || gamificationBadges || userBadges;
  const finalUserMissions = gamificationMissions?.data || gamificationMissions || userMissions;
  const finalLeaderboard = gamificationLeaderboard?.data || gamificationLeaderboard || leaderboardData;

  // Mission completion handler
  const { mutateAsync: completeMission } = useCompleteMission();
  
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
      color: "#52c41a",
      icon: <CheckCircleOutlined />,
    },
    {
      key: "pending",
      label: "Menunggu Review",
      value: contentStats.pending || 0,
      color: "#1890ff",
      icon: <ClockCircleOutlined />,
    },
    {
      key: "draft",
      label: "Draft",
      value: contentStats.draft || 0,
      color: "#faad14",
      icon: <EditOutlined />,
    },
    {
      key: "rejected",
      label: "Ditolak",
      value: contentStats.rejected || 0,
      color: "#f5222d",
      icon: <CloseCircleOutlined />,
    },
  ];

  // Engagement statistics
  const engagementStats = [
    {
      key: "total_likes",
      label: "Total Suka",
      value: contentStats.total_likes || 0,
      icon: <LikeOutlined />,
      color: "#ff4d4f",
    },
    {
      key: "total_comments",
      label: "Total Komentar",
      value: contentStats.total_comments || 0,
      icon: <CommentOutlined />,
      color: "#1890ff",
    },
    {
      key: "total_views",
      label: "Total Views",
      value: contentStats.total_views || 0,
      icon: <EyeOutlined />,
      color: "#722ed1",
    },
  ];

  // Get user level info (using new gamification calculation)
  const getUserLevel = () => {
    const currentXP = userPoints.points || 0;
    const level = userPoints.levels || userPoints.level || 1;
    
    // Calculate XP range for current and next level (matching gamification logic)
    const getXPForLevel = (lvl) => {
      if (lvl <= 1) return 0;
      return Math.pow(lvl - 1, 2) * 50;
    };

    const currentLevelMinXP = getXPForLevel(level);
    const nextLevelMinXP = getXPForLevel(level + 1);
    const progressXP = currentXP - currentLevelMinXP;
    const neededXP = nextLevelMinXP - currentXP;
    const progressPercentage = ((currentXP - currentLevelMinXP) / (nextLevelMinXP - currentLevelMinXP)) * 100;

    return {
      level,
      currentXP,
      nextLevelXP: nextLevelMinXP,
      neededXP: Math.max(0, neededXP),
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    };
  };

  const levelInfo = getUserLevel();

  if (hasError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Gagal memuat dashboard" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "12px" : "16px" }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #EDEFF1",
          background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
        }}
        styles={{ body: { padding: isMobile ? "16px" : "24px" } }}
      >
        <Flex align="center" gap="middle">
          <Avatar
            size={isMobile ? 48 : 64}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontSize: isMobile ? "20px" : "24px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
            icon={<TrophyOutlined />}
          />
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{
                margin: 0,
                color: "white",
                marginBottom: "4px",
              }}
            >
              Dashboard Saya
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              Pantau statistik konten, progres level, badge, misi, dan leaderboard Anda
            </Text>
          </div>
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
            title={
              <Flex align="center" gap="small">
                <FileTextOutlined style={{ color: "#FF4500" }} />
                <span>Status Konten</span>
              </Flex>
            }
            style={{
              borderRadius: "8px",
              border: "1px solid #EDEFF1",
            }}
          >
            <Row gutter={[16, 16]}>
              {statusStats.map((stat) => (
                <Col xs={12} sm={6} key={stat.key}>
                  {isLoading ? (
                    <Skeleton.Button active style={{ width: "100%", height: "80px" }} />
                  ) : (
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        borderColor: stat.color,
                        borderWidth: "2px",
                      }}
                    >
                      <div style={{ color: stat.color, fontSize: "24px", marginBottom: "8px" }}>
                        {stat.icon}
                      </div>
                      <Statistic
                        value={stat.value}
                        title={stat.label}
                        valueStyle={{
                          color: stat.color,
                          fontSize: isMobile ? "20px" : "24px",
                        }}
                      />
                    </Card>
                  )}
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Engagement Statistics */}
        <Col span={24}>
          <Card
            title={
              <Flex align="center" gap="small">
                <LikeOutlined style={{ color: "#FF4500" }} />
                <span>Statistik Engagement</span>
              </Flex>
            }
            style={{
              borderRadius: "8px",
              border: "1px solid #EDEFF1",
            }}
          >
            <Row gutter={[16, 16]}>
              {engagementStats.map((stat) => (
                <Col xs={24} sm={8} key={stat.key}>
                  {isLoading ? (
                    <Skeleton.Button active style={{ width: "100%", height: "80px" }} />
                  ) : (
                    <Statistic
                      title={stat.label}
                      value={stat.value}
                      prefix={<div style={{ color: stat.color }}>{stat.icon}</div>}
                      valueStyle={{
                        color: stat.color,
                        fontSize: isMobile ? "20px" : "24px",
                      }}
                    />
                  )}
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Badges and Leaderboard Row */}
        <Col xs={24} lg={16}>
          <UserBadgeGallery 
            userBadges={finalUserBadges} 
            loading={loadingGamificationBadges || badgesQuery.isLoading}
          />
        </Col>
        
        <Col xs={24} lg={8}>
          <Leaderboard 
            leaderboardData={finalLeaderboard} 
            loading={loadingGamificationLeaderboard || leaderboardQuery.isLoading}
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

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-statistic-content {
          text-align: center;
        }

        .ant-progress-bg {
          border-radius: 10px !important;
        }

        .ant-progress-inner {
          border-radius: 10px !important;
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyKnowledgeDashboard;