import { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Dropdown,
  Typography,
  Tooltip,
  Progress,
  Empty,
  Flex,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconSearch,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconBookmark,
  IconBookmarkFilled,
  IconPlayerPlay,
  IconFileText,
} from "@tabler/icons-react";
import { getDocuments, toggleBookmark, deleteDocument } from "@/services/rasn-naskah.services";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

const statusColors = {
  draft: "default",
  pending_review: "processing",
  reviewing: "processing",
  reviewed: "success",
  revised: "warning",
  final: "green",
  archived: "default",
};

const statusLabels = {
  draft: "Draft",
  pending_review: "Menunggu Review",
  reviewing: "Sedang Review",
  reviewed: "Sudah Direview",
  revised: "Sudah Direvisi",
  final: "Final",
  archived: "Diarsipkan",
};

const categoryLabels = {
  surat_dinas: "Surat Dinas",
  nota_dinas: "Nota Dinas",
  surat_keputusan: "SK",
  surat_edaran: "Surat Edaran",
  surat_tugas: "Surat Tugas",
  surat_undangan: "Undangan",
  surat_perintah: "Sprint",
  berita_acara: "Berita Acara",
  laporan: "Laporan",
  proposal: "Proposal",
  telaahan_staf: "Telaahan",
  disposisi: "Disposisi",
  memo: "Memo",
  lainnya: "Lainnya",
};

function DocumentList({ onView, onEdit, onReview }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: null,
    category: null,
  });

  const handleView = (record) => {
    if (onView) {
      onView(record);
    } else {
      router.push(`/rasn-naskah/documents/${record.id}`);
    }
  };

  const handleEdit = (record) => {
    if (onEdit) {
      onEdit(record);
    } else {
      router.push(`/rasn-naskah/documents/${record.id}/edit`);
    }
  };

  const handleReview = (record) => {
    if (onReview) {
      onReview(record);
    } else {
      router.push(`/rasn-naskah/documents/${record.id}/review`);
    }
  };

  const { data, isLoading } = useQuery(
    ["rasn-naskah-documents", filters],
    () => getDocuments(filters),
    { keepPreviousData: true }
  );

  const bookmarkMutation = useMutation(toggleBookmark, {
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-documents"]);
    },
  });

  const deleteMutation = useMutation(deleteDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(["rasn-naskah-documents"]);
    },
  });

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns = [
    {
      title: "Dokumen",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: "pointer" }} onClick={() => handleView(record)}>
            {title}
          </Text>
          <Space size={4}>
            {record.category && (
              <Tag size="small">{categoryLabels[record.category] || record.category}</Tag>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(record.created_at).fromNow()}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: "Skor",
      dataIndex: "latest_score",
      key: "latest_score",
      width: 120,
      render: (score) => {
        if (!score) return <Text type="secondary">-</Text>;
        const color = score >= 80 ? "#52c41a" : score >= 60 ? "#faad14" : "#ff4d4f";
        return (
          <Tooltip title={`Skor: ${score}/100`}>
            <Progress
              percent={score}
              size="small"
              strokeColor={color}
              format={(p) => `${p}`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Review",
      dataIndex: "review_count",
      key: "review_count",
      width: 80,
      align: "center",
      render: (count) => (
        <Text type="secondary">{count || 0}x</Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_, record) => {
        const items = [
          {
            key: "view",
            icon: <IconEye size={14} />,
            label: "Lihat Detail",
            onClick: () => handleView(record),
          },
          {
            key: "edit",
            icon: <IconEdit size={14} />,
            label: "Edit",
            onClick: () => handleEdit(record),
          },
          {
            key: "review",
            icon: <IconPlayerPlay size={14} />,
            label: "Review AI",
            onClick: () => handleReview(record),
            disabled: !["draft", "revised"].includes(record.status),
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <IconTrash size={14} />,
            label: "Arsipkan",
            danger: true,
            onClick: () => deleteMutation.mutate(record.id),
          },
        ];

        return (
          <Space>
            <Button
              type="text"
              size="small"
              icon={
                record.is_bookmarked ? (
                  <IconBookmarkFilled size={16} color="#faad14" />
                ) : (
                  <IconBookmark size={16} />
                )
              }
              onClick={() => bookmarkMutation.mutate({ documentId: record.id })}
            />
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button type="text" size="small" icon={<IconDotsVertical size={16} />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Flex gap={12} style={{ marginBottom: 16 }}>
        <Input
          placeholder="Cari dokumen..."
          prefix={<IconSearch size={16} />}
          style={{ width: 300 }}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 160 }}
          options={Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
        />
        <Select
          placeholder="Kategori"
          allowClear
          style={{ width: 160 }}
          options={Object.entries(categoryLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => setFilters((prev) => ({ ...prev, category: value, page: 1 }))}
        />
      </Flex>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total: data?.meta?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} dokumen`,
          onChange: (page, pageSize) =>
            setFilters((prev) => ({ ...prev, page, limit: pageSize })),
        }}
        locale={{
          emptyText: (
            <Empty
              image={<IconFileText size={48} color="#d9d9d9" />}
              imageStyle={{ height: 60 }}
              description="Belum ada dokumen"
            />
          ),
        }}
      />
    </div>
  );
}

export default DocumentList;

