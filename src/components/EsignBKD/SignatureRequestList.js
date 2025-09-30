import { useSignatureRequests } from "@/hooks/esign-bkd";
import {
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
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
  Space,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { SignatureRequestStatusBadge } from "./shared";

dayjs.locale("id");

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;


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
        router.push(`/esign-bkd/signature-requests/${record.id}`);
        break;
      case "sign":
        router.push(`/esign-bkd/signature-requests/${record.id}/sign`);
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: (
        <Space>
          <FileTextOutlined />
          <Text strong>Dokumen</Text>
        </Space>
      ),
      key: "document",
      render: (_, record) => {
        const fileSize = record.document?.file_size || 0;
        const fileSizeKB = fileSize > 0 ? (fileSize / 1024).toFixed(0) : 0;
        const fileSizeMB = fileSize > 1024 * 1024 ? (fileSize / (1024 * 1024)).toFixed(2) : null;
        const displaySize = fileSizeMB ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

        return (
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
                <a
                  onClick={() => router.push(`/esign-bkd/signature-requests/${record.id}`)}
                  style={{
                    fontWeight: 600,
                    fontSize: isMobile ? 11 : 12,
                    cursor: 'pointer',
                    color: '#1890ff',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {record.document?.title || record.document_title}
                </a>
              </div>
              <div style={{ marginTop: "2px", display: 'flex', gap: 4, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  {record.document?.document_code || record.document_code}
                </Text>
                <Text style={{ fontSize: 10, color: "#999" }}>•</Text>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  .pdf
                </Text>
                {fileSize > 0 && (
                  <>
                    <Text style={{ fontSize: 10, color: "#999" }}>•</Text>
                    <Text style={{ fontSize: 10, color: "#666", fontWeight: 500 }}>
                      {displaySize}
                    </Text>
                  </>
                )}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          <Text strong>Status & Info</Text>
        </Space>
      ),
      key: "status_info",
      width: isMobile ? 140 : 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <SignatureRequestStatusBadge status={record.status} />
          <Badge
            color={record.type === "self_sign" ? "blue" : "green"}
            size="xs"
            leftSection={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {record.type === "self_sign" ? <IconUser size={10} /> : <IconUsers size={10} />}
              </div>
            }
            styles={{
              section: {
                display: 'flex',
                alignItems: 'center',
              }
            }}
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
            styles={{
              section: {
                display: 'flex',
                alignItems: 'center',
              }
            }}
          >
            {record.request_type === "sequential" ? "Berurutan" : "Paralel"}
          </Badge>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <Avatar
            size={16}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Text strong>Pembuat</Text>
        </Space>
      ),
      key: "creator",
      width: isMobile ? 150 : 200,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record.creator?.image}
            size={isMobile ? 28 : 32}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {!record.creator?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: 1.1 }}>
            <div>
              <Text style={{ fontWeight: 600, fontSize: isMobile ? 11 : 12 }}>
                {record.creator?.username || "-"}
              </Text>
            </div>
            {record.creator?.nama_jabatan && (
              <div style={{ marginTop: "0px" }}>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  {record.creator?.nama_jabatan}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      responsive: ["md"],
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          <Text strong>Progress</Text>
        </Space>
      ),
      key: "progress",
      width: isMobile ? 120 : 160,
      align: "center",
      render: (_, record) => {
        const signedCount = record.signature_details?.filter(detail => detail.status === 'signed').length || 0;
        const totalSigners = record.signature_details?.length || 0;
        const percentage = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;
        const signers = record.signature_details || [];

        return (
          <div style={{ textAlign: 'center' }}>
            <Tooltip label={`${signedCount} dari ${totalSigners} telah menandatangani (${percentage}%)`}>
              <div style={{ cursor: 'pointer', marginBottom: 6 }}>
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
            <Avatar.Group
              maxCount={3}
              size={isMobile ? 20 : 24}
              maxStyle={{
                color: '#f56a00',
                backgroundColor: '#fde3cf',
                cursor: 'pointer',
                fontSize: isMobile ? 10 : 12
              }}
            >
              {signers.map((signer, idx) => (
                <Tooltip
                  key={idx}
                  title={`${signer.user?.username || 'User'} - ${signer.status === 'signed' ? 'Sudah TTD' : signer.status === 'waiting' ? 'Menunggu' : signer.status}`}
                >
                  <Avatar
                    src={signer.user?.image}
                    style={{
                      backgroundColor: signer.status === 'signed' ? '#52c41a' : '#1890ff',
                      border: signer.status === 'signed' ? '2px solid #52c41a' : '2px solid #d9d9d9',
                      cursor: 'pointer'
                    }}
                    size={isMobile ? 20 : 24}
                  >
                    {signer.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          </div>
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
      responsive: ["lg"],
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
            onClick: handleMenuClick(record),
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
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
