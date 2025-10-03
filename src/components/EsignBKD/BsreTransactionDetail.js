import {
  Button,
  Space,
  Spin,
  Timeline,
  message,
  Empty,
} from "antd";
import { Text, Title, Stack, Group, Paper, Badge, Divider, Alert } from "@mantine/core";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useBsreTransaction, useRetryBsreTransaction } from "@/hooks/esign-bkd";
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
    <Badge color={config.color} variant="filled" size="lg">
      {config.text}
    </Badge>
  );
};

function BsreTransactionDetail() {
  const router = useRouter();
  const { transactionId } = router.query;

  const { data: response, isLoading, refetch } = useBsreTransaction(transactionId);
  const transaction = response?.data;
  const { mutateAsync: retryTransaction, isLoading: retryLoading } = useRetryBsreTransaction();

  const handleRetry = async () => {
    try {
      await retryTransaction({ id: transactionId, data: {} });
      message.success("Transaksi berhasil di-retry");
      refetch();
    } catch (error) {
      message.error(error?.response?.data?.message || "Retry gagal");
    }
  };

  const canRetry = transaction?.status === "failed" || transaction?.status === "timeout";

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
          padding: "24px",
        }}
      >
        <Stack gap={6} align="center">
          <SafetyCertificateOutlined
            style={{ fontSize: 40, color: "white" }}
          />
          <Title
            order={4}
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
            size="sm"
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
          padding: "12px 16px",
          background: "#fafafa",
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <Group justify="space-between">
          <StatusBadge status={transaction.status} />
          <Space>
            <Button
              icon={<SyncOutlined />}
              onClick={() => refetch()}
              size="small"
              style={{ borderRadius: 6 }}
            >
              Refresh
            </Button>
            {canRetry && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
                loading={retryLoading}
                size="small"
                style={{
                  borderRadius: 6,
                  backgroundColor: "#faad14",
                  borderColor: "#faad14",
                }}
              >
                Retry
              </Button>
            )}
          </Space>
        </Group>
      </div>

      {/* Main Content */}
      <Stack gap="md" p="lg">
        {/* Transaction Info */}
        <Paper p="md" withBorder radius="md">
          <Stack gap="xs">
            <Group gap="xs" mb="xs">
              <CloudServerOutlined style={{ fontSize: 18, color: "#FF4500" }} />
              <Text fw={600} size="md">
                Informasi Transaksi
              </Text>
            </Group>

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">ID Transaksi</Text>
              <Text size="sm" fw={500}>{transaction.id}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">BSrE Transaction ID</Text>
              <Text size="sm" fw={500}>{transaction.bsre_transaction_id || "-"}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">Dokumen</Text>
              <Text size="sm" fw={500} style={{ textAlign: "right" }}>{transaction.document?.title || transaction.document_title || "-"}</Text>
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">Status</Text>
              <StatusBadge status={transaction.status} />
            </Group>
            <Divider size="xs" />

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">Dibuat</Text>
              <Text size="sm" fw={500}>
                {dayjs(transaction.created_at).format("DD MMMM YYYY, HH:mm")}
              </Text>
            </Group>

            {transaction.completed_at && (
              <>
                <Divider size="xs" />
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" c="dimmed">Selesai</Text>
                  <Text size="sm" fw={500}>
                    {dayjs(transaction.completed_at).format("DD MMMM YYYY, HH:mm")}
                  </Text>
                </Group>
              </>
            )}

            <Divider size="xs" />
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">Durasi</Text>
              <Text size="sm" fw={500}>
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
              root: { padding: "12px 16px" },
              title: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
              message: { fontSize: 13 },
            }}
          >
            {transaction.error_message}
          </Alert>
        )}

        {/* Response Data */}
        {transaction.response_data && (
          <Paper p="md" withBorder radius="md" style={{ background: "#fafafa" }}>
            <Text fw={600} size="sm" mb="xs">
              Response Data
            </Text>
            <pre style={{ fontSize: 12, maxHeight: 200, overflow: "auto", margin: 0 }}>
              {JSON.stringify(transaction.response_data, null, 2)}
            </pre>
          </Paper>
        )}

        {/* Timeline */}
        <Paper p="md" withBorder radius="md">
          <Text fw={600} size="md" mb="md">
            Timeline
          </Text>
          <Timeline
            mode="left"
            items={[
              {
                dot: <SyncOutlined style={{ color: "#1890ff" }} />,
                children: (
                  <div>
                    <Text fw={600} size="sm">Transaksi Dibuat</Text>
                    <br />
                    <Text size="xs" c="dimmed">
                      {dayjs(transaction.created_at).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  </div>
                ),
              },
              ...(transaction.status === "processing" ? [{
                dot: <SyncOutlined spin style={{ color: "#faad14" }} />,
                children: (
                  <div>
                    <Text fw={600} size="sm">Dalam Proses</Text>
                    <br />
                    <Text size="xs" c="dimmed">
                      Menunggu response dari BSrE
                    </Text>
                  </div>
                ),
              }] : []),
              ...(transaction.completed_at ? [{
                dot: transaction.status === "completed"
                  ? <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  : <CloseCircleOutlined style={{ color: "#f5222d" }} />,
                children: (
                  <div>
                    <Text fw={600} size="sm">
                      {transaction.status === "completed" ? "Berhasil" : "Gagal"}
                    </Text>
                    <br />
                    <Text size="xs" c="dimmed">
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