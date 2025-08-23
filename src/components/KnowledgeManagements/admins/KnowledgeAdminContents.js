import { useAdminContents } from "@/hooks/knowledge-management/useAdminContents";
import { SearchOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Input,
  Row,
  Spin,
  Typography,
  Tabs,
  Tag,
  Affix,
} from "antd";
import { useRouter } from "next/router";
import ContentCard from "../components/ContentCard";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const KnowledgeAdminContents = () => {
  const router = useRouter();
  const { status = "draft" } = router.query;

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Status options
  const statusOptions = [
    { key: "draft", label: "Draft", color: "default" },
    { key: "published", label: "Published", color: "success" },
    { key: "rejected", label: "Rejected", color: "error" },
    { key: "archived", label: "Archived", color: "warning" },
  ];

  const {
    searchQuery,
    setSearchQuery,
    allContents,
    statusCounts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useAdminContents(status);

  // Handle status filter change
  const handleStatusChange = (newStatus) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, status: newStatus },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderContentCard = (content) => (
    <ContentCard
      key={content.id}
      content={content}
      isMobile={isMobile}
      onClick={() => {
        router.push(`/knowledge-managements/contents/${content.id}`);
      }}
      showStatus={true}
      isAdmin={true}
    />
  );

  const getCurrentStatusInfo = () => {
    return statusOptions.find((opt) => opt.key === status) || statusOptions[0];
  };

  return (
    <>
      {/* Affix Header */}
      <Affix offsetTop={0}>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #EDEFF1",
            padding: isMobile ? "8px 16px" : "12px 24px",
            zIndex: 1000,
          }}
        >
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="small">
              <SettingOutlined
                style={{
                  color: "#FF4500",
                  fontSize: isMobile ? "18px" : "20px",
                }}
              />
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: isMobile ? "14px" : "16px",
                  lineHeight: "1.4",
                }}
              >
                Admin - Manajemen Konten
              </Text>
            </Flex>
            <Tag color={getCurrentStatusInfo().color}>
              {getCurrentStatusInfo().label}: {statusCounts[status] || 0}
            </Tag>
          </Flex>
        </div>
      </Affix>

      <Row gutter={[0, 24]} style={{ marginTop: isMobile ? "8px" : "12px" }}>
        <Col span={24}>
          {/* Header with Search and Filters */}
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
            }}
            styles={{ body: { padding: isMobile ? "16px" : "20px" } }}
          >
            <Flex
              justify="space-between"
              align={isMobile ? "flex-start" : "center"}
              vertical={isMobile}
              gap="middle"
            >
              <div>
                <Title
                  level={isMobile ? 4 : 3}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    marginBottom: "4px",
                  }}
                >
                  📋 Manajemen Konten Knowledge
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                >
                  Kelola dan moderasi konten knowledge dari pengguna
                </Text>
              </div>

              <Search
                placeholder="Cari konten knowledge..."
                allowClear
                enterButton={<SearchOutlined />}
                size={isMobile ? "middle" : "large"}
                style={{
                  width: isMobile ? "100%" : "400px",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(value) => setSearchQuery(value)}
              />
            </Flex>

            {/* Status Filter Tabs */}
            <div style={{ marginTop: "20px" }}>
              <Tabs
                activeKey={status}
                onChange={handleStatusChange}
                size={isMobile ? "small" : "default"}
                items={statusOptions.map((option) => ({
                  key: option.key,
                  label: (
                    <span>
                      {option.label}
                      <Tag
                        color={option.color}
                        size="small"
                        style={{ marginLeft: "8px" }}
                      >
                        {statusCounts[option.key] || 0}
                      </Tag>
                    </span>
                  ),
                }))}
              />
            </div>
          </Card>
        </Col>

        <Col span={24}>
          {/* Content List */}
          <Card>
            <div style={{ position: "relative", minHeight: "400px" }}>
              {/* Loading overlay untuk initial load */}
              {isLoading && allContents.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <Spin size="large" />
                </div>
              )}

              {/* Search Loading Indicator - hanya untuk search */}
              {isLoading && allContents.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <Spin />
                </div>
              )}

              {/* Content atau Empty State */}
              {allContents.length === 0 && !isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px",
                  }}
                >
                  <Empty
                    description={
                      isError
                        ? "Gagal memuat konten knowledge"
                        : searchQuery
                        ? `Tidak ada hasil untuk "${searchQuery}" dengan status ${getCurrentStatusInfo().label.toLowerCase()}`
                        : `Belum ada konten dengan status ${getCurrentStatusInfo().label.toLowerCase()}`
                    }
                  />
                </div>
              ) : (
                allContents.map(renderContentCard)
              )}

              {/* Load More / Loading */}
              {hasNextPage && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  {isFetchingNextPage ? (
                    <Spin />
                  ) : (
                    <Button
                      type="default"
                      onClick={() => fetchNextPage()}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                      }}
                    >
                      Muat Lebih Banyak
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-input-search .ant-input:focus,
        .ant-input-search .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn:hover {
          border-color: #ff4500 !important;
          color: #ff4500 !important;
        }

        .ant-tabs-tab {
          color: #666 !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff4500 !important;
        }

        .ant-tabs-ink-bar {
          background: #ff4500 !important;
        }

        .ant-avatar {
          border: 2px solid #f0f0f0;
        }

        @media (max-width: 768px) {
          .ant-affix {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </>
  );
};

export default KnowledgeAdminContents;
