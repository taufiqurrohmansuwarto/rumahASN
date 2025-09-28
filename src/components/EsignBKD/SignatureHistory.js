import {
  Timeline,
  Badge,
  Flex,
  Empty,
  Spin,
} from "antd";
import { Text } from "@mantine/core";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useSignatureRequestHistory } from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");


const getStatusIcon = (status) => {
  switch (status) {
    case "signed":
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    case "rejected":
      return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
    case "pending":
      return <ClockCircleOutlined style={{ color: "#faad14" }} />;
    default:
      return <FileTextOutlined style={{ color: "#1890ff" }} />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "signed":
      return "green";
    case "rejected":
      return "red";
    case "pending":
      return "orange";
    default:
      return "blue";
  }
};

function SignatureHistory() {
  const router = useRouter();
  const { id } = router.query;

  const { data: historyData, isLoading } = useSignatureRequestHistory(id);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!historyData?.length) {
    return (
      <Empty
        description="Belum ada riwayat tanda tangan"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: "48px 0" }}
      />
    );
  }

  const timelineItems = historyData.map((item, index) => ({
    dot: getStatusIcon(item.status),
    children: (
      <div style={{ paddingBottom: 16 }}>
        <Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
          <Flex vertical>
            <Text fw={600} size="sm" style={{ color: "#1d1d1f" }}>
              {item.action_type || "Tindakan"}
            </Text>
            <Text size="xs" c="dimmed">
              oleh {item.user?.name || "System"}
            </Text>
          </Flex>
          <Flex vertical align="end">
            <Badge
              color={getStatusColor(item.status)}
              text={item.status_text || item.status}
              style={{ marginBottom: 4 }}
            />
            <Text size="xs" c="dimmed">
              {dayjs(item.created_at).format("DD MMM YYYY, HH:mm")}
            </Text>
          </Flex>
        </Flex>

        {item.notes && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              marginTop: 8,
            }}
          >
            <Text size="sm" style={{ lineHeight: 1.5 }}>
              {item.notes}
            </Text>
          </div>
        )}
      </div>
    ),
  }));

  return (
    <Timeline
      items={timelineItems}
      mode="left"
      style={{ marginTop: 16 }}
    />
  );
}

export default SignatureHistory;