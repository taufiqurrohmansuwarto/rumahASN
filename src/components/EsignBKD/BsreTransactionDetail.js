import {
  Card,
  Button,
  Space,
  Badge,
  Descriptions,
  Typography,
  Flex,
  Spin,
  Alert,
  Timeline,
  message,
  Empty,
} from "antd";
import { Text, Title } from "@mantine/core";
import {
  ArrowLeftOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useBsreTransactionDetail, useRetryBsreTransaction } from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "processing", text: "Menunggu", icon: <SyncOutlined spin /> },
    processing: { color: "warning", text: "Proses", icon: <SyncOutlined spin /> },
    completed: { color: "success", text: "Berhasil", icon: <CheckCircleOutlined /> },
    failed: { color: "error", text: "Gagal", icon: <CloseCircleOutlined /> },
    timeout: { color: "default", text: "Timeout", icon: <ExclamationCircleOutlined /> },
    cancelled: { color: "default", text: "Dibatalkan", icon: <CloseCircleOutlined /> },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      status={config.color}
      text={
        <Space size="small">
          {config.icon}
          {config.text}
        </Space>
      }
    />
  );
};

function BsreTransactionDetail() {
  const router = useRouter();
  const { transactionId } = router.query;

  const { data: transaction, isLoading, refetch } = useBsreTransactionDetail(transactionId);
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
    <div>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex align="center" gap="large" style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/esign-bkd/bsre")}
            style={{
              borderRadius: 8,
              height: 40,
              paddingInline: 16,
            }}
          >
            Kembali
          </Button>

          <Flex vertical style={{ flex: 1 }}>
            <Title order={2} style={{ margin: 0, color: "#1d1d1f" }}>
              Detail Transaksi BSrE
            </Title>
            <Text c="dimmed" size="lg">
              {transaction.document_title || `Transaksi ${transaction.id}`}
            </Text>
          </Flex>

          <Space>
            <Button
              icon={<SyncOutlined />}
              onClick={() => refetch()}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
            {canRetry && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
                loading={retryLoading}
                style={{
                  borderRadius: 8,
                  backgroundColor: "#faad14",
                  borderColor: "#faad14",
                }}
              >
                Retry
              </Button>
            )}
          </Space>
        </Flex>

        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "2fr 1fr" }}>
          <Flex vertical gap="large">
            <Card
              title={
                <Space>
                  <CloudServerOutlined />
                  Informasi Transaksi
                </Space>
              }
              style={{
                borderRadius: 12,
                border: "1px solid #e8e8ea",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="ID Transaksi">
                  <Text fw={500}>{transaction.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="BSrE Transaction ID">
                  <Text fw={500}>
                    {transaction.bsre_transaction_id || "-"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Dokumen">
                  <Text fw={500}>{transaction.document_title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusBadge status={transaction.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Dibuat">
                  <Text fw={500}>
                    {dayjs(transaction.created_at).format("DD MMMM YYYY, HH:mm")}
                  </Text>
                </Descriptions.Item>
                {transaction.completed_at && (
                  <Descriptions.Item label="Selesai">
                    <Text fw={500}>
                      {dayjs(transaction.completed_at).format("DD MMMM YYYY, HH:mm")}
                    </Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Durasi">
                  <Text fw={500}>
                    {(() => {
                      const start = dayjs(transaction.created_at);
                      const end = transaction.completed_at ? dayjs(transaction.completed_at) : dayjs();
                      const duration = end.diff(start, "minute");
                      return duration < 1 ? "< 1 menit" : `${duration} menit`;
                    })()}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {transaction.error_message && (
                <Alert
                  message="Error Details"
                  description={transaction.error_message}
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {transaction.response_data && (
                <Card
                  size="small"
                  title="Response Data"
                  style={{ marginTop: 16 }}
                >
                  <pre style={{ fontSize: 12, maxHeight: 200, overflow: "auto" }}>
                    {JSON.stringify(transaction.response_data, null, 2)}
                  </pre>
                </Card>
              )}
            </Card>
          </Flex>

          <Flex vertical gap="large">
            <Card
              title="Timeline"
              style={{
                borderRadius: 12,
                border: "1px solid #e8e8ea",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
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
            </Card>
          </Flex>
        </div>
      </div>
    </div>
  );
}

export default BsreTransactionDetail;