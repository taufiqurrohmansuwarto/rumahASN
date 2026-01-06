import {
  cancelDocumentRevision,
  createDocumentRevision,
  deleteAttachment,
  getDocumentRevisionReferences,
  getMyDocumentRevisions,
  uploadAttachmentFile,
  uploadAttachmentLink,
} from "@/services/document-revisions.services";
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
  IconExternalLink,
  IconFile,
  IconLink,
  IconLoader,
  IconPaperclip,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

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

const RevisionFormModal = ({ open, onClose, references, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: submitRevision, isLoading } = useMutation(
    (data) => createDocumentRevision(data),
    {
      onSuccess: () => {
        message.success("Pengajuan perbaikan berhasil dibuat");
        form.resetFields();
        queryClient.invalidateQueries(["my-document-revisions"]);
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal membuat pengajuan";
        message.error(msg);
      },
    }
  );

  const handleSubmit = (values) => {
    submitRevision(values);
  };

  return (
    <Modal
      title="Ajukan Perbaikan Dokumen"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="document_type"
          label="Jenis Dokumen"
          rules={[{ required: true, message: "Pilih jenis dokumen" }]}
        >
          <Select placeholder="Pilih jenis dokumen">
            {references?.document_types?.map((doc) => (
              <Select.Option key={doc.code} value={doc.code}>
                {doc.fullName} ({doc.name})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tmt"
          label="TMT"
          rules={[{ required: true, message: "Pilih TMT" }]}
        >
          <Select placeholder="Pilih TMT">
            {references?.tmt_list?.map((tmt) => (
              <Select.Option key={tmt.value} value={tmt.value}>
                {tmt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="revision_type"
          label="Jenis Perbaikan"
          rules={[{ required: true, message: "Pilih jenis perbaikan" }]}
        >
          <Select placeholder="Pilih jenis perbaikan">
            {references?.revision_types?.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="Detail Perbaikan"
          rules={[
            { required: true, message: "Detail perbaikan wajib diisi" },
            { min: 10, message: "Minimal 10 karakter" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Jelaskan detail perbaikan yang diperlukan..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Ajukan Perbaikan
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal untuk upload attachment
const AttachmentModal = ({ revision, open, onClose }) => {
  const [attachmentType, setAttachmentType] = useState("file");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: uploadFile, isLoading: isUploading } = useMutation(
    ({ id, file }) => uploadAttachmentFile(id, file),
    {
      onSuccess: () => {
        message.success("Lampiran berhasil diunggah");
        queryClient.invalidateQueries(["my-document-revisions"]);
        handleClose();
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal mengunggah lampiran";
        message.error(msg);
      },
    }
  );

  const { mutate: uploadLink, isLoading: isLinking } = useMutation(
    ({ id, url }) => uploadAttachmentLink(id, url),
    {
      onSuccess: () => {
        message.success("Link berhasil ditambahkan");
        queryClient.invalidateQueries(["my-document-revisions"]);
        handleClose();
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal menambahkan link";
        message.error(msg);
      },
    }
  );

  const { mutate: removeAttachment, isLoading: isDeleting } = useMutation(
    (id) => deleteAttachment(id),
    {
      onSuccess: () => {
        message.success("Lampiran berhasil dihapus");
        queryClient.invalidateQueries(["my-document-revisions"]);
        handleClose();
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal menghapus lampiran";
        message.error(msg);
      },
    }
  );

  const handleClose = () => {
    setAttachmentType("file");
    setLinkUrl("");
    setFile(null);
    onClose();
  };

  const handleSubmit = () => {
    if (attachmentType === "file") {
      if (!file) {
        message.warning("Pilih file terlebih dahulu");
        return;
      }
      uploadFile({ id: revision.id, file });
    } else {
      if (!linkUrl) {
        message.warning("Masukkan URL link");
        return;
      }
      // Validasi URL sederhana
      try {
        new URL(linkUrl);
      } catch {
        message.warning("URL tidak valid");
        return;
      }
      uploadLink({ id: revision.id, url: linkUrl });
    }
  };

  const hasAttachment = revision?.attachment_url;
  const isLoading = isUploading || isLinking || isDeleting;

  return (
    <Modal
      title="Lampiran Bukti"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={450}
    >
      {hasAttachment ? (
        <Stack spacing="md">
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Lampiran Saat Ini:
            </Text>
            {revision.attachment_type === "file" ? (
              <Group spacing="xs">
                <IconFile size={16} />
                <a
                  href={revision.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {revision.attachment_name || "Lihat File"}
                </a>
              </Group>
            ) : (
              <Group spacing="xs">
                <IconLink size={16} />
                <a
                  href={revision.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {revision.attachment_url}
                </a>
              </Group>
            )}
          </Box>
          <Popconfirm
            title="Hapus lampiran?"
            description="Lampiran akan dihapus permanen"
            onConfirm={() => removeAttachment(revision.id)}
            okText="Ya, Hapus"
            cancelText="Tidak"
          >
            <Button danger icon={<IconTrash size={14} />} loading={isDeleting}>
              Hapus Lampiran
            </Button>
          </Popconfirm>
        </Stack>
      ) : (
        <Stack spacing="md">
          <Radio.Group
            value={attachmentType}
            onChange={(e) => setAttachmentType(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value="file">Unggah File</Radio>
              <Radio value="link">Tambahkan Link</Radio>
            </Space>
          </Radio.Group>

          {attachmentType === "file" ? (
            <Upload.Dragger
              maxCount={1}
              beforeUpload={(f) => {
                // Validasi tipe file
                const allowedTypes = [
                  "image/jpeg",
                  "image/png",
                  "image/gif",
                  "application/pdf",
                ];
                if (!allowedTypes.includes(f.type)) {
                  message.error("Tipe file tidak diizinkan (JPG, PNG, GIF, PDF)");
                  return Upload.LIST_IGNORE;
                }
                // Validasi ukuran (5MB)
                if (f.size > 5 * 1024 * 1024) {
                  message.error("Ukuran file maksimal 5MB");
                  return Upload.LIST_IGNORE;
                }
                setFile(f);
                return false;
              }}
              onRemove={() => setFile(null)}
              fileList={file ? [file] : []}
            >
              <p className="ant-upload-drag-icon">
                <IconUpload size={32} />
              </p>
              <p className="ant-upload-text">
                Klik atau seret file ke area ini
              </p>
              <p className="ant-upload-hint">
                Format: JPG, PNG, GIF, PDF. Maksimal 5MB
              </p>
            </Upload.Dragger>
          ) : (
            <Input
              placeholder="https://drive.google.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              prefix={<IconLink size={14} />}
            />
          )}

          <Group justify="flex-end" spacing="xs">
            <Button onClick={handleClose}>Batal</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isLoading}
              icon={<IconUpload size={14} />}
            >
              {attachmentType === "file" ? "Unggah" : "Simpan Link"}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

const RevisionList = ({ references }) => {
  const [status, setStatus] = useState("all");
  const [attachmentModal, setAttachmentModal] = useState({
    open: false,
    data: null,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["my-document-revisions", status],
    () => getMyDocumentRevisions({ status, limit: 50 }),
    { refetchOnWindowFocus: false }
  );

  const { mutate: cancelRevision, isLoading: isCanceling } = useMutation(
    (id) => cancelDocumentRevision(id),
    {
      onSuccess: () => {
        message.success("Pengajuan berhasil dibatalkan");
        queryClient.invalidateQueries(["my-document-revisions"]);
      },
      onError: (error) => {
        const msg =
          error?.response?.data?.message || "Gagal membatalkan pengajuan";
        message.error(msg);
      },
    }
  );

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

  const columns = [
    {
      title: "Dokumen",
      dataIndex: "document_type",
      key: "document_type",
      width: 150,
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
      width: 140,
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
      width: 120,
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
                  : "Link"
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
        if (record.status === "pending") {
          return (
            <Tooltip label="Tambah Lampiran">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() =>
                  setAttachmentModal({ open: true, data: record })
                }
              >
                <IconPaperclip size={14} />
              </ActionIcon>
            </Tooltip>
          );
        }
        return <Text size="xs" c="dimmed">-</Text>;
      },
    },
    {
      title: "Catatan Admin",
      dataIndex: "admin_notes",
      key: "admin_notes",
      ellipsis: true,
      render: (val) => val || "-",
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) =>
        record.status === "pending" ? (
          <Space size={4}>
            <Tooltip label={record.attachment_url ? "Edit Lampiran" : "Tambah Lampiran"}>
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => setAttachmentModal({ open: true, data: record })}
              >
                <IconPaperclip size={14} />
              </ActionIcon>
            </Tooltip>
            <Popconfirm
              title="Batalkan pengajuan?"
              description="Pengajuan yang dibatalkan tidak dapat dikembalikan"
              onConfirm={() => cancelRevision(record.id)}
              okText="Ya, Batalkan"
              cancelText="Tidak"
            >
              <Tooltip label="Batalkan">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={isCanceling}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  return (
    <Stack spacing="xs">
      <Group spacing="xs">
        <Select
          value={status}
          onChange={setStatus}
          style={{ width: 150 }}
          size="small"
        >
          <Select.Option value="all">Semua Status</Select.Option>
          <Select.Option value="pending">Menunggu</Select.Option>
          <Select.Option value="in_progress">Diproses</Select.Option>
          <Select.Option value="completed">Selesai</Select.Option>
          <Select.Option value="rejected">Ditolak</Select.Option>
        </Select>
      </Group>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        size="small"
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada pengajuan perbaikan"
            />
          ),
        }}
      />

      {/* Modal Attachment */}
      <AttachmentModal
        revision={attachmentModal.data}
        open={attachmentModal.open}
        onClose={() => setAttachmentModal({ open: false, data: null })}
      />
    </Stack>
  );
};

function DocumentRevisionRequest() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: references, isLoading: loadingRefs } = useQuery(
    ["document-revision-references"],
    () => getDocumentRevisionReferences(),
    { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 30 }
  );

  return (
    <Stack spacing="xs">
      {/* Header */}
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} size="sm">
              Pengajuan Perbaikan Dokumen
            </Text>
            <Text size="xs" c="dimmed">
              Ajukan perbaikan untuk SK, PERTEK, SPMT, atau PK
            </Text>
          </Box>
          <Button
            type="primary"
            icon={<IconPlus size={14} />}
            onClick={() => setModalOpen(true)}
            size="small"
            loading={loadingRefs}
          >
            Ajukan Perbaikan
          </Button>
        </Group>
      </Paper>

      {/* List */}
      <Paper p="xs" radius="sm" withBorder>
        <RevisionList references={references} />
      </Paper>

      {/* Modal Form */}
      <RevisionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        references={references}
      />
    </Stack>
  );
}

export default DocumentRevisionRequest;
