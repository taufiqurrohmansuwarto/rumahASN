import { useKnowledgeCategoryAnalytics } from "@/hooks/knowledge-management/use-knowledge-dashboard";
import {
  FolderOutlined,
  FileTextOutlined,
  LikeOutlined,
  MessageOutlined,
  FireOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Row,
  Spin,
  Typography,
  Table,
  Tag,
  Space,
  Progress,
  Statistic,
  Grid,
  Flex,
} from "antd";
import Pie from "@/components/Plots/Pie";
import Column from "@/components/Plots/Column";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CategoryAnalytics = () => {
  const { data, isLoading, error } = useKnowledgeCategoryAnalytics();
  
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
        <Text type="danger">Gagal memuat analitik kategori</Text>
      </Card>
    );
  }

  const categories = data?.categories || [];
  const totalCategories = data?.total_categories || 0;

  // Prepare chart data for content distribution by category
  const contentDistributionData = categories.slice(0, 8).map(cat => ({
    type: cat.name?.length > 15 ? `${cat.name.substring(0, 15)}...` : cat.name,
    value: cat.statistics.total_contents,
  }));

  // Engagement score data
  const engagementData = categories.slice(0, 8).map(cat => ({
    category: cat.name?.length > 12 ? `${cat.name.substring(0, 12)}...` : cat.name,
    score: cat.statistics.engagement_score,
  }));

  const pieConfig = {
    data: contentDistributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: [
      '#ff4500',
      '#1890ff', 
      '#52c41a',
      '#faad14',
      '#722ed1',
      '#13c2c2',
      '#eb2f96',
      '#f759ab',
    ],
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    legend: {
      position: 'bottom',
    },
  };

  const columnConfig = {
    data: engagementData,
    xField: 'category',
    yField: 'score',
    color: '#ff4500',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      category: {
        alias: 'Kategori',
      },
      score: {
        alias: 'Skor Engagement',
      },
    },
    columnWidthRatio: 0.8,
  };

  // Table columns
  const columns = [
    {
      title: "Kategori",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <FolderOutlined style={{ color: "#FF4500" }} />
          <div>
            <Text strong>{text}</Text>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  {record.description.length > 50 
                    ? `${record.description.substring(0, 50)}...` 
                    : record.description
                  }
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Konten",
      key: "content_count",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Statistic
            value={record.statistics.total_contents}
            prefix={<FileTextOutlined />}
            valueStyle={{ fontSize: "16px" }}
          />
        </Space>
      ),
      sorter: (a, b) => a.statistics.total_contents - b.statistics.total_contents,
    },
    {
      title: "Suka",
      key: "likes",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Statistic
            value={record.statistics.total_likes}
            prefix={<LikeOutlined />}
            valueStyle={{ fontSize: "16px", color: "#ff4500" }}
          />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            Rata-rata: {record.statistics.average_likes}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.statistics.total_likes - b.statistics.total_likes,
    },
    {
      title: "Komentar",
      key: "comments",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Statistic
            value={record.statistics.total_comments}
            prefix={<MessageOutlined />}
            valueStyle={{ fontSize: "16px", color: "#1890ff" }}
          />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            Rata-rata: {record.statistics.average_comments}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.statistics.total_comments - b.statistics.total_comments,
    },
    {
      title: "Engagement",
      key: "engagement",
      render: (_, record) => {
        const maxEngagement = Math.max(...categories.map(cat => cat.statistics.engagement_score));
        const percentage = maxEngagement > 0 ? (record.statistics.engagement_score / maxEngagement) * 100 : 0;
        
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <FireOutlined style={{ color: "#faad14" }} />
              <Text strong style={{ marginLeft: "4px" }}>
                {record.statistics.engagement_score}
              </Text>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              showInfo={false}
              strokeColor="#faad14"
            />
          </Space>
        );
      },
      sorter: (a, b) => a.statistics.engagement_score - b.statistics.engagement_score,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const contentCount = record.statistics.total_contents;
        let color = "default";
        let text = "Tidak Ada Konten";
        
        if (contentCount > 10) {
          color = "green";
          text = "Sangat Aktif";
        } else if (contentCount > 5) {
          color = "blue";
          text = "Aktif";
        } else if (contentCount > 0) {
          color = "orange";
          text = "Aktivitas Rendah";
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const totalContent = categories.reduce((sum, cat) => sum + cat.statistics.total_contents, 0);
  const totalLikes = categories.reduce((sum, cat) => sum + cat.statistics.total_likes, 0);
  const totalComments = categories.reduce((sum, cat) => sum + cat.statistics.total_comments, 0);

  return (
    <div>
      <Spin spinning={isLoading}>
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {/* Summary Statistics */}
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
                <FolderOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Kategori"
                  value={totalCategories}
                  valueStyle={{ color: "#FF4500" }}
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
                <FileTextOutlined
                  style={{ color: "#1890ff", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Konten"
                  value={totalContent}
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
                <LikeOutlined
                  style={{ color: "#ff4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Suka"
                  value={totalLikes}
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
                  style={{ color: "#52c41a", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="Total Komentar"
                  value={totalComments}
                  valueStyle={{ color: "#52c41a" }}
                />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Charts */}
        <Col xs={24} md={12}>
          <Card 
            title="Distribusi Konten per Kategori" 
            style={{ 
              height: 400,
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1"
            }}
            styles={{ body: { padding: 0 } }}
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
                  minHeight: "calc(100% - 57px)",
                  borderRadius: "6px",
                }}
              >
                <BarChartOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1, height: 300, padding: isMobile ? "12px" : "16px" }}>
                <Pie {...pieConfig} />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Skor Engagement Kategori" 
            style={{ 
              height: 400,
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1"
            }}
            styles={{ body: { padding: 0 } }}
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
                  minHeight: "calc(100% - 57px)",
                  borderRadius: "6px",
                }}
              >
                <BarChartOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1, height: 300, padding: isMobile ? "12px" : "16px" }}>
                <Column {...columnConfig} />
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Category Details Table */}
        <Col xs={24}>
          <Card 
            title="Detail Analitik Kategori"
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: 0 } }}
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
                  minHeight: "400px",
                  borderRadius: "6px",
                }}
              >
                <FolderOutlined
                  style={{ color: "#FF4500", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
            <Table
              dataSource={categories}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} kategori`,
              }}
              scroll={{ x: 800 }}
              size="middle"
            />
              </div>
            </Flex>
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

        .ant-table-thead > tr > th {
          font-weight: 600 !important;
          color: #1a1a1b !important;
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

export default CategoryAnalytics;