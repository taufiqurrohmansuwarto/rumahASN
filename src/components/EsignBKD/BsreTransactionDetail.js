import {
  Button,
  Spin,
  Timeline,
  Empty,
} from "antd";
import { Text, Title, Stack, Group, Paper, Badge, Divider, Alert } from "@mantine/core";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useBsreTransaction } from "@/hooks/esign-bkd";
import ReactJson from "@/components/ReactJson";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "blue", text: "Menunggu" },
    processing: { color: "yellow", text: "Proses" },
    completed: { color: "green", text: "Berhasil" },
    failed: { color: "red", text: "Gagal" },
    timeout: { color: "gray", text: "Timeout" },
    cancelled: { color: "gray", text: "Dibatalkan" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge color={config.color} variant="filled" size="sm">
      {config.text}
    </Badge>
  );
};

function BsreTransactionDetail() {
  const router = useRouter();
  const { transactionId } = router.query;

  const { data: response, isLoading, refetch } = useBsreTransaction(transactionId);
  const transaction = response?.data;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <Empty
        description="Transaksi tidak ditemukan"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: "48px 0" }}
      />
    );
  }

  return (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{ overflow: "hidden" }}
    >
      {/* Orange Header */}
      <div
        style={{
          background: "#FF4500",
          padding: "12px 16px",
        }}
      >
        <Stack gap={4} align="center">
          <SafetyCertificateOutlined
            style={{ fontSize: 24, color: "white" }}
          />
          <Title
            order={6}
            style={{
              margin: 0,
              color: "white",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Detail Transaksi BSrE
          </Title>
          <Text
            size="xs"
            style={{
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
            }}
          >
            {transaction.document?.title || transaction.document_title || `Transaksi ${transaction.id}`}
          </Text>
        </Stack>
      </div>

      {/* Action Section */}
      <div
        style={{
          padding: "8px 12px",
          background: "#fafafa",
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <Group justify="space-between">
          <StatusBadge status={transaction.status} />
          <Button
            icon={<SyncOutlined />}
            onClick={() => refetch()}
            size="small"
            style={{ borderRadius: 6 }}
          >
            Refresh
          </Button>
        </Group>
      </div>

      {/* Main Content */}
      <Stack gap="sm" p="md">
        {/* Transaction Info */}
        <Paper p="sm" withBorder radius="md">
          <Stack gap="xs">
            <Group gap="xs" mb={4}>
              <CloudServerOutlined style={{ fontSize: 14, color: "#FF4500" }} />
              <Text fw={600} size="sm">
                Informasi Transaksi
              </Text>
            </Group>

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">ID Transaksi</Text>
              <Text size="xs" fw={500}>{transaction.id}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">BSrE Transaction ID</Text>
              <Text size="xs" fw={500}>{transaction.bsre_transaction_id || "-"}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">Dokumen</Text>
              <Text size="xs" fw={500} style={{ textAlign: "right" }}>{transaction.document?.title || transaction.document_title || "-"}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">Status</Text>
              <StatusBadge status={transaction.status} />
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">Dibuat</Text>
              <Text size="xs" fw={500}>
                {dayjs(transaction.created_at).format("DD MMM YYYY, HH:mm")}
              </Text>
            </Group>

            {transaction.completed_at && (
              <>
                <Divider size="xs" />
                <Group justify="space-between" wrap="nowrap">
                  <Text size="xs" c="dimmed">Selesai</Text>
                  <Text size="xs" fw={500}>
                    {dayjs(transaction.completed_at).format("DD MMM YYYY, HH:mm")}
                  </Text>
                </Group>
              </>
            )}

            <Divider size="xs" />
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">Durasi</Text>
              <Text size="xs" fw={500}>
                {(() => {
                  const start = dayjs(transaction.created_at);
                  const end = transaction.completed_at ? dayjs(transaction.completed_at) : dayjs();
                  const duration = end.diff(start, "minute");
                  return duration < 1 ? "< 1 menit" : `${duration} menit`;
                })()}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* Error Message */}
        {transaction.error_message && (
          <Alert
            variant="light"
            color="red"
            title="Error Details"
            icon={<CloseCircleOutlined />}
            styles={{
              root: { padding: "8px 12px" },
              title: { fontSize: 12, fontWeight: 600, marginBottom: 2 },
              message: { fontSize: 11 },
            }}
          >
            {transaction.error_message}
          </Alert>
        )}

        {/* Request Data */}
        {transaction.request_data && (
          <Paper p="sm" withBorder radius="md" style={{ background: "#fafafa" }}>
            <Text fw={600} size="xs" mb={4}>
              Request Data
            </Text>
            <ReactJson
              src={transaction.request_data}
              name={false}
              collapsed={1}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              style={{ fontSize: 11 }}
            />
          </Paper>
        )}

        {/* Response Data */}
        {transaction.response_data && (
          <Paper p="sm" withBorder radius="md" style={{ background: "#fafafa" }}>
            <Text fw={600} size="xs" mb={4}>
              Response Data
            </Text>
            <ReactJson
              src={transaction.response_data}
              name={false}
              collapsed={1}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              style={{ fontSize: 11 }}
            />
          </Paper>
        )}

        {/* Timeline */}
        <Paper p="sm" withBorder radius="md">
          <Text fw={600} size="sm" mb="sm">
            Timeline
          </Text>
          <Timeline
            mode="left"
            items={[
              {
                dot: <SyncOutlined style={{ color: "#1890ff", fontSize: 12 }} />,
                children: (
                  <div>
                    <Text fw={600} size="xs">Transaksi Dibuat</Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {dayjs(transaction.created_at).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  </div>
                ),
              },
              ...(transaction.status === "processing" ? [{
                dot: <SyncOutlined spin style={{ color: "#faad14", fontSize: 12 }} />,
                children: (
                  <div>
                    <Text fw={600} size="xs">Dalam Proses</Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      Menunggu response dari BSrE
                    </Text>
                  </div>
                ),
              }] : []),
              ...(transaction.completed_at ? [{
                dot: transaction.status === "completed"
                  ? <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                  : <CloseCircleOutlined style={{ color: "#f5222d", fontSize: 12 }} />,
                children: (
                  <div>
                    <Text fw={600} size="xs">
                      {transaction.status === "completed" ? "Berhasil" : "Gagal"}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {dayjs(transaction.completed_at).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  </div>
                ),
              }] : []),
            ]}
          />
        </Paper>
      </Stack>
    </Paper>
  );
}

export default BsreTransactionDetail;