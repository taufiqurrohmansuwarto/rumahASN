import { getUserOwnContents, getUserPoints, getUserBadges } from "@/services/knowledge-management.services";
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
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MyKnowledgeDashboard = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch user data using useQueries for parallel requests
  const [contentsQuery, pointsQuery, badgesQuery] = useQueries({
    queries: [
      {
        queryKey: ["user-contents-stats"],
        queryFn: () => getUserOwnContents({ limit: 1, includeStats: true }),
        staleTime: 60000, // 1 minute
      },
      {
        queryKey: ["user-points"],
        queryFn: getUserPoints,
        staleTime: 60000, // 1 minute
      },
      {
        queryKey: ["user-badges"],
        queryFn: getUserBadges,
        staleTime: 300000, // 5 minutes
      },
    ],
  });

  const isLoading = contentsQuery.isLoading || pointsQuery.isLoading || badgesQuery.isLoading;
  const hasError = contentsQuery.isError || pointsQuery.isError || badgesQuery.isError;

  // Extract data
  const contentStats = contentsQuery.data?.stats || {};
  const userPoints = pointsQuery.data || {};
  const userBadges = badgesQuery.data || [];

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

  // Get user level info
  const getUserLevel = () => {
    const currentXP = userPoints.current_xp || 0;
    const level = Math.floor(currentXP / 100) + 1;
    const nextLevelXP = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentXP;
    const progressPercentage = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

    return {
      level,
      currentXP,
      nextLevelXP,
      neededXP,
      progressPercentage,
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
              Dashboard Knowledge Saya
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              Pantau progres dan pencapaian Anda dalam berbagi pengetahuan
            </Text>
          </div>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        {/* User Level & XP */}
        <Col span={24}>
          <Card
            style={{
              borderRadius: "8px",
              border: "1px solid #EDEFF1",
            }}
          >
            {isLoading ? (
              <Skeleton active />
            ) : (
              <Flex align="center" gap="large">
                <Avatar
                  size={isMobile ? 56 : 72}
                  style={{
                    backgroundColor: "#FF4500",
                    fontSize: isMobile ? "24px" : "32px",
                  }}
                >
                  {levelInfo.level}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Flex justify="space-between" align="center" style={{ marginBottom: "8px" }}>
                    <Text strong style={{ fontSize: "16px" }}>
                      Level {levelInfo.level}
                    </Text>
                    <Text style={{ color: "#666", fontSize: "14px" }}>
                      {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP
                    </Text>
                  </Flex>
                  <Progress
                    percent={levelInfo.progressPercentage}
                    strokeColor="#FF4500"
                    size={isMobile ? "small" : "default"}
                    showInfo={false}
                  />
                  <Text style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                    Butuh {levelInfo.neededXP} XP lagi untuk naik level
                  </Text>
                </div>
              </Flex>
            )}
          </Card>
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

        {/* User Badges */}
        <Col span={24}>
          <Card
            title={
              <Flex align="center" gap="small">
                <StarOutlined style={{ color: "#FF4500" }} />
                <span>Badge Saya ({userBadges.length})</span>
              </Flex>
            }
            style={{
              borderRadius: "8px",
              border: "1px solid #EDEFF1",
            }}
          >
            {isLoading ? (
              <Skeleton active />
            ) : userBadges.length > 0 ? (
              <Row gutter={[12, 12]}>
                {userBadges.slice(0, 6).map((badge) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={badge.id}>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        textAlign: "center",
                        borderColor: "#FFD700",
                        borderWidth: "2px",
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                        {badge.icon || "🏆"}
                      </div>
                      <Text
                        strong
                        style={{
                          fontSize: "12px",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {badge.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          display: "block",
                        }}
                      >
                        {badge.description}
                      </Text>
                    </Card>
                  </Col>
                ))}
                {userBadges.length > 6 && (
                  <Col xs={12} sm={8} md={6} lg={4}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        borderStyle: "dashed",
                        borderColor: "#d9d9d9",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Text style={{ color: "#666", fontSize: "12px" }}>
                        +{userBadges.length - 6} badge lainnya
                      </Text>
                    </Card>
                  </Col>
                )}
              </Row>
            ) : (
              <Empty
                description="Belum ada badge yang diraih"
                image={<StarOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />}
              />
            )}
          </Card>
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