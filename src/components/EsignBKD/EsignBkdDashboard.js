import {
  Card,
  Statistic,
  Button,
  List,
  Typography,
  Space,
  Badge,
  Flex,
  Row,
  Col,
  Grid,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  usePendingDocuments,
  useCompletedDocuments,
  useRejectedDocuments,
  useMarkedCount,
} from "@/hooks/esign-bkd";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import CheckTTE from "@/components/EsignBKD/CheckTTE";
dayjs.locale("id");
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const StatCard = ({ title, value, icon, color, loading, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{
      flex: 1,
      minWidth: 280,
      cursor: "pointer",
      borderRadius: 12,
      border: "1px solid #e8e8ea",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
    styles={{
      body: { padding: 24 },
    }}
  >
    <Statistic
      title={
        <Text style={{ fontSize: 14, color: "#8e8e93", fontWeight: 500 }}>
          {title}
        </Text>
      }
      value={value}
      loading={loading}
      prefix={
        <span style={{ color, fontSize: 20, marginRight: 8 }}>{icon}</span>
      }
      valueStyle={{
        color: "#1d1d1f",
        fontSize: 32,
        fontWeight: 600,
        lineHeight: "40px",
      }}
    />
  </Card>
);

const RecentActivity = ({ data, loading, title, emptyText }) => (
  <Flex vertical>
    <Title level={4} style={{ margin: "0 0 20px 0", color: "#1d1d1f" }}>
      {title}
    </Title>
    <List
      loading={loading}
      dataSource={data?.data?.slice(0, 5) || []}
      locale={{ emptyText }}
      style={{ borderRadius: 8 }}
      renderItem={(item) => (
        <List.Item
          style={{
            padding: "16px 0",
          }}
          actions={[
            <Button
              key={item.id}
              size="small"
              icon={<EyeOutlined />}
              type="link"
              style={{
                color: "#1890ff",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Lihat
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={
              <Flex align="center" gap="small" style={{ marginBottom: 4 }}>
                <Text strong style={{ fontSize: 15, color: "#1d1d1f" }}>
                  {item.title}
                </Text>
                <Badge
                  status={
                    item.status === "completed"
                      ? "success"
                      : item.status === "rejected"
                      ? "error"
                      : "processing"
                  }
                  text={item.status}
                  style={{ fontSize: 12 }}
                />
              </Flex>
            }
            description={
              <Flex vertical gap={4}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {item.description}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, color: "#8e8e93" }}
                >
                  {dayjs(item.created_at).fromNow()}
                </Text>
              </Flex>
            }
          />
        </List.Item>
      )}
    />
  </Flex>
);

function EsignBkdDashboard() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;

  const { data: pendingData, isLoading: pendingLoading } =
    usePendingDocuments();
  const { data: completedData, isLoading: completedLoading } =
    useCompletedDocuments();
  const { data: rejectedData, isLoading: rejectedLoading } =
    useRejectedDocuments();
  const { data: markedCount, isLoading: countLoading } = useMarkedCount();

  const navigateTo = (path) => {
    router.push(`/esign-bkd${path}`);
  };

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <SafetyOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Dashboard E-Sign BKD
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Kelola dokumen elektronik dan tanda tangan digital
            </Text>
          </div>

          <CheckTTE />

          {/* Action Button Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Text style={{ fontSize: 16, color: "#6b7280" }}>
                  Sistem manajemen dokumen elektronik dan tanda tangan digital
                </Text>
              </Col>
              <Col
                xs={24}
                md={8}
                style={{
                  display: "flex",
                  justifyContent: isXs ? "flex-start" : "flex-end",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => navigateTo("/documents/create")}
                  style={{
                    background: "#FF4500",
                    borderColor: "#FF4500",
                    borderRadius: 8,
                    height: 48,
                    paddingInline: 24,
                    fontWeight: 500,
                  }}
                  block={isXs}
                >
                  Upload Dokumen
                </Button>
              </Col>
            </Row>
          </div>

          {/* Stats Cards */}
          <div style={{ marginTop: "16px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card
                  hoverable
                  onClick={() => navigateTo("/pending")}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Statistic
                    title={
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Dokumen Pending
                      </Text>
                    }
                    value={pendingData?.total || 0}
                    loading={pendingLoading}
                    prefix={
                      <ClockCircleOutlined
                        style={{
                          color: "#faad14",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#1d1d1f",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  hoverable
                  onClick={() => navigateTo("/delegated")}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Statistic
                    title={
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Marked for TTE
                      </Text>
                    }
                    value={markedCount?.total || 0}
                    loading={countLoading}
                    prefix={
                      <EditOutlined
                        style={{
                          color: "#722ed1",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#1d1d1f",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  hoverable
                  onClick={() => navigateTo("/documents?status=completed")}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Statistic
                    title={
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Selesai
                      </Text>
                    }
                    value={completedData?.total || 0}
                    loading={completedLoading}
                    prefix={
                      <CheckCircleOutlined
                        style={{
                          color: "#52c41a",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#1d1d1f",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  hoverable
                  onClick={() => navigateTo("/documents?status=rejected")}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Statistic
                    title={
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Ditolak
                      </Text>
                    }
                    value={rejectedData?.total || 0}
                    loading={rejectedLoading}
                    prefix={
                      <CloseCircleOutlined
                        style={{
                          color: "#f5222d",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#1d1d1f",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Action Cards */}
          <div style={{ marginTop: "16px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      margin: "0 0 20px 0",
                      color: "#1d1d1f",
                      fontSize: 16,
                    }}
                  >
                    Aksi Cepat
                  </Title>
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Button
                      block
                      size="large"
                      onClick={() => navigateTo("/pending")}
                      icon={<ClockCircleOutlined />}
                      style={{
                        height: 48,
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Review Dokumen Pending
                    </Button>
                    <Button
                      block
                      size="large"
                      onClick={() => navigateTo("/delegated")}
                      icon={<EditOutlined />}
                      style={{
                        height: 48,
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Tanda Tangan Delegasi
                    </Button>
                    <Button
                      block
                      size="large"
                      onClick={() => navigateTo("/bsre")}
                      icon={<CheckCircleOutlined />}
                      style={{
                        height: 48,
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Monitor BSrE
                    </Button>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <RecentActivity
                    data={pendingData}
                    loading={pendingLoading}
                    title="Aktivitas Terbaru"
                    emptyText="Tidak ada aktivitas terbaru"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default EsignBkdDashboard;
