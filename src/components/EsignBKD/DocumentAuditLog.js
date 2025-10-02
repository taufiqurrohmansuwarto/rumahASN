import {
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Badge, Card, Text } from "@mantine/core";
import { Avatar, Empty, Table, Timeline, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo } from "react";
import { useDocumentLogs } from "@/hooks/esign-bkd";

dayjs.locale("id");
dayjs.extend(relativeTime);

const getActionIcon = (action) => {
  const iconMap = {
    view: <EyeOutlined style={{ color: "#1890ff" }} />,
    download: <DownloadOutlined style={{ color: "#52c41a" }} />,
    upload: <FileTextOutlined style={{ color: "#722ed1" }} />,
    sign: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    reject: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
    review: <SafetyOutlined style={{ color: "#faad14" }} />,
    mark_for_tte: <SafetyOutlined style={{ color: "#13c2c2" }} />,
  };
  return iconMap[action] || <FileTextOutlined />;
};

const getActionText = (action) => {
  const textMap = {
    view: "Melihat",
    download: "Mengunduh",
    upload: "Mengunggah",
    sign: "Menandatangani",
    reject: "Menolak",
    review: "Mereview",
    mark_for_tte: "Menandai untuk TTE",
  };
  return textMap[action] || action;
};

const getActionColor = (action) => {
  const colorMap = {
    view: "blue",
    download: "green",
    upload: "purple",
    sign: "green",
    reject: "red",
    review: "orange",
    mark_for_tte: "cyan",
  };
  return colorMap[action] || "gray";
};

function DocumentAuditLog({ documentId, viewMode = "table" }) {
  const { data, isLoading, refetch, isRefetching } = useDocumentLogs(
    documentId,
    { page: 1, limit: 50 }
  );

  const logs = useMemo(() => data?.data || [], [data?.data]);

  // Timeline view
  const renderTimeline = () => (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ fontSize: 16, color: "#1890ff" }} />
            <Text fw={600} size="sm">
              Riwayat Aktivitas Dokumen
            </Text>
          </div>
          <Tooltip title="Refresh">
            <ReloadOutlined
              spin={isRefetching}
              onClick={() => refetch()}
              style={{ cursor: "pointer", fontSize: 14 }}
            />
          </Tooltip>
        </div>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text c="dimmed">Memuat riwayat...</Text>
          </div>
        ) : logs.length === 0 ? (
          <Empty
            description="Belum ada aktivitas"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Timeline mode="left">
            {logs.map((log) => (
              <Timeline.Item
                key={log.id}
                dot={getActionIcon(log.action)}
                color={getActionColor(log.action)}
              >
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Avatar
                      src={log.user?.image}
                      size={24}
                      style={{ border: "2px solid #f0f0f0" }}
                    >
                      {!log.user?.image && <UserOutlined />}
                    </Avatar>
                    <Text fw={600} size="sm">
                      {log.user?.username || "Unknown"}
                    </Text>
                    <Badge color={getActionColor(log.action)} size="sm" variant="light">
                      {getActionText(log.action)}
                    </Badge>
                  </div>
                  <div style={{ marginLeft: 32 }}>
                    <Text size="xs" c="dimmed">
                      {dayjs(log.created_at).format("DD MMMM YYYY, HH:mm")}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(log.created_at).fromNow()}
                    </Text>
                    {log.ip_address && (
                      <Text size="xs" c="dimmed">
                        IP: {log.ip_address}
                      </Text>
                    )}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card.Section>
    </Card>
  );

  // Table view
  const columns = [
    {
      title: "Waktu",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date) => (
        <div style={{ lineHeight: 1.2 }}>
          <Text size="xs" fw={500}>
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text size="xs" c="dimmed">
              {dayjs(date).format("HH:mm")}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Pengguna",
      key: "user",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            src={record.user?.image}
            size={28}
            style={{ border: "2px solid #f0f0f0" }}
          >
            {!record.user?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: 1.1 }}>
            <Text size="xs" fw={600}>
              {record.user?.username || "Unknown"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Aktivitas",
      dataIndex: "action",
      key: "action",
      width: 150,
      render: (action) => (
        <Badge color={getActionColor(action)} size="sm" variant="light">
          {getActionText(action)}
        </Badge>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 150,
      render: (ip) => (
        <Text size="xs" c="dimmed">
          {ip || "-"}
        </Text>
      ),
    },
  ];

  const renderTable = () => (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ fontSize: 16, color: "#1890ff" }} />
            <Text fw={600} size="sm">
              Riwayat Aktivitas Dokumen
            </Text>
          </div>
          <Tooltip title="Refresh">
            <ReloadOutlined
              spin={isRefetching}
              onClick={() => refetch()}
              style={{ cursor: "pointer", fontSize: 14 }}
            />
          </Tooltip>
        </div>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Table
          columns={columns}
          dataSource={logs}
          loading={isLoading}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} aktivitas`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Belum ada aktivitas"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card.Section>
    </Card>
  );

  return viewMode === "timeline" ? renderTimeline() : renderTable();
}

export default DocumentAuditLog;
