import ContentOverview from "@/components/KnowledgeManagements/dashboard/ContentOverview";
import CategoryAnalytics from "@/components/KnowledgeManagements/dashboard/CategoryAnalytics";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";
import { useKnowledgeDashboardOverview, useKnowledgeCategoryAnalytics } from "@/hooks/knowledge-management/use-knowledge-dashboard";

const { Title } = Typography;

const KnowledgeDashboard = () => {
  const { refetch: refetchOverview, isFetching: isRefetchingOverview } = useKnowledgeDashboardOverview();
  const { refetch: refetchCategories, isFetching: isRefetchingCategories } = useKnowledgeCategoryAnalytics();

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchOverview(),
      refetchCategories()
    ]);
  };

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px" 
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1A1A1B" }}>
              📊 Knowledge Management Dashboard
            </Title>
            <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
              Comprehensive analytics and insights for knowledge content performance
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={isRefetchingOverview || isRefetchingCategories}
            onClick={handleRefreshAll}
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              borderColor: "#FF4500",
              boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
            }}
          >
            Refresh All Data
          </Button>
        </div>
      </Card>

      {/* Content Overview Section */}
      <Card 
        title={
          <Space>
            <span style={{ fontSize: "18px" }}>🎯 Content Overview</span>
            <Typography.Text type="secondary" style={{ fontSize: "13px", fontWeight: "normal" }}>
              System-wide content statistics and user engagement metrics
            </Typography.Text>
          </Space>
        }
        style={{ marginBottom: "24px" }}
        bodyStyle={{ padding: "20px" }}
      >
        <ContentOverview />
      </Card>

      {/* Category Analytics Section */}
      <Card 
        title={
          <Space>
            <span style={{ fontSize: "18px" }}>📁 Category Analytics</span>
            <Typography.Text type="secondary" style={{ fontSize: "13px", fontWeight: "normal" }}>
              Performance analysis by content categories
            </Typography.Text>
          </Space>
        }
        bodyStyle={{ padding: "20px" }}
      >
        <CategoryAnalytics />
      </Card>
    </div>
  );
};

export default KnowledgeDashboard;
