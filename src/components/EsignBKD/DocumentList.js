import {
  Table,
  Input,
  Button,
  Card,
  Dropdown,
  Empty,
  Flex,
} from "antd";
import { Text, Title } from "@mantine/core";
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
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDocuments, useDeleteDocument, useDownloadDocument } from "@/hooks/esign-bkd";
import { DocumentStatusBadge } from "./shared";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Search } = Input;

function DocumentList() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filters = useMemo(() => ({
    page: parseInt(router.query.page) || 1,
    limit: parseInt(router.query.limit) || 10,
    search: debouncedSearch,
    status: router.query.status || selectedStatus,
  }), [router.query, debouncedSearch, selectedStatus]);

  const { data, isLoading } = useDocuments(filters);
  const { mutateAsync: deleteDocument, isLoading: deleteLoading } = useDeleteDocument();
  const { mutateAsync: downloadDocument, isLoading: downloadLoading } = useDownloadDocument();

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

    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
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
      title: "Dokumen",
      key: "document",
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Flex
            align="center"
            justify="center"
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#e6f7ff",
              borderRadius: 8
            }}
          >
            <FileTextOutlined style={{ color: "#1890ff" }} />
          </Flex>
          <Flex vertical style={{ minWidth: 0, flex: 1 }}>
            <Text fw={600} size="sm" truncate>{record.title}</Text>
            {record.description && (
              <Text size="xs" c="dimmed" truncate>
                {record.description}
              </Text>
            )}
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <DocumentStatusBadge status={status} />,
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => (
        <Flex vertical>
          <Text size="sm" fw={500}>{dayjs(date).format("DD MMM")}</Text>
          <Text size="xs" c="dimmed">{dayjs(date).format("YYYY")}</Text>
        </Flex>
      ),
      responsive: ["md"],
    },
    {
      title: "Pemilik",
      key: "owner",
      width: 120,
      render: (_, record) => (
        <Flex vertical>
          <Text size="sm" fw={500}>{record.created_by?.name || "-"}</Text>
          <Text size="xs" c="dimmed">{record.created_by?.email}</Text>
        </Flex>
      ),
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionItems(record),
            onClick: ({ key }) => {
              const item = getActionItems(record).find(item => item.key === key);
              if (item?.onClick) item.onClick();
            },
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Flex vertical style={{ minHeight: "100vh", background: "#f5f5f5", padding: 16 }}>
      <Flex vertical style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }} gap="large">
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <Flex vertical>
            <Title level={3} style={{ margin: 0 }}>Daftar Dokumen</Title>
            <Text type="secondary">Kelola dokumen elektronik dan workflow</Text>
          </Flex>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/esign-bkd/documents/create")}
            size="large"
          >
            Upload Dokumen
          </Button>
        </Flex>

        <Card>
          <Flex vertical gap="large">
            <Flex gap="middle" wrap="wrap">
              <Flex flex={1} style={{ minWidth: 300 }}>
                <Search
                  placeholder="Cari dokumen..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                  size="large"
                  prefix={<SearchOutlined />}
                  style={{ width: "100%" }}
                />
              </Flex>
              <Dropdown
                menu={{
                  items: statusOptions.map(option => ({
                    key: option.key,
                    label: option.label,
                    onClick: () => handleStatusFilter(option.key),
                  })),
                }}
              >
                <Button icon={<FilterOutlined />} size="large">
                  {statusOptions.find(opt => opt.key === (router.query.status || selectedStatus))?.label || "Filter Status"}
                </Button>
              </Dropdown>
            </Flex>

            <Table
              columns={columns}
              dataSource={data?.data || []}
              loading={isLoading}
              rowKey="id"
              scroll={{ x: 800 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Tidak ada dokumen"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={{
                current: filters.page,
                pageSize: filters.limit,
                total: data?.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} dokumen`,
                onChange: (page, size) => updateFilters({ page, limit: size }),
              }}
            />
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}

export default DocumentList;