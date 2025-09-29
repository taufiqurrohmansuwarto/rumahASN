import { useSignatureRequests } from "@/hooks/esign-bkd";
import {
  CheckOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Text, Badge, Tooltip } from "@mantine/core";
import { IconUser, IconUsers, IconArrowRight, IconEqual } from "@tabler/icons-react";
import {
  Avatar,
  Badge as AntdBadge,
  Button,
  Card,
  Col,
  Dropdown,
  Grid,
  Input,
  Row,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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
  return <AntdBadge status={config.color} text={config.text} />;
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
    },
    {
      key: "sign",
      label: "Tanda Tangan",
      icon: <CheckOutlined />,
      disabled:
        record.status !== "pending" ||
        !record.signature_details?.some(
          (detail) => detail.status === "waiting"
        ),
    },
  ];

  const handleMenuClick = (record) => (e) => {
    const { key } = e;

    switch (key) {
      case "view":
        router.push(`/esign-bkd/signature-requests/${record.document?.id || record.document_id}`);
        break;
      case "sign":
        router.push(`/esign-bkd/signature-requests/${record.document?.id || record.document_id}/sign`);
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: <Text strong>Dokumen & Status</Text>,
      key: "main",
      render: (_, record) => (
        <div style={{ lineHeight: 1.2 }}>
          <div>
            <Text style={{ fontWeight: 600, fontSize: 13 }}>
              {record.document?.title || record.document_title}
            </Text>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text style={{ fontSize: 11, color: "#999" }}>
              {record.document?.document_code || record.document_code}
            </Text>
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <StatusBadge status={record.status} />
            <Badge
              color={record.type === "self_sign" ? "blue" : "green"}
              size="xs"
              leftSection={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {record.type === "self_sign" ? <IconUser size={10} /> : <IconUsers size={10} />}
                </div>
              }
            >
              {record.type === "self_sign" ? "Sendiri" : "Permintaan"}
            </Badge>
            <Badge
              color={record.request_type === "sequential" ? "orange" : "violet"}
              size="xs"
              leftSection={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {record.request_type === "sequential" ? <IconArrowRight size={10} /> : <IconEqual size={10} />}
                </div>
              }
            >
              {record.request_type === "sequential" ? "Berurutan" : "Paralel"}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      title: <Text strong>Pembuat</Text>,
      key: "creator",
      width: isMobile ? 160 : 220,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip label={`${record.creator?.username} - ${record.creator?.nama_jabatan}`}>
            <Avatar
              size="small"
              src={record.creator?.image}
              style={{
                backgroundColor: "#1890ff",
                flexShrink: 0,
              }}
            >
              {record.creator?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Tooltip>
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <Tooltip label={record.creator?.username}>
              <div>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    maxWidth: isMobile ? '100px' : '140px'
                  }}
                >
                  {record.creator?.username}
                </Text>
              </div>
            </Tooltip>
            <Tooltip label={record.creator?.nama_jabatan}>
              <div style={{ marginTop: 2 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#999",
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    maxWidth: isMobile ? '100px' : '140px'
                  }}
                >
                  {record.creator?.nama_jabatan}
                </Text>
              </div>
            </Tooltip>
            <div style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 10, color: "#666" }}>
                {dayjs(record.created_at).format("DD/MM/YY HH:mm")}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <Text strong>Progress</Text>,
      key: "progress",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (_, record) => {
        const signedCount = record.signature_details?.filter(detail => detail.status === 'signed').length || 0;
        const totalSigners = record.signature_details?.length || 0;
        const percentage = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;

        return (
          <Tooltip label={`${signedCount} dari ${totalSigners} telah menandatangani (${percentage}%)`}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: percentage === 100 ? "#52c41a" : "#1890ff" }}>
                {signedCount}/{totalSigners}
              </Text>
              <div>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  {percentage}%
                </Text>
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: <Text strong>Aksi</Text>,
      key: "actions",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionItems(record),
            onClick: handleMenuClick(record),
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
            rowKey={(record) => record.document?.id || record.document_id || record.id}
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
              total: data?.pagination?.total || 0,
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
              rowKey={(record) => record.document?.id || record.document_id || record.id}
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
                total: data?.pagination?.total || 0,
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
