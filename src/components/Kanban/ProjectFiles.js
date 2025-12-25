import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Input, Select, Empty, Flex, Button } from "antd";
import { Stack, Text, Badge, Group, Avatar } from "@mantine/core";
import {
  IconSearch,
  IconFile,
  IconLink,
  IconPhoto,
  IconFileText,
  IconFolder,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { getProjectAttachments } from "../../../services/kanban.services";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "-";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (fileType, attachmentType) => {
  if (attachmentType === "link") {
    return <IconLink size={20} color="#228be6" />;
  }

  if (!fileType) return <IconFile size={20} color="#868e96" />;

  if (fileType.startsWith("image/")) {
    return <IconPhoto size={20} color="#40c057" />;
  }

  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("word") ||
    fileType.includes("text")
  ) {
    return <IconFileText size={20} color="#fa5252" />;
  }

  return <IconFile size={20} color="#868e96" />;
};

function ProjectFiles({ projectId }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState("");
  const limit = 20;

  const { data, isLoading } = useQuery(
    ["kanban-project-attachments", projectId, page, search, type],
    () =>
      getProjectAttachments({
        projectId,
        page,
        limit,
        search,
        type,
      }),
    { enabled: !!projectId, keepPreviousData: true }
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleTypeChange = (value) => {
    setType(value);
    setPage(1);
  };

  const handleDownload = (attachment) => {
    if (attachment.attachment_type === "link") {
      window.open(attachment.file_url, "_blank");
    } else {
      const baseUrl =
        process.env.NEXT_PUBLIC_MINIO_URL ||
        "https://siasn.bkd.jatimprov.go.id:9000";
      const url = `${baseUrl}/public/${attachment.file_path}`;
      window.open(url, "_blank");
    }
  };

  const columns = [
    {
      title: "File",
      dataIndex: "filename",
      key: "filename",
      render: (filename, record) => (
        <Group
          gap={10}
          wrap="nowrap"
          style={{ cursor: "pointer" }}
          onClick={() => handleDownload(record)}
        >
          {getFileIcon(record.file_type, record.attachment_type)}
          <Stack gap={0}>
            <Text
              size="sm"
              fw={500}
              lineClamp={1}
              style={{ maxWidth: 300 }}
              c="blue"
              td="hover:underline"
            >
              {filename}
            </Text>
            {record.attachment_type === "link" && (
              <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 300 }}>
                {record.file_url}
              </Text>
            )}
          </Stack>
        </Group>
      ),
    },
    {
      title: "Task",
      dataIndex: "task_title",
      key: "task_title",
      render: (title, record) => (
        <Stack gap={0}>
          <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
            {title}
          </Text>
          <Text size="xs" c="dimmed">
            {record.task_number}
          </Text>
        </Stack>
      ),
    },
    {
      title: "Tipe",
      dataIndex: "attachment_type",
      key: "attachment_type",
      width: 100,
      render: (attachmentType) => (
        <Badge
          size="sm"
          color={attachmentType === "link" ? "blue" : "gray"}
          variant="light"
        >
          {attachmentType === "link" ? "Link" : "File"}
        </Badge>
      ),
    },
    {
      title: "Ukuran",
      dataIndex: "file_size",
      key: "file_size",
      width: 100,
      render: (size) => (
        <Text size="xs" c="dimmed">
          {formatBytes(size)}
        </Text>
      ),
    },
    {
      title: "Diupload Oleh",
      dataIndex: "uploader",
      key: "uploader",
      width: 150,
      render: (uploader) => (
        <Group gap={6} wrap="nowrap">
          <Avatar src={uploader?.image} size={24} radius="xl">
            {uploader?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Text size="xs" lineClamp={1}>
            {uploader?.username}
          </Text>
        </Group>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => (
        <Text size="xs" c="dimmed">
          {dayjs(date).format("DD MMM YYYY")}
        </Text>
      ),
    },
  ];

  return (
    <Stack gap={16}>
      {/* Filters */}
      <Group gap={12}>
        <Input
          placeholder="Cari nama file atau task..."
          prefix={<IconSearch size={16} color="#bfbfbf" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>
          Cari
        </Button>
        <Select
          placeholder="Semua Tipe"
          value={type || undefined}
          onChange={handleTypeChange}
          allowClear
          style={{ width: 150 }}
          options={[
            { value: "file", label: "File" },
            { value: "link", label: "Link" },
          ]}
        />
      </Group>

      {/* Table */}
      {data?.data?.length === 0 ? (
        <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
          <Empty
            image={<IconFolder size={48} color="#adb5bd" />}
            description={
              search
                ? "Tidak ada file yang cocok dengan pencarian"
                : "Belum ada file yang diupload dalam project ini"
            }
          />
        </Flex>
      ) : (
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            showTotal: (total) => `${total} file`,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          size="small"
        />
      )}
    </Stack>
  );
}

export default ProjectFiles;

