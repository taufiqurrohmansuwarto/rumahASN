import {
  cancelDocumentRevision,
  createDocumentRevision,
  getDocumentRevisionReferences,
  getMyDocumentRevisions,
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
  IconLoader,
  IconPlus,
  IconTrash,
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
  Select,
  Table,
  Tag,
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
          name="nip"
          label="NIP"
          rules={[
            { required: true, message: "NIP wajib diisi" },
            { len: 18, message: "NIP harus 18 digit" },
          ]}
        >
          <Input placeholder="Masukkan NIP (18 digit)" maxLength={18} />
        </Form.Item>

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

const RevisionList = ({ references }) => {
  const [status, setStatus] = useState("all");
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
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
      width: 150,
    },
    {
      title: "Dokumen",
      dataIndex: "document_type",
      key: "document_type",
      width: 120,
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
      title: "Catatan Admin",
      dataIndex: "admin_notes",
      key: "admin_notes",
      ellipsis: true,
      render: (val) => val || "-",
    },
    {
      title: "Aksi",
      key: "action",
      width: 60,
      render: (_, record) =>
        record.status === "pending" ? (
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
