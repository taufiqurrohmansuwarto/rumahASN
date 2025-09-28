import {
  Table,
  Card,
  Button,
  Space,
  Row,
  Col,
  Badge,
  Progress,
  Tooltip,
  Statistic,
  Modal,
  message,
  Flex,
  Grid,
  Typography,
  Avatar,
} from "antd";
import { Text } from "@mantine/core";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  useBsreTransactions,
  useBsreTransactionStats,
  useRetryBsreTransaction,
} from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title } = Typography;
const { useBreakpoint } = Grid;

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "processing",
      text: "Menunggu",
      icon: <SyncOutlined spin />,
    },
    processing: {
      color: "warning",
      text: "Proses",
      icon: <SyncOutlined spin />,
    },
    completed: {
      color: "success",
      text: "Berhasil",
      icon: <CheckCircleOutlined />,
    },
    failed: { color: "error", text: "Gagal", icon: <CloseCircleOutlined /> },
    timeout: {
      color: "default",
      text: "Timeout",
      icon: <ExclamationCircleOutlined />,
    },
    cancelled: {
      color: "default",
      text: "Dibatalkan",
      icon: <CloseCircleOutlined />,
    },
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
  const { mutateAsync: retryTransaction, isLoading } =
    useRetryBsreTransaction();

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
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
  });
  const [retryModal, setRetryModal] = useState({
    open: false,
    transaction: null,
  });

  const { data, isLoading, refetch, isRefetching } =
    useBsreTransactions(filters);
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useBsreTransactionStats();

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
      title: (
        <Space>
          <CloudServerOutlined />
          <Text strong>Transaksi</Text>
        </Space>
      ),
      key: "transaction",
      render: (_, record) => (
        <Space size="small">
          <Avatar
            size={isMobile ? 32 : 36}
            style={{
              backgroundColor: "#e6f7ff",
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<CloudServerOutlined style={{ color: "#1890ff" }} />}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div>
              <Text style={{ fontWeight: 600, fontSize: isMobile ? 11 : 12 }}>
                {record.document_title || record.id}
              </Text>
            </div>
            <div style={{ marginTop: "0px" }}>
              <Text style={{ fontSize: 10, color: "#999" }}>
                ID: {record.id}
              </Text>
            </div>
            {record.bsre_transaction_id && (
              <div style={{ marginTop: "0px" }}>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  BSrE ID: {record.bsre_transaction_id}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <SafetyOutlined />
          <Text strong>Status</Text>
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: (
        <Space>
          <SyncOutlined />
          <Text strong>Progress</Text>
        </Space>
      ),
      key: "progress",
      width: isMobile ? 100 : 120,
      align: "center",
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
      title: (
        <Space>
          <ClockCircleOutlined />
          <Text strong>Waktu</Text>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: isMobile ? 100 : 140,
      render: (date) => (
        <Tooltip title={dayjs(date).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text style={{ fontSize: 12 }}>
              {dayjs(date).format("DD/MM/YY")}
            </Text>
            <div style={{ marginTop: 0 }}>
              <Text style={{ fontSize: 10, color: "#999" }}>
                {dayjs(date).format("HH:mm")}
              </Text>
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <Text strong>Durasi</Text>,
      key: "duration",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (_, record) => {
        const start = dayjs(record.created_at);
        const end = record.completed_at ? dayjs(record.completed_at) : dayjs();
        const duration = end.diff(start, "minute");

        return (
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            {duration < 1 ? "< 1m" : `${duration}m`}
          </Text>
        );
      },
      responsive: ["md"],
    },
    {
      title: <Text strong>Aksi</Text>,
      key: "actions",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Detail">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/esign-bkd/bsre/${record.id}`)}
              style={{
                color: "#FF4500",
                fontWeight: 500,
                padding: "0 8px",
              }}
            />
          </Tooltip>
          {(record.status === "failed" || record.status === "timeout") && (
            <Tooltip title="Retry">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => openRetryModal(record)}
                style={{
                  color: "#FF4500",
                  fontWeight: 500,
                  padding: "0 8px",
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

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
            <CloudServerOutlined
              style={{ fontSize: "24px", marginBottom: "8px" }}
            />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Transaksi BSrE
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Monitor integrasi dengan Balai Sertifikasi Elektronik
            </Text>
          </div>

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
                  Monitoring transaksi BSrE dan status integrasi
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
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  style={{
                    background: "#FF4500",
                    borderColor: "#FF4500",
                    color: "white",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "0 16px",
                  }}
                  block={isXs}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </div>

          {/* Stats Cards */}
          <div style={{ marginTop: "16px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
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
                        Total Transaksi
                      </Text>
                    }
                    value={stats?.total || 0}
                    loading={statsLoading}
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
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
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
                        Berhasil
                      </Text>
                    }
                    value={stats?.completed || 0}
                    loading={statsLoading}
                    valueStyle={{
                      color: "#52c41a",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
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
                        Proses
                      </Text>
                    }
                    value={stats?.processing || 0}
                    loading={statsLoading}
                    valueStyle={{
                      color: "#faad14",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
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
                        Gagal
                      </Text>
                    }
                    value={stats?.failed || 0}
                    loading={statsLoading}
                    valueStyle={{
                      color: "#f5222d",
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* Filter and Table Section */}
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                padding: "20px 0 16px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} md={18} lg={20}>
                  <Space wrap>
                    <Button
                      onClick={() => setFilters({ ...filters, status: "" })}
                      type={filters.status === "" ? "primary" : "default"}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        ...(filters.status === "" && {
                          background: "#FF4500",
                          borderColor: "#FF4500",
                        }),
                      }}
                    >
                      Semua
                    </Button>
                    <Button
                      onClick={() =>
                        setFilters({ ...filters, status: "processing" })
                      }
                      type={
                        filters.status === "processing" ? "primary" : "default"
                      }
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        ...(filters.status === "processing" && {
                          background: "#FF4500",
                          borderColor: "#FF4500",
                        }),
                      }}
                    >
                      Proses
                    </Button>
                    <Button
                      onClick={() =>
                        setFilters({ ...filters, status: "completed" })
                      }
                      type={
                        filters.status === "completed" ? "primary" : "default"
                      }
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        ...(filters.status === "completed" && {
                          background: "#FF4500",
                          borderColor: "#FF4500",
                        }),
                      }}
                    >
                      Berhasil
                    </Button>
                    <Button
                      onClick={() =>
                        setFilters({ ...filters, status: "failed" })
                      }
                      type={filters.status === "failed" ? "primary" : "default"}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        ...(filters.status === "failed" && {
                          background: "#FF4500",
                          borderColor: "#FF4500",
                        }),
                      }}
                    >
                      Gagal
                    </Button>
                  </Space>
                </Col>
                <Col xs={24} md={6} lg={4}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isXs ? "flex-start" : "flex-end",
                      gap: 8,
                    }}
                  >
                    <Button
                      icon={<ReloadOutlined />}
                      loading={isLoading || isRefetching || statsLoading}
                      onClick={() => {
                        refetch();
                        refetchStats();
                      }}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        padding: "0 16px",
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            <Table
              columns={columns}
              dataSource={data?.data || []}
              loading={isLoading}
              rowKey="id"
              scroll={{ x: 890 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <CloudServerOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text style={{ color: "#6b7280", fontSize: 16 }}>
                        Tidak ada transaksi BSrE
                      </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                        Belum ada transaksi yang tersedia
                      </Text>
                    </div>
                  </div>
                ),
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(filters.limit),
                current: parseInt(filters.page),
                showSizeChanger: false,
                onChange: (page, size) =>
                  setFilters({ ...filters, page, limit: size }),
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} transaksi`,
                style: { margin: "16px 0" },
              }}
            />
          </div>
        </Card>
      </div>

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
