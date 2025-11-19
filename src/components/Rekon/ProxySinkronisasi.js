import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Row,
  Col,
  Button,
  Progress,
  Space,
  Alert,
  Statistic,
  Tag,
  Modal,
  message,
  Tabs,
  Table,
  Tooltip,
  Grid,
} from "antd";
import { Text } from "@mantine/core";
import {
  IconRefresh,
  IconCircleCheck,
  IconCircleX,
  IconLoader,
  IconBolt,
  IconTrash,
  IconBug,
  IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";
import {
  syncProxyPangkat,
  syncProxyPensiun,
  syncProxyPgAkademik,
  syncProxyPgProfesi,
  syncProxySkk,
  getProxySyncStatus,
  debugProxyQueue,
  cleanupProxyQueue,
} from "@/services/siasn-proxy.services";

const { useBreakpoint } = Grid;

// Konfigurasi proxy types
const PROXY_TYPES = [
  {
    key: "pangkat",
    title: "Kenaikan Pangkat",
    description: "Data kenaikan pangkat ASN",
    color: "#1890FF",
    syncFn: syncProxyPangkat,
  },
  {
    key: "pensiun",
    title: "Pensiun",
    description: "Data pemberhentian/pensiun",
    color: "#52C41A",
    syncFn: syncProxyPensiun,
  },
  {
    key: "pg_akademik",
    title: "PG Akademik",
    description: "Pencantuman gelar akademik",
    color: "#722ED1",
    syncFn: syncProxyPgAkademik,
  },
  {
    key: "pg_profesi",
    title: "PG Profesi",
    description: "Pencantuman gelar profesi",
    color: "#FA8C16",
    syncFn: syncProxyPgProfesi,
  },
  {
    key: "skk",
    title: "SKK",
    description: "Status kedudukan kepegawaian",
    color: "#13C2C2",
    syncFn: syncProxySkk,
  },
];

// Status badge component
const StatusBadge = ({ state, progress }) => {
  const badges = {
    active: {
      color: "processing",
      icon: <IconLoader size={14} style={{ verticalAlign: "middle" }} />,
      text: "Berjalan",
    },
    waiting: {
      color: "warning",
      icon: <IconClock size={14} style={{ verticalAlign: "middle" }} />,
      text: "Antri",
    },
    completed: {
      color: "success",
      icon: <IconCircleCheck size={14} style={{ verticalAlign: "middle" }} />,
      text: "Selesai",
    },
    failed: {
      color: "error",
      icon: <IconCircleX size={14} style={{ verticalAlign: "middle" }} />,
      text: "Gagal",
    },
    paused: {
      color: "default",
      icon: <IconInfoCircle size={14} style={{ verticalAlign: "middle" }} />,
      text: "Pause",
    },
  };

  const badge = badges[state] || { color: "default", text: state };

  return (
    <Tag color={badge.color} icon={badge.icon}>
      {badge.text} {progress > 0 && `(${progress}%)`}
    </Tag>
  );
};

// Single proxy sync card
const ProxySyncCard = ({ config }) => {
  const [jobId, setJobId] = useState(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (force) => config.syncFn(force),
    onSuccess: (data) => {
      setJobId(data.jobId);
      message.success(`Sync ${config.title} dimulai!`);
    },
    onError: (error) => {
      message.error(`Gagal sync: ${error.message}`);
    },
  });

  // Status query with auto-refresh
  const statusQuery = useQuery({
    queryKey: ["proxy-status", jobId],
    queryFn: () => getProxySyncStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling if completed/failed
      if (data?.state === "completed" || data?.state === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    retry: false,
  });

  const handleSync = (force = false) => {
    Modal.confirm({
      title: force ? "Force Sync?" : "Mulai Sync?",
      content: force
        ? `Semua job ${config.title} sebelumnya akan dihapus. Lanjutkan?`
        : `Mulai sinkronisasi ${config.title}?`,
      okText: "Ya",
      cancelText: "Batal",
      onOk: () => syncMutation.mutate(force),
    });
  };

  const status = statusQuery.data;
  const isRunning = status?.state === "active" || status?.state === "waiting";

  return (
    <Card
      size="small"
      style={{
        borderLeft: `4px solid ${config.color}`,
        fontSize: isMobile ? "12px" : "13px",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Text fw={600} size={isMobile ? "13px" : "14px"}>
              {config.title}
            </Text>
            <br />
            <Text c="dimmed" size={isMobile ? "11px" : "12px"}>
              {config.description}
            </Text>
          </div>
          <Space>
            <Tooltip title="Sync Normal">
              <Button
                type="primary"
                size="small"
                icon={<IconRefresh size={16} />}
                onClick={() => handleSync(false)}
                loading={syncMutation.isPending}
                disabled={isRunning}
              >
                {!isMobile && "Sync"}
              </Button>
            </Tooltip>
            <Tooltip title="Force Sync (Hapus job lama)">
              <Button
                type="primary"
                danger
                size="small"
                icon={<IconBolt size={16} />}
                onClick={() => handleSync(true)}
                loading={syncMutation.isPending}
              >
                {!isMobile && "Force"}
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* Status & Progress */}
        {status && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <StatusBadge state={status.state} progress={status.progress} />
              <Text c="dimmed" size="11px">
                Job: {status.jobId?.split("-").pop()}
              </Text>
            </div>

            <Progress
              percent={status.progress || 0}
              size="small"
              status={status.state === "failed" ? "exception" : "active"}
              strokeColor={config.color}
            />

            {/* Progress Info */}
            {status.progressInfo?.message && (
              <Alert
                message={status.progressInfo.message}
                type="info"
                showIcon
                style={{ fontSize: "11px", padding: "4px 8px" }}
              />
            )}

            {/* Result */}
            {status.result && status.state === "completed" && (
              <Space size="small" wrap>
                <Statistic
                  title="Total"
                  value={status.result.total}
                  valueStyle={{ fontSize: "16px", color: config.color }}
                  suffix="data"
                />
                <Statistic
                  title="Inserted"
                  value={status.result.inserted}
                  valueStyle={{ fontSize: "16px", color: "#52C41A" }}
                />
                {status.result.duplicates_removed > 0 && (
                  <Statistic
                    title="Duplikat"
                    value={status.result.duplicates_removed}
                    valueStyle={{ fontSize: "16px", color: "#FF4D4F" }}
                  />
                )}
              </Space>
            )}

            {/* Error */}
            {status.state === "failed" && status.error && (
              <Alert
                message="Error"
                description={status.error}
                type="error"
                showIcon
                style={{ fontSize: "11px" }}
              />
            )}
          </>
        )}
      </Space>
    </Card>
  );
};

// Debug & Management Panel
const ManagementPanel = () => {
  const queryClient = useQueryClient();

  // Debug query
  const debugQuery = useQuery({
    queryKey: ["proxy-debug"],
    queryFn: debugProxyQueue,
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: cleanupProxyQueue,
    onSuccess: (data) => {
      message.success(`Berhasil cleanup ${data.removed || 0} job`);
      queryClient.invalidateQueries(["proxy-debug"]);
    },
    onError: (error) => {
      message.error(`Gagal cleanup: ${error.message}`);
    },
  });

  const handleCleanup = (states, type = null) => {
    Modal.confirm({
      title: "Konfirmasi Cleanup",
      content: `Hapus semua job dengan status: ${states.join(", ")}${
        type ? ` untuk ${type}` : ""
      }?`,
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => cleanupMutation.mutate({ states, type }),
    });
  };

  const columns = [
    {
      title: "Job ID",
      dataIndex: "id",
      key: "id",
      width: 180,
      render: (id) => (
        <Text ff="monospace" size="11px">
          {id?.split("-").slice(-2).join("-")}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => {
        const config = PROXY_TYPES.find((t) => t.key === type);
        return <Tag color={config?.color}>{config?.title || type}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      width: 120,
      render: (state, record) => (
        <StatusBadge state={state} progress={record.progress} />
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 120,
      render: (progress) => <Progress percent={progress || 0} size="small" />,
    },
    {
      title: "User",
      dataIndex: "requestedBy",
      key: "requestedBy",
      ellipsis: true,
      render: (user) => (
        <Tooltip title={user}>
          <Text size="11px">{user}</Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card size="small">
      <Tabs
        size="small"
        items={[
          {
            key: "status",
            label: (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IconInfoCircle size={14} /> Status
              </span>
            ),
            children: (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                {/* Summary */}
                {debugQuery.data?.summary && (
                  <Row gutter={12}>
                    <Col span={6}>
                      <Statistic
                        title="Total"
                        value={debugQuery.data.summary.total || 0}
                        prefix={<IconBug size={18} />}
                        valueStyle={{ fontSize: "20px" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Active"
                        value={debugQuery.data.summary.byStatus?.active || 0}
                        valueStyle={{ color: "#1890FF", fontSize: "20px" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Selesai"
                        value={debugQuery.data.summary.byStatus?.completed || 0}
                        valueStyle={{ color: "#52C41A", fontSize: "20px" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Gagal"
                        value={debugQuery.data.summary.byStatus?.failed || 0}
                        valueStyle={{ color: "#FF4D4F", fontSize: "20px" }}
                      />
                    </Col>
                  </Row>
                )}

                {/* Jobs Table */}
                <Table
                  dataSource={debugQuery.data?.jobs || []}
                  columns={columns}
                  loading={debugQuery.isLoading}
                  size="small"
                  rowKey="id"
                  pagination={{ pageSize: 8, size: "small" }}
                  locale={{
                    emptyText: (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <IconBug
                          size={40}
                          color="#d9d9d9"
                          style={{ marginBottom: 8 }}
                        />
                        <br />
                        <Text c="dimmed" size="12px">
                          Belum ada job sync
                        </Text>
                      </div>
                    ),
                  }}
                />
              </Space>
            ),
          },
          {
            key: "cleanup",
            label: (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IconTrash size={14} /> Cleanup
              </span>
            ),
            children: (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Space wrap size="small">
                  <Button
                    size="small"
                    icon={<IconTrash size={16} />}
                    onClick={() => handleCleanup(["completed"])}
                    loading={cleanupMutation.isPending}
                  >
                    Hapus Selesai
                  </Button>
                  <Button
                    size="small"
                    icon={<IconTrash size={16} />}
                    onClick={() => handleCleanup(["failed"])}
                    loading={cleanupMutation.isPending}
                  >
                    Hapus Gagal
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<IconTrash size={16} />}
                    onClick={() =>
                      handleCleanup([
                        "active",
                        "waiting",
                        "completed",
                        "failed",
                        "paused",
                      ])
                    }
                    loading={cleanupMutation.isPending}
                  >
                    Hapus Semua
                  </Button>
                </Space>

                <Text c="dimmed" size="11px">
                  <Text component="span" fw={600}>
                    Tips:
                  </Text>{" "}
                  Cleanup jobs secara berkala untuk performa optimal.
                </Text>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
};

// Main component
const ProxySinkronisasi = () => {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="small">
      {/* Sync Cards */}
      <Row gutter={[12, 12]}>
        {PROXY_TYPES.map((config) => (
          <Col key={config.key} xs={24} sm={24} md={12} lg={8} xl={8}>
            <ProxySyncCard config={config} />
          </Col>
        ))}
      </Row>

      {/* Management Panel */}
      <ManagementPanel />
    </Space>
  );
};

export default ProxySinkronisasi;
