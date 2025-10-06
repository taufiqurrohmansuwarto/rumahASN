import {
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";
import {
  Avatar,
  Button,
  Card,
  Col,
  Grid,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  Empty,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { usePendingRequests } from "@/hooks/esign-bkd";

dayjs.locale("id");

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function PendingRequestsList() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;
  const [searchText, setSearchText] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filters = useMemo(
    () => ({
      page: parseInt(router.query.page) || 1,
      limit: parseInt(router.query.limit) || 10,
      search: debouncedSearch,
    }),
    [router.query, debouncedSearch]
  );

  const { data, isLoading, refetch, isRefetching } = usePendingRequests(filters);

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

  const handleViewDetail = (record) => {
    router.push(`/esign-bkd/signature-requests/${record.id}`);
  };

  // Get role badge
  const getRoleBadge = (userDetail) => {
    if (!userDetail) return null;

    const roleConfig = {
      reviewer: { color: "blue", text: "REVIEWER" },
      signer: { color: "orange", text: "SIGNER" },
    };

    const config = roleConfig[userDetail.role_type] || { color: "gray", text: userDetail.role_type?.toUpperCase() };

    return (
      <Badge color={config.color} variant="light" size="sm">
        {config.text}
      </Badge>
    );
  };

  // Get status badge for request
  const getStatusBadge = (status) => {
    return (
      <Badge color="yellow" variant="light" size="sm" leftSection={<ClockCircleOutlined style={{ fontSize: 12 }} />}>
        MENUNGGU AKSI
      </Badge>
    );
  };

  const columns = [
    {
      title: (
        <Space size={4}>
          <FileTextOutlined style={{ fontSize: 14 }} />
          <Text fw={600} style={{ fontSize: 13 }}>Dokumen</Text>
        </Space>
      ),
      key: "document",
      render: (_, record) => {
        // Find current user detail
        const userDetail = record.signature_details?.find(
          (detail) => detail.status === "waiting"
        );

        const fileSize = record.document?.file_size || 0;
        const fileSizeKB = fileSize > 0 ? (fileSize / 1024).toFixed(0) : 0;
        const fileSizeMB = fileSize > 1024 * 1024 ? (fileSize / (1024 * 1024)).toFixed(2) : null;
        const displaySize = fileSizeMB ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

        return (
          <Space size={8}>
            <Avatar
              size={28}
              style={{
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
              }}
              icon={<FileTextOutlined style={{ color: "#fa8c16", fontSize: 14 }} />}
            />
            <div style={{ lineHeight: 1.2 }}>
              <a
                onClick={() => handleViewDetail(record)}
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#1890ff",
                  textDecoration: "none",
                  display: "block",
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
              >
                {record.document?.title || "Untitled"}
              </a>
              <div style={{ marginTop: 2, display: "flex", gap: 4, alignItems: "center" }}>
                <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                  PDF
                </Text>
                {fileSize > 0 && (
                  <>
                    <Text style={{ fontSize: 11, color: "#d9d9d9" }}>•</Text>
                    <Text style={{ fontSize: 11, color: "#595959", fontWeight: 500 }}>
                      {displaySize}
                    </Text>
                  </>
                )}
                {userDetail && (
                  <>
                    <Text style={{ fontSize: 11, color: "#d9d9d9" }}>•</Text>
                    {getRoleBadge(userDetail)}
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
          <CheckCircleOutlined />
          <Text fw={600}>Status</Text>
        </Space>
      ),
      key: "status",
      width: isMobile ? 100 : 140,
      align: "center",
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined />
          <Text fw={600}>Dibuat</Text>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: isMobile ? 100 : 140,
      render: (date) => (
        <Tooltip title={dayjs(date).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text style={{ fontSize: 12 }}>{dayjs(date).format("DD/MM/YY")}</Text>
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
      title: (
        <Space>
          <Avatar size={16} style={{ backgroundColor: "#FF4500" }} icon={<UserOutlined />} />
          <Text fw={600}>Pembuat</Text>
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
          </div>
        </Space>
      ),
      responsive: ["md"],
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
            <ClockCircleOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Dokumen Menunggu Tindakan
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Daftar dokumen yang memerlukan review atau tanda tangan dari Anda
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
              <Col xs={24} sm={12} md={10} lg={8}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isXs ? "column" : "row",
                    alignItems: isXs ? "stretch" : "center",
                    gap: 6,
                  }}
                >
                  <Text strong style={{ color: "#6b7280", minWidth: "fit-content" }}>
                    Cari:
                  </Text>
                  <Search
                    placeholder="Cari dokumen atau kode..."
                    allowClear
                    onSearch={handleSearch}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={24} md={14} lg={16}>
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
                    <ClockCircleOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text style={{ color: "#6b7280", fontSize: 16 }}>
                        Tidak ada dokumen yang menunggu tindakan
                      </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                        Semua dokumen sudah diproses atau tidak ada yang memerlukan aksi dari Anda
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
                  )} dari ${total.toLocaleString("id-ID")} dokumen`,
                style: { margin: "16px 0" },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PendingRequestsList;