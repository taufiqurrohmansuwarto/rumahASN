import {
  getAllDocumentRevisions,
  getDocumentRevisionReferences,
  updateDocumentRevisionStatus,
} from "@/services/document-revisions.services";
import { useRouter } from "next/router";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFile,
  IconLoader,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { useState } from "react";
import * as XLSX from "xlsx";

const { TextArea } = Input;

// Status badge colors
const STATUS_CONFIG = {
  pending: { color: "orange", icon: IconClock, label: "Menunggu" },
  in_progress: { color: "blue", icon: IconLoader, label: "Diproses" },
  completed: { color: "green", icon: IconCheck, label: "Selesai" },
  rejected: { color: "red", icon: IconX, label: "Ditolak" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Tag color={config.color} icon={<config.icon size={12} />}>
      {config.label}
    </Tag>
  );
};

// Status counts card
const StatusCounts = ({ counts }) => {
  return (
    <Group spacing="xs" grow>
      <Card size="small">
        <Statistic
          title="Total"
          value={counts?.all || 0}
          valueStyle={{ fontSize: 20 }}
        />
      </Card>
      <Card size="small">
        <Statistic
          title="Menunggu"
          value={counts?.pending || 0}
          valueStyle={{ fontSize: 20, color: "#fa8c16" }}
        />
      </Card>
      <Card size="small">
        <Statistic
          title="Diproses"
          value={counts?.in_progress || 0}
          valueStyle={{ fontSize: 20, color: "#1890ff" }}
        />
      </Card>
      <Card size="small">
        <Statistic
          title="Selesai"
          value={counts?.completed || 0}
          valueStyle={{ fontSize: 20, color: "#52c41a" }}
        />
      </Card>
      <Card size="small">
        <Statistic
          title="Ditolak"
          value={counts?.rejected || 0}
          valueStyle={{ fontSize: 20, color: "#ff4d4f" }}
        />
      </Card>
    </Group>
  );
};

// Detail Modal
const DetailModal = ({ revision, open, onClose, references }) => {
  if (!revision) return null;

  const getDocTypeName = (code) => {
    return (
      references?.document_types?.find((d) => d.code === code)?.fullName || code
    );
  };

  const getRevisionTypeName = (code) => {
    return (
      references?.revision_types?.find((r) => r.value === code)?.label || code
    );
  };

  const getTmtLabel = (value) => {
    return references?.tmt_list?.find((t) => t.value === value)?.label || value;
  };

  return (
    <Modal
      title="Detail Pengajuan Perbaikan"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Tutup</Button>}
      width={600}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="NIP" span={2}>
          {revision.nip}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Dokumen">
          {getDocTypeName(revision.document_type)}
        </Descriptions.Item>
        <Descriptions.Item label="TMT">
          {getTmtLabel(revision.tmt)}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Perbaikan" span={2}>
          {getRevisionTypeName(revision.revision_type)}
        </Descriptions.Item>
        <Descriptions.Item label="Detail Perbaikan" span={2}>
          {revision.reason}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusBadge status={revision.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Pengajuan">
          {dayjs(revision.created_at).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Pengaju" span={2}>
          {revision.user?.username || revision.user_id}
        </Descriptions.Item>
        {revision.admin_notes && (
          <Descriptions.Item label="Catatan Admin" span={2}>
            {revision.admin_notes}
          </Descriptions.Item>
        )}
        {revision.processed_by && (
          <>
            <Descriptions.Item label="Diproses Oleh">
              {revision.admin?.username || revision.processed_by}
            </Descriptions.Item>
            <Descriptions.Item label="Waktu Proses">
              {revision.processed_at
                ? dayjs(revision.processed_at).format("DD/MM/YYYY HH:mm")
                : "-"}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Lampiran Bukti" span={2}>
          {revision.attachment_url ? (
            <a
              href={revision.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Group spacing={4}>
                {revision.attachment_type === "file" ? (
                  <>
                    <IconFile size={14} />
                    <span>{revision.attachment_name || "Lihat File"}</span>
                  </>
                ) : (
                  <>
                    <IconExternalLink size={14} />
                    <span>Buka Link</span>
                  </>
                )}
              </Group>
            </a>
          ) : (
            <Text c="dimmed" size="sm">
              Tidak ada lampiran
            </Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

// Update Status Modal
const UpdateStatusModal = ({ revision, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isLoading } = useMutation(
    (data) => updateDocumentRevisionStatus(revision?.id, data),
    {
      onSuccess: () => {
        message.success("Status berhasil diperbarui");
        queryClient.invalidateQueries(["admin-document-revisions"]);
        form.resetFields();
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        const msg =
          error?.response?.data?.message || "Gagal memperbarui status";
        message.error(msg);
      },
    }
  );

  const handleSubmit = (values) => {
    updateStatus(values);
  };

  return (
    <Modal
      title="Update Status Pengajuan"
      open={open}
      onCancel={onClose}
      footer={null}
      width={450}
    >
      <Box mb="md">
        <Text size="sm" c="dimmed">
          NIP: <strong>{revision?.nip}</strong>
        </Text>
      </Box>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: revision?.status,
          admin_notes: revision?.admin_notes || "",
        }}
      >
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Pilih status" }]}
        >
          <Select>
            <Select.Option value="pending">Menunggu</Select.Option>
            <Select.Option value="in_progress">Diproses</Select.Option>
            <Select.Option value="completed">Selesai</Select.Option>
            <Select.Option value="rejected">Ditolak</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="admin_notes" label="Catatan Admin">
          <TextArea
            rows={4}
            placeholder="Tambahkan catatan untuk user..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Simpan
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function DocumentRevisionAdmin() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: "all",
    document_type: "",
    revision_type: "",
    tmt: "",
    search: "",
    nama: "",
    page: 1,
    limit: 10,
  });
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [updateModal, setUpdateModal] = useState({ open: false, data: null });
  const [exporting, setExporting] = useState(false);

  // Fetch references
  const { data: references } = useQuery(
    ["document-revision-references"],
    () => getDocumentRevisionReferences(),
    { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 30 }
  );

  // Fetch revisions
  const { data, isLoading, refetch } = useQuery(
    ["admin-document-revisions", filters],
    () => getAllDocumentRevisions(filters),
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  const getDocTypeName = (code) => {
    return (
      references?.document_types?.find((d) => d.code === code)?.name || code
    );
  };

  const getDocTypeFullName = (code) => {
    return (
      references?.document_types?.find((d) => d.code === code)?.fullName || code
    );
  };

  const getRevisionTypeName = (code) => {
    return (
      references?.revision_types?.find((r) => r.value === code)?.label || code
    );
  };

  const getTmtLabel = (value) => {
    return references?.tmt_list?.find((t) => t.value === value)?.label || value;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Menunggu",
      in_progress: "Diproses",
      completed: "Selesai",
      rejected: "Ditolak",
    };
    return labels[status] || status;
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      message.loading({ content: "Mengunduh data...", key: "export" });

      // Fetch all data dengan limit = -1
      const exportFilters = { ...filters, limit: -1 };
      const result = await getAllDocumentRevisions(exportFilters);

      if (!result?.data?.length) {
        message.warning({
          content: "Tidak ada data untuk diexport",
          key: "export",
        });
        return;
      }

      // Transform data untuk Excel
      const excelData = result.data.map((item, index) => ({
        No: index + 1,
        NIP: item.nip,
        "Nama Pengaju": item.user?.username || "-",
        "Email Pengaju": item.user?.email || "-",
        "Jenis Dokumen": getDocTypeFullName(item.document_type),
        TMT: getTmtLabel(item.tmt),
        "Jenis Perbaikan": getRevisionTypeName(item.revision_type),
        "Detail Perbaikan": item.reason,
        Status: getStatusLabel(item.status),
        "Tanggal Pengajuan": dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        Lampiran: item.attachment_url
          ? item.attachment_type === "file"
            ? item.attachment_name || "File"
            : "Link"
          : "-",
        "URL Lampiran": item.attachment_url || "-",
        "Catatan Admin": item.admin_notes || "-",
        "Diproses Oleh": item.admin?.username || "-",
        "Tanggal Diproses": item.processed_at
          ? dayjs(item.processed_at).format("DD/MM/YYYY HH:mm")
          : "-",
      }));

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // No
        { wch: 20 }, // NIP
        { wch: 25 }, // Nama Pengaju
        { wch: 30 }, // Email Pengaju
        { wch: 35 }, // Jenis Dokumen
        { wch: 15 }, // TMT
        { wch: 20 }, // Jenis Perbaikan
        { wch: 50 }, // Detail Perbaikan
        { wch: 12 }, // Status
        { wch: 18 }, // Tanggal Pengajuan
        { wch: 15 }, // Lampiran
        { wch: 50 }, // URL Lampiran
        { wch: 40 }, // Catatan Admin
        { wch: 20 }, // Diproses Oleh
        { wch: 18 }, // Tanggal Diproses
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pengajuan Perbaikan");

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Save file
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `Pengajuan_Perbaikan_Dokumen_${dayjs().format(
        "YYYYMMDD_HHmmss"
      )}.xlsx`;
      saveAs(blob, fileName);

      message.success({
        content: `Berhasil mengunduh ${result.data.length} data`,
        key: "export",
      });
    } catch (error) {
      console.error("Export error:", error);
      message.error({ content: "Gagal mengunduh data", key: "export" });
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
      width: 150,
    },
    {
      title: "Pengaju",
      dataIndex: "user",
      key: "user",
      width: 150,
      render: (user) => user?.username || "-",
    },
    {
      title: "Dokumen",
      dataIndex: "document_type",
      key: "document_type",
      width: 80,
      render: (val) => getDocTypeName(val),
    },
    {
      title: "TMT",
      dataIndex: "tmt",
      key: "tmt",
      width: 100,
      render: (val) => getTmtLabel(val),
    },
    {
      title: "Jenis Perbaikan",
      dataIndex: "revision_type",
      key: "revision_type",
      width: 130,
      render: (val) => getRevisionTypeName(val),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: "Tanggal",
      dataIndex: "created_at",
      key: "created_at",
      width: 110,
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Lampiran",
      key: "attachment",
      width: 80,
      align: "center",
      render: (_, record) => {
        if (record.attachment_url) {
          return (
            <Tooltip
              label={
                record.attachment_type === "file"
                  ? record.attachment_name
                  : "Link Eksternal"
              }
            >
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => window.open(record.attachment_url, "_blank")}
              >
                {record.attachment_type === "file" ? (
                  <IconFile size={14} />
                ) : (
                  <IconExternalLink size={14} />
                )}
              </ActionIcon>
            </Tooltip>
          );
        }
        return (
          <Text size="xs" c="dimmed">
            -
          </Text>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip label="Lihat Detail">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => setDetailModal({ open: true, data: record })}
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Update Status">
            <ActionIcon
              variant="subtle"
              color="green"
              size="sm"
              onClick={() => setUpdateModal({ open: true, data: record })}
            >
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Lihat Pegawai">
            <ActionIcon
              variant="subtle"
              color="purple"
              size="sm"
              onClick={() => router.push(`/rekon/pegawai/${record.nip}/detail`)}
            >
              <IconUser size={14} />
            </ActionIcon>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  return (
    <Stack spacing="md">
      {/* Header */}
      <Paper p="md" radius="sm" withBorder>
        <Text fw={600} size="lg" mb="xs">
          Manajemen Pengajuan Perbaikan Dokumen
        </Text>
        <Text size="sm" c="dimmed">
          Kelola pengajuan perbaikan dokumen SK, PERTEK, SPMT, dan PK
        </Text>
      </Paper>

      {/* Status Counts */}
      <StatusCounts counts={data?.statusCounts} />

      {/* Filters */}
      <Paper p="sm" radius="sm" withBorder>
        <Group spacing="xs" position="apart">
          <Group spacing="xs">
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val, page: 1 }))
              }
              style={{ width: 140 }}
              size="small"
            >
              <Select.Option value="all">Semua Status</Select.Option>
              <Select.Option value="pending">Menunggu</Select.Option>
              <Select.Option value="in_progress">Diproses</Select.Option>
              <Select.Option value="completed">Selesai</Select.Option>
              <Select.Option value="rejected">Ditolak</Select.Option>
            </Select>

            <Select
              placeholder="Jenis Dokumen"
              value={filters.document_type || undefined}
              onChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  document_type: val || "",
                  page: 1,
                }))
              }
              style={{ width: 140 }}
              size="small"
              allowClear
            >
              {references?.document_types?.map((doc) => (
                <Select.Option key={doc.code} value={doc.code}>
                  {doc.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="TMT"
              value={filters.tmt || undefined}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, tmt: val || "", page: 1 }))
              }
              style={{ width: 140 }}
              size="small"
              allowClear
            >
              {references?.tmt_list?.map((tmt) => (
                <Select.Option key={tmt.value} value={tmt.value}>
                  {tmt.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Jenis Perbaikan"
              value={filters.revision_type || undefined}
              onChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  revision_type: val || "",
                  page: 1,
                }))
              }
              style={{ width: 160 }}
              size="small"
              allowClear
            >
              {references?.revision_types?.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>

            <Input.Search
              placeholder="Cari NIP..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onSearch={() => refetch()}
              style={{ width: 150 }}
              size="small"
              allowClear
            />

            <Input.Search
              placeholder="Cari Nama..."
              value={filters.nama}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, nama: e.target.value }))
              }
              onSearch={() => refetch()}
              style={{ width: 150 }}
              size="small"
              allowClear
            />
          </Group>

          <Button
            type="primary"
            icon={<IconDownload size={14} />}
            onClick={handleExportExcel}
            loading={exporting}
            size="small"
          >
            Export Excel
          </Button>
        </Group>
      </Paper>

      {/* Table */}
      <Paper p="sm" radius="sm" withBorder>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          size="small"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pengajuan`,
          }}
          onChange={handleTableChange}
        />
      </Paper>

      {/* Modals */}
      <DetailModal
        revision={detailModal.data}
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, data: null })}
        references={references}
      />

      <UpdateStatusModal
        revision={updateModal.data}
        open={updateModal.open}
        onClose={() => setUpdateModal({ open: false, data: null })}
      />
    </Stack>
  );
}

export default DocumentRevisionAdmin;
