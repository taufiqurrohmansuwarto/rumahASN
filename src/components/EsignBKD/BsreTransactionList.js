import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Badge,
  Progress,
  Tooltip,
  Statistic,
  Modal,
  message,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  useBsreTransactions,
  useBsreTransactionStats,
  useRetryBsreTransaction,
  useBsreStatus,
} from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title, Text } = Typography;

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

const RetryModal = ({ open, onCancel, transaction, onSuccess }) => {
  const { mutateAsync: retryTransaction, isLoading } = useRetryBsreTransaction();

  const handleRetry = async () => {
    try {
      await retryTransaction({ id: transaction.id, data: {} });
      message.success("Transaksi berhasil di-retry");
      onSuccess?.();
    } catch (error) {
      message.error(error?.response?.data?.message || "Retry gagal");
    }
  };

  return (
    <Modal
      title="Retry Transaksi BSrE"
      open={open}
      onCancel={onCancel}
      onOk={handleRetry}
      confirmLoading={isLoading}
      width={500}
    >
      <div className="mb-4">
        <Text strong>Transaksi ID: </Text>
        <Text code>{transaction?.id}</Text>
      </div>
      <div className="mb-4">
        <Text strong>Dokumen: </Text>
        <Text>{transaction?.document_title}</Text>
      </div>
      <div className="mb-4">
        <Text strong>Error: </Text>
        <Text type="danger">{transaction?.error_message}</Text>
      </div>
      <Text>Apakah Anda yakin ingin mencoba ulang transaksi ini?</Text>
    </Modal>
  );
};

function BsreTransactionList() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
  });
  const [retryModal, setRetryModal] = useState({
    open: false,
    transaction: null,
  });

  const { data, isLoading, refetch } = useBsreTransactions(filters);
  const { data: stats, isLoading: statsLoading } = useBsreTransactionStats();

  const openRetryModal = (transaction) => {
    setRetryModal({ open: true, transaction });
  };

  const closeRetryModal = () => {
    setRetryModal({ open: false, transaction: null });
  };

  const handleRetrySuccess = () => {
    closeRetryModal();
    refetch();
  };

  const columns = [
    {
      title: "Transaksi",
      key: "transaction",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.document_title || record.id}
          </div>
          <Text code style={{ fontSize: 11 }}>
            ID: {record.id}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.bsre_transaction_id && (
              <>BSrE ID: {record.bsre_transaction_id}</>
            )}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      render: (_, record) => {
        let percent = 0;
        if (record.status === "completed") percent = 100;
        else if (record.status === "processing") percent = 50;
        else if (record.status === "pending") percent = 25;

        return (
          <Progress
            percent={percent}
            size="small"
            status={record.status === "failed" ? "exception" : "active"}
          />
        );
      },
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
      render: (date) => (
        <div>
          <div>{dayjs(date).format("DD MMM YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Durasi",
      key: "duration",
      width: 100,
      render: (_, record) => {
        const start = dayjs(record.created_at);
        const end = record.completed_at ? dayjs(record.completed_at) : dayjs();
        const duration = end.diff(start, "minute");

        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {duration < 1 ? "< 1m" : `${duration}m`}
          </Text>
        );
      },
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/esign-bkd/bsre/${record.id}`)
              }
            />
          </Tooltip>
          {(record.status === "failed" || record.status === "timeout") && (
            <Tooltip title="Retry">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => openRetryModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Title level={3}>
          <Space>
            <CloudServerOutlined />
            Transaksi BSrE
          </Space>
        </Title>
        <Text type="secondary">
          Monitor integrasi dengan Balai Sertifikasi Elektronik
        </Text>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Transaksi"
              value={stats?.total || 0}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Berhasil"
              value={stats?.completed || 0}
              valueStyle={{ color: "#52c41a" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Proses"
              value={stats?.processing || 0}
              valueStyle={{ color: "#faad14" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Gagal"
              value={stats?.failed || 0}
              valueStyle={{ color: "#f5222d" }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="mb-4">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  onClick={() => setFilters({ ...filters, status: "" })}
                  type={filters.status === "" ? "primary" : "default"}
                  size="small"
                >
                  Semua
                </Button>
                <Button
                  onClick={() => setFilters({ ...filters, status: "processing" })}
                  type={filters.status === "processing" ? "primary" : "default"}
                  size="small"
                >
                  Proses
                </Button>
                <Button
                  onClick={() => setFilters({ ...filters, status: "completed" })}
                  type={filters.status === "completed" ? "primary" : "default"}
                  size="small"
                >
                  Berhasil
                </Button>
                <Button
                  onClick={() => setFilters({ ...filters, status: "failed" })}
                  type={filters.status === "failed" ? "primary" : "default"}
                  size="small"
                >
                  Gagal
                </Button>
              </Space>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Refresh
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 700 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} transaksi`,
            onChange: (page, size) =>
              setFilters({ ...filters, page, limit: size }),
          }}
        />
      </Card>

      <RetryModal
        open={retryModal.open}
        onCancel={closeRetryModal}
        transaction={retryModal.transaction}
        onSuccess={handleRetrySuccess}
      />
    </div>
  );
}

export default BsreTransactionList;