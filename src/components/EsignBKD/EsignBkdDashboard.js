import {
  Card,
  Statistic,
  Button,
  List,
  Typography,
  Space,
  Badge,
  Flex,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  usePendingDocuments,
  useMarkedForTteDocuments,
  useCompletedDocuments,
  useRejectedDocuments,
  useMarkedCount,
} from "@/hooks/esign-bkd";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("id");
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color, loading, onClick }) => (
  <Card hoverable onClick={onClick} style={{ flex: 1, minWidth: 240, cursor: "pointer" }}>
    <Statistic
      title={title}
      value={value}
      loading={loading}
      prefix={icon}
      valueStyle={{ color }}
    />
  </Card>
);

const RecentActivity = ({ data, loading, title, emptyText }) => (
  <Flex vertical>
    <Title level={4} style={{ margin: "0 0 16px 0" }}>{title}</Title>
    <List
      loading={loading}
      dataSource={data?.data?.slice(0, 5) || []}
      locale={{ emptyText }}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key={item.id}
              size="small"
              icon={<EyeOutlined />}
              type="link"
            >
              Lihat
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={
              <Flex align="center" gap="small">
                <Text strong>{item.title}</Text>
                <Badge
                  status={
                    item.status === "completed"
                      ? "success"
                      : item.status === "rejected"
                      ? "error"
                      : "processing"
                  }
                  text={item.status}
                />
              </Flex>
            }
            description={
              <Flex vertical gap="small">
                <Text type="secondary">{item.description}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
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

  const { data: pendingData, isLoading: pendingLoading } =
    usePendingDocuments();
  const { data: markedData, isLoading: markedLoading } =
    useMarkedForTteDocuments();
  const { data: completedData, isLoading: completedLoading } =
    useCompletedDocuments();
  const { data: rejectedData, isLoading: rejectedLoading } =
    useRejectedDocuments();
  const { data: markedCount, isLoading: countLoading } = useMarkedCount();

  const navigateTo = (path) => {
    router.push(`/esign-bkd${path}`);
  };

  return (
    <Flex vertical gap="large" style={{ minHeight: "100vh", background: "#f5f5f5", padding: "16px" }}>
      <Flex justify="space-between" align="center" style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>Dashboard E-Sign BKD</Title>
          <Text type="secondary">
            Kelola dokumen elektronik dan tanda tangan digital
          </Text>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<FileTextOutlined />}
          onClick={() => navigateTo("/documents/create")}
        >
          Upload Dokumen
        </Button>
      </Flex>

      <Flex vertical gap="large" style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Stats Cards */}
        <Flex gap="middle" wrap="wrap">
          <StatCard
            title="Dokumen Pending"
            value={pendingData?.total || 0}
            icon={<ClockCircleOutlined />}
            color="#faad14"
            loading={pendingLoading}
            onClick={() => navigateTo("/pending")}
          />
          <StatCard
            title="Marked for TTE"
            value={markedCount?.total || 0}
            icon={<EditOutlined />}
            color="#722ed1"
            loading={countLoading}
            onClick={() => navigateTo("/delegated")}
          />
          <StatCard
            title="Selesai"
            value={completedData?.total || 0}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            loading={completedLoading}
            onClick={() => navigateTo("/documents?status=completed")}
          />
          <StatCard
            title="Ditolak"
            value={rejectedData?.total || 0}
            icon={<CloseCircleOutlined />}
            color="#f5222d"
            loading={rejectedLoading}
            onClick={() => navigateTo("/documents?status=rejected")}
          />
        </Flex>

        {/* Action Cards */}
        <Flex gap="large" wrap="wrap">
          <Card style={{ flex: 1, minWidth: 300 }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
              <Title level={4} style={{ margin: 0 }}>Aksi Cepat</Title>
            </Flex>
            <Flex vertical gap="middle">
              <Button
                block
                size="large"
                onClick={() => navigateTo("/pending")}
                icon={<ClockCircleOutlined />}
                style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "flex-start" }}
              >
                Review Dokumen Pending
              </Button>
              <Button
                block
                size="large"
                onClick={() => navigateTo("/delegated")}
                icon={<EditOutlined />}
                style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "flex-start" }}
              >
                Tanda Tangan Delegasi
              </Button>
              <Button
                block
                size="large"
                onClick={() => navigateTo("/bsre")}
                icon={<CheckCircleOutlined />}
                style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "flex-start" }}
              >
                Monitor BSrE
              </Button>
            </Flex>
          </Card>

          <Card style={{ flex: 1, minWidth: 300 }}>
            <RecentActivity
              data={pendingData}
              loading={pendingLoading}
              title="Aktivitas Terbaru"
              emptyText="Tidak ada aktivitas terbaru"
            />
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default EsignBkdDashboard;
