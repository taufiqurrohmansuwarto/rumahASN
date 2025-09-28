import {
  Table,
  Input,
  Button,
  Card,
  Dropdown,
  Empty,
  Flex,
  Row,
  Col,
  Grid,
  Typography,
  Space,
  Avatar,
  Tooltip,
} from "antd";
import { Text, Badge } from "@mantine/core";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  MoreOutlined,
  FileTextOutlined,
  FilterOutlined,
  SafetyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  useDocuments,
  useDeleteDocument,
  useDownloadDocument,
} from "@/hooks/esign-bkd";
import { DocumentStatusBadge } from "./shared";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Search } = Input;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function DocumentList({
  filter = null,
  hideSearch = false,
  hideTitle = false,
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

  const { data, isLoading, refetch, isRefetching } = useDocuments(filters);
  const { mutateAsync: deleteDocument, isLoading: deleteLoading } =
    useDeleteDocument();
  const { mutateAsync: downloadDocument, isLoading: downloadLoading } =
    useDownloadDocument();

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

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      await downloadDocument({ id, filename });
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const statusOptions = [
    { key: "", label: "Semua Status" },
    { key: "draft", label: "Draft" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Selesai" },
    { key: "rejected", label: "Ditolak" },
  ];

  const getActionItems = (record) => [
    {
      key: "view",
      label: "Lihat Detail",
      icon: <EyeOutlined />,
      onClick: () => router.push(`/esign-bkd/documents/${record.id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => router.push(`/esign-bkd/documents/${record.id}/edit`),
      disabled: record.status !== "draft",
    },
    {
      key: "download",
      label: "Download",
      icon: <DownloadOutlined />,
      onClick: () => handleDownload(record.id, record.filename),
      loading: downloadLoading,
    },
    {
      key: "delete",
      label: "Hapus",
      icon: <DeleteOutlined />,
      onClick: () => handleDelete(record.id),
      danger: true,
      disabled: record.status !== "draft",
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
                {record.title}
              </Text>
            </div>
            {record.description && (
              <div style={{ marginTop: "0px" }}>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  {record.description}
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
      width: isMobile ? 100 : 120,
      align: "center",
      render: (status) => <DocumentStatusBadge status={status} />,
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
      title: (
        <Space>
          <Avatar
            size={16}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Text strong>Pemilik</Text>
        </Space>
      ),
      key: "owner",
      width: isMobile ? 150 : 200,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record.created_by?.image}
            size={isMobile ? 28 : 32}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {!record.created_by?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: 1.1 }}>
            <div>
              <Text style={{ fontWeight: 600, fontSize: isMobile ? 11 : 12 }}>
                {record.created_by?.name || "-"}
              </Text>
            </div>
            {record.created_by?.email && (
              <div style={{ marginTop: "0px" }}>
                <Text style={{ fontSize: 10, color: "#999" }}>
                  {record.created_by.email}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      responsive: ["md"],
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
                      placeholder="Cari dokumen..."
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
                  <FileTextOutlined
                    style={{
                      fontSize: 64,
                      color: "#d1d5db",
                      marginBottom: 24,
                    }}
                  />
                  <div>
                    <Text style={{ color: "#6b7280", fontSize: 16 }}>
                      Tidak ada dokumen ditemukan
                    </Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                      Belum ada dokumen yang tersedia
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
                )} dari ${total.toLocaleString("id-ID")} dokumen`,
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
            <FileTextOutlined
              style={{ fontSize: "24px", marginBottom: "8px" }}
            />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Daftar Dokumen
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Kelola dokumen elektronik dan workflow
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
                    placeholder="Cari dokumen..."
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
                    Upload Dokumen
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
                    <FileTextOutlined
                      style={{
                        fontSize: 64,
                        color: "#d1d5db",
                        marginBottom: 24,
                      }}
                    />
                    <div>
                      <Text style={{ color: "#6b7280", fontSize: 16 }}>
                        Tidak ada dokumen ditemukan
                      </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                        Belum ada dokumen yang tersedia
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

export default DocumentList;
