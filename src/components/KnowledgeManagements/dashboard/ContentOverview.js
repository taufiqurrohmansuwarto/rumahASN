import Column from "@/components/Plots/Column";
import Pie from "@/components/Plots/Pie";
import { useKnowledgeDashboardOverview } from "@/hooks/knowledge-management/use-knowledge-dashboard";
import {
  AccountBookOutlined,
  EyeOutlined,
  FileTextOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  TrophyOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  Flex,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  Grid,
} from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const ContentOverview = () => {
  const { data, isLoading, error } = useKnowledgeDashboardOverview();
  
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (error) {
    return (
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #EDEFF1",
        }}
      >
        <Text type="danger">Gagal memuat data dashboard</Text>
      </Card>
    );
  }

  const contentStats = data?.content_statistics || {};
  const interactionStats = data?.interaction_statistics || {};
  const performanceData = data?.performance_data || {};
  const adminMetrics = data?.admin_metrics || {};
  const topContent = performanceData?.top_content || [];
  const topAuthors = performanceData?.top_authors || [];
  const monthlyTrend = performanceData?.monthly_trend || [];

  // Chart data for content status distribution
  const contentStatusData = [
    {
      type: "Dipublikasikan",
      value: contentStats.published_contents || 0,
    },
    {
      type: "Draft",
      value: contentStats.draft_contents || 0,
    },
    {
      type: "Menunggu",
      value: contentStats.pending_contents || 0,
    },
    {
      type: "Ditolak",
      value: contentStats.rejected_contents || 0,
    },
    {
      type: "Diarsipkan",
      value: contentStats.archived_contents || 0,
    },
  ];

  // Chart data for engagement metrics
  const engagementData = [
    {
      metric: "Total Suka",
      value: contentStats.total_likes || 0,
    },
    {
      metric: "Total Komentar",
      value: contentStats.total_comments || 0,
    },
    {
      metric: "Rata-rata Suka",
      value: Math.round(contentStats.avg_likes_per_content || 0),
    },
    {
      metric: "Rata-rata Komentar",
      value: Math.round(contentStats.avg_comments_per_content || 0),
    },
  ];

  const pieConfig = {
    data: contentStatusData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    color: ["#52c41a", "#faad14", "#1890ff", "#ff4d4f"],
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  const columnConfig = {
    data: engagementData,
    xField: "metric",
    yField: "value",
    color: ({ metric }) => {
      if (metric.includes("Suka")) return "#ff4500";
      if (metric.includes("Komentar")) return "#1890ff";
      return "#52c41a";
    },
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      metric: {
        alias: "Metrik",
      },
      value: {
        alias: "Nilai",
      },
    },
  };

  return (
    <div>
      <Spin spinning={isLoading}>
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {/* Statistics Cards Row 1 - Content Stats */}
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <FileTextOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Konten"
                  value={contentStats.total_contents || 0}
                  valueStyle={{ color: "#1890ff" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <EyeOutlined
                  style={{ color: "#52c41a", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Dipublikasikan"
                  value={contentStats.published_contents || 0}
                  valueStyle={{ color: "#52c41a" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <LikeOutlined
                  style={{ color: "#ff4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Suka"
                  value={contentStats.total_likes || 0}
                  valueStyle={{ color: "#ff4500" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <MessageOutlined
                  style={{ color: "#fa8c16", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Komentar"
                  value={contentStats.total_comments || 0}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Statistics Cards Row 2 - System Interaction Stats */}
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <HeartOutlined
                  style={{ color: "#722ed1", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Suka Sistem"
                  value={interactionStats.total_system_likes || 0}
                  valueStyle={{ color: "#722ed1" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <AccountBookOutlined
                  style={{ color: "#13c2c2", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Bookmark Sistem"
                  value={interactionStats.total_system_bookmarks || 0}
                  valueStyle={{ color: "#13c2c2" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <UserOutlined
                  style={{ color: "#eb2f96", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Pengguna Aktif"
                  value={interactionStats.total_active_users || 0}
                  valueStyle={{ color: "#eb2f96" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <EyeOutlined
                  style={{ color: "#f759ab", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Menunggu Review"
                  value={adminMetrics.recent_activity?.pending_reviews || 0}
                  valueStyle={{ color: "#f759ab" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Charts Row */}
        <Col xs={24} md={12}>
          <Card 
            title="Distribusi Status Konten" 
            style={{ 
              height: 400,
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1"
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <BarChartOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1, height: 300 }}>
                <Pie {...pieConfig} />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Metrik Engagement" 
            style={{ 
              height: 400,
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1"
            }}
            styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                  marginRight: "12px",
                  borderRadius: "6px",
                }}
              >
                <BarChartOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1, height: 300 }}>
                <Column {...columnConfig} />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Top Content & User Points */}
        <Col xs={24} md={12}>
          <Card
            title="Konten Teratas"
            style={{ height: 400 }}
            bodyStyle={{
              padding: "16px",
              height: "calc(100% - 57px)",
              overflowY: "auto",
            }}
          >
            <List
              dataSource={topContent}
              locale={{ emptyText: "Belum ada konten" }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.author?.image}
                        icon={<UserOutlined />}
                        size="small"
                      />
                    }
                    title={
                      <Space wrap>
                        <Text strong style={{ fontSize: "13px" }}>
                          {item.title?.length > 40
                            ? `${item.title.substring(0, 40)}...`
                            : item.title}
                        </Text>
                        {item.category && (
                          <Tag
                            color="orange"
                            style={{ fontSize: "10px", margin: 0 }}
                          >
                            {item.category.name}
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Flex
                        align="center"
                        gap={12}
                        style={{ fontSize: "11px", color: "#666" }}
                      >
                        <Space size={4}>
                          <LikeOutlined />
                          <span>{item.likes_count || 0}</span>
                        </Space>
                        <Space size={4}>
                          <MessageOutlined />
                          <span>{item.comments_count || 0}</span>
                        </Space>
                        <Text style={{ fontSize: "10px", color: "#999" }}>
                          oleh {item.author?.username}
                        </Text>
                      </Flex>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Penulis Teratas"
            style={{ height: 400 }}
            bodyStyle={{ padding: "16px", height: "calc(100% - 57px)", overflowY: "auto" }}
          >
            <List
              dataSource={topAuthors}
              locale={{ emptyText: "Belum ada penulis" }}
              renderItem={(item, index) => (
                <List.Item key={item.author_id}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: index === 0 ? "#gold" : index === 1 ? "#silver" : "#bronze",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white"
                        }}>
                          #{index + 1}
                        </div>
                        <Avatar
                          src={item.author?.image}
                          icon={<UserOutlined />}
                          size="small"
                        />
                      </div>
                    }
                    title={
                      <Text strong style={{ fontSize: "13px" }}>
                        {item.author?.username || "Penulis Tidak Dikenal"}
                      </Text>
                    }
                    description={
                      <Text style={{ fontSize: "11px", color: "#666" }}>
                        Konten dipublikasikan: {item.content_count || 0}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        </Row>
      </Spin>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-statistic-title {
          font-weight: 500 !important;
          color: #1a1a1b !important;
        }

        .ant-statistic-content {
          font-weight: 600 !important;
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentOverview;
