import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Badge,
  Dropdown,
  Progress,
  Tooltip,
  Empty,
  Flex,
  Row,
  Col,
  Grid,
  Avatar,
} from "antd";
import { Text } from "@mantine/core";
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  SafetyOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSignatureRequests } from "@/hooks/esign-bkd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "processing", text: "Menunggu" },
    in_progress: { color: "warning", text: "Proses" },
    completed: { color: "success", text: "Selesai" },
    cancelled: { color: "default", text: "Dibatalkan" },
    rejected: { color: "error", text: "Ditolak" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return <Badge status={config.color} text={config.text} />;
};

const PriorityTag = ({ priority }) => {
  const priorityConfig = {
    low: { color: "default", text: "Rendah" },
    normal: { color: "blue", text: "Normal" },
    high: { color: "orange", text: "Tinggi" },
    urgent: { color: "red", text: "Mendesak" },
  };

  const config = priorityConfig[priority] || priorityConfig.normal;
  return <Tag color={config.color}>{config.text}</Tag>;
};

const WorkflowProgress = ({ signed, total }) => {
  const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;

  return (
    <div style={{ width: 120 }}>
      <Progress
        percent={percentage}
        size="small"
        format={() => (
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            {signed}/{total}
          </span>
        )}
        strokeColor={percentage === 100 ? "#52c41a" : "#1890ff"}
        strokeWidth={8}
        style={{ marginBottom: 4 }}
      />
      <div style={{ fontSize: 11, color: "#8e8e93", textAlign: "center" }}>
        {percentage}% selesai
      </div>
    </div>
  );
};

function SignatureRequestList({
  filter = null,
  hideTitle = false,
  hideSearch = false,
}) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filters = useMemo(
    () => ({
      page: parseInt(router.query.page) || 1,
      limit: parseInt(router.query.limit) || 10,
      search: debouncedSearch,
      status: filter || router.query.status || selectedStatus,
    }),
    [router.query, debouncedSearch, selectedStatus, filter]
  );

  const { data, isLoading, refetch, isRefetching } =
    useSignatureRequests(filters);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Update URL params
  const updateFilters = (newFilters) => {
    const query = { ...router.query, ...newFilters };
    if (newFilters.page === 1) delete query.page;
    if (!newFilters.status) delete query.status;

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearch = (value) => {
    setSearchText(value);
    updateFilters({ page: 1 });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    updateFilters({ status, page: 1 });
  };

  const statusOptions = [
    { key: "", label: "Semua Status" },
    { key: "pending", label: "Menunggu" },
    { key: "in_progress", label: "Proses" },
    { key: "completed", label: "Selesai" },
    { key: "rejected", label: "Ditolak" },
  ];

  const getActionItems = (record) => [
    {
      key: "view",
      label: "Lihat Detail",
      icon: <EyeOutlined />,
      onClick: () => router.push(`/esign-bkd/signature-requests/${record.id}`),
    },
    {
      key: "history",
      label: "Riwayat",
      icon: <ClockCircleOutlined />,
      onClick: () =>
        router.push(`/esign-bkd/signature-requests/${record.id}/history`),
    },
    {
      key: "review",
      label: "Review",
      icon: <EditOutlined />,
      onClick: () =>
        router.push(`/esign-bkd/signature-requests/${record.id}/review`),
      disabled: !record.can_review,
    },
    {
      key: "sign",
      label: "Tanda Tangan",
      icon: <CheckOutlined />,
      onClick: () =>
        router.push(`/esign-bkd/signature-requests/${record.id}/sign`),
      disabled: !record.can_sign,
    },
  ];

  const columns = [
    {
      title: (
        <Space>
          <FileTextOutlined />
          <Text strong>Dokumen</Text>
        </Space>
      ),
      key: "document",
      render: (_, record) => (
        <Space size="small">
          <Avatar
            size={isMobile ? 32 : 36}
            style={{
              backgroundColor: "#e6f7ff",
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            icon={<FileTextOutlined style={{ color: "#1890ff" }} />}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div>
              <Text style={{ fontWeight: 600, fontSize: isMobile ? 11 : 12 }}>
                {record.document?.title || record.title}
              </Text>
            </div>
            <div style={{ marginTop: "0px" }}>
              <Text style={{ fontSize: 10, color: "#999" }}>
                ID: {record.id}
              </Text>
            </div>
            <Space size="small" style={{ marginTop: 4 }}>
              <PriorityTag priority={record.priority} />
              {record.deadline && (
                <Tag
                  color={
                    dayjs(record.deadline).isBefore(dayjs()) ? "red" : "blue"
                  }
                  style={{ borderRadius: 6, fontSize: 10 }}
                >
                  {dayjs(record.deadline).format("DD MMM")}
                </Tag>
              )}
            </Space>
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
      width: isMobile ? 100 : 120,
      align: "center",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          <Text strong>Progress</Text>
        </Space>
      ),
      key: "progress",
      width: isMobile ? 100 : 120,
      align: "center",
      render: (_, record) => (
        <WorkflowProgress
          signed={record.signed_count || 0}
          total={record.total_signers || 0}
        />
      ),
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
      title: <Text strong>Aksi</Text>,
      key: "actions",
      width: isMobile ? 60 : 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionItems(record),
            onClick: ({ key }) => {
              const item = getActionItems(record).find(
                (item) => item.key === key
              );
              if (item?.onClick) item.onClick();
            },
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            size="small"
            icon={<TeamOutlined />}
            style={{
              color: "#FF4500",
              fontWeight: 500,
              padding: "0 8px",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  // If used inside TabLayout, render only the table
  if (hideTitle) {
    return (
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div style={{ marginTop: "16px" }}>
          {!hideSearch && (
            <div
              style={{
                padding: "20px 0 16px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isXs ? "column" : "row",
                      alignItems: isXs ? "stretch" : "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      strong
                      style={{ color: "#6b7280", minWidth: "fit-content" }}
                    >
                      Cari:
                    </Text>
                    <Search
                      placeholder="Cari permintaan..."
                      allowClear
                      onSearch={handleSearch}
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isXs ? "column" : "row",
                      alignItems: isXs ? "stretch" : "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      strong
                      style={{ color: "#6b7280", minWidth: "fit-content" }}
                    >
                      Status:
                    </Text>
                    <Dropdown
                      menu={{
                        items: statusOptions.map((option) => ({
                          key: option.key,
                          label: option.label,
                          onClick: () => handleStatusFilter(option.key),
                        })),
                      }}
                    >
                      <Button
                        icon={<FilterOutlined />}
                        style={{
                          borderRadius: 6,
                          fontWeight: 500,
                          width: "100%",
                        }}
                      >
                        {statusOptions.find(
                          (opt) =>
                            opt.key === (router.query.status || selectedStatus)
                        )?.label || "Filter Status"}
                      </Button>
                    </Dropdown>
                  </div>
                </Col>
                <Col xs={24} md={10} lg={14}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isXs ? "flex-start" : "flex-end",
                      gap: 8,
                    }}
                  >
                    <Button
                      icon={<ReloadOutlined />}
                      loading={isLoading || isRefetching}
                      onClick={() => refetch()}
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
          )}

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
                  <TeamOutlined
                    style={{
                      fontSize: 64,
                      color: "#d1d5db",
                      marginBottom: 24,
                    }}
                  />
                  <div>
                    <Text style={{ color: "#6b7280", fontSize: 16 }}>
                      Tidak ada permintaan tanda tangan
                    </Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                      Belum ada permintaan yang tersedia
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
              onChange: (page, size) => updateFilters({ page, limit: size }),
              showTotal: (total, range) =>
                `${range[0].toLocaleString("id-ID")}-${range[1].toLocaleString(
                  "id-ID"
                )} dari ${total.toLocaleString("id-ID")} permintaan`,
              style: { margin: "16px 0" },
            }}
          />
        </div>
      </div>
    );
  }

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
            <TeamOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Permintaan Tanda Tangan
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Kelola permintaan tanda tangan elektronik
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isXs ? "column" : "row",
                    alignItems: isXs ? "stretch" : "center",
                    gap: 6,
                  }}
                >
                  <Text
                    strong
                    style={{ color: "#6b7280", minWidth: "fit-content" }}
                  >
                    Cari:
                  </Text>
                  <Search
                    placeholder="Cari permintaan..."
                    allowClear
                    onSearch={handleSearch}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isXs ? "column" : "row",
                    alignItems: isXs ? "stretch" : "center",
                    gap: 6,
                  }}
                >
                  <Text
                    strong
                    style={{ color: "#6b7280", minWidth: "fit-content" }}
                  >
                    Status:
                  </Text>
                  <Dropdown
                    menu={{
                      items: statusOptions.map((option) => ({
                        key: option.key,
                        label: option.label,
                        onClick: () => handleStatusFilter(option.key),
                      })),
                    }}
                  >
                    <Button
                      icon={<FilterOutlined />}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        width: "100%",
                      }}
                    >
                      {statusOptions.find(
                        (opt) =>
                          opt.key === (router.query.status || selectedStatus)
                      )?.label || "Filter Status"}
                    </Button>
                  </Dropdown>
                </div>
              </Col>
              <Col xs={24} md={10} lg={14}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: isXs ? "flex-start" : "flex-end",
                    gap: 8,
                  }}
                >
                  <Button
                    icon={<ReloadOutlined />}
                    loading={isLoading || isRefetching}
                    onClick={() => refetch()}
                    style={{
                      borderRadius: 6,
                      fontWeight: 500,
                      padding: "0 16px",
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push("/esign-bkd/documents/create")}
                    style={{
                      background: "#FF4500",
                      borderColor: "#FF4500",
                      borderRadius: 6,
                      fontWeight: 500,
                      padding: "0 16px",
                    }}
                  >
                    Buat Permintaan
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
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
                    <TeamOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text style={{ color: "#6b7280", fontSize: 16 }}>
                        Tidak ada permintaan tanda tangan
                      </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                        Belum ada permintaan yang tersedia
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
                onChange: (page, size) => updateFilters({ page, limit: size }),
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} permintaan`,
                style: { margin: "16px 0" },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SignatureRequestList;
