import {
  createFormasi,
  deleteFormasi,
  getFormasi,
  updateFormasi,
} from "@/services/perencanaan-formasi.services";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCalendar,
  IconEdit,
  IconEye,
  IconFileText,
  IconPlus,
  IconRefresh,
  IconToggleLeft,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const { TextArea } = Input;

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { color: "green", label: "Aktif" },
    nonaktif: { color: "default", label: "Nonaktif" },
  };
  const { color, label } = config[status] || config.nonaktif;
  return <Tag color={color}>{label}</Tag>;
};

// Modal Form Formasi
const FormasiModal = ({ open, onClose, data, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const { mutate: submit, isLoading } = useMutation(
    (values) => (isEdit ? updateFormasi(data.formasi_id, values) : createFormasi(values)),
    {
      onSuccess: () => {
        message.success(isEdit ? "Formasi berhasil diperbarui" : "Formasi berhasil dibuat");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
        form.resetFields();
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal menyimpan formasi");
      },
    }
  );

  const handleSubmit = (values) => {
    submit(values);
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          {isEdit ? <IconEdit size={18} /> : <IconPlus size={18} />}
          <span>{isEdit ? "Edit Formasi" : "Formasi Baru"}</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      width={500}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
            {isEdit ? "Simpan" : "Buat"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          isEdit
            ? { deskripsi: data.deskripsi, tahun: data.tahun, status: data.status }
            : { tahun: new Date().getFullYear(), status: "aktif" }
        }
      >
        <Form.Item
          name="deskripsi"
          label={
            <Group gap={4}>
              <IconFileText size={14} />
              <span>Judul / Deskripsi</span>
            </Group>
          }
          rules={[{ required: true, message: "Judul wajib diisi" }]}
        >
          <TextArea rows={3} placeholder="Contoh: KPPI 2026, CPNS 2026" maxLength={500} showCount />
        </Form.Item>

        <Form.Item
          name="tahun"
          label={
            <Group gap={4}>
              <IconCalendar size={14} />
              <span>Tahun</span>
            </Group>
          }
          rules={[{ required: true, message: "Tahun wajib diisi" }]}
        >
          <InputNumber min={2020} max={2100} style={{ width: "100%" }} placeholder="2026" />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <Group gap={4}>
              <IconToggleLeft size={14} />
              <span>Status</span>
            </Group>
          }
        >
          <Select>
            <Select.Option value="aktif">Aktif</Select.Option>
            <Select.Option value="nonaktif">Nonaktif</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function FormasiList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState({ open: false, data: null });

  // Get filters from URL
  const { page = 1, limit = 10, status = "", tahun = "", search = "" } = router.query;

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  // Sync URL search to local state on mount
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL params
  const updateFilters = useCallback(
    (newFilters) => {
      const query = { ...router.query, ...newFilters };
      // Remove empty values
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  // Filters object for query
  const filters = { page: Number(page), limit: Number(limit), status, tahun, search };

  // Fetch data
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-formasi", filters],
    () => getFormasi(filters),
    { keepPreviousData: true }
  );

  // Delete mutation
  const { mutate: hapusFormasi, isLoading: isDeleting } = useMutation(
    (id) => deleteFormasi(id),
    {
      onSuccess: () => {
        message.success("Formasi berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal menghapus formasi");
      },
    }
  );

  // Stats - Gunakan rekap dari backend jika ada, jika tidak hitung dari data
  const total = data?.rekap?.total || data?.meta?.total || 0;
  const aktif = data?.rekap?.aktif || data?.data?.filter((item) => item.status === "aktif").length || 0;
  
  // Total usulan - hitung dari semua formasi di halaman saat ini
  // Usulan sudah di-fetch dengan withGraphFetched di controller
  const totalUsulan = data?.data?.reduce((acc, item) => {
    if (Array.isArray(item.usulan)) {
      return acc + item.usulan.length;
    }
    return acc;
  }, 0) || 0;

  const columns = [
    {
      title: "Judul",
      dataIndex: "deskripsi",
      key: "deskripsi",
      ellipsis: true,
      render: (val) => <Text size="sm" fw={500}>{val || "-"}</Text>,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      width: 80,
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: "Dibuat oleh",
      dataIndex: "dibuatOleh",
      key: "dibuatOleh",
      width: 130,
      render: (val) => <Text size="xs" c="dimmed">{val?.username || "-"}</Text>,
    },
    {
      title: "Dibuat pada",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 120,
      render: (val) => <Text size="xs" c="dimmed">{dayjs(val).format("DD/MM/YYYY HH:mm")}</Text>,
    },
    {
      title: "Usulan",
      dataIndex: "usulan",
      key: "usulan",
      width: 70,
      align: "center",
      render: (val) => <Tag>{val?.length || 0}</Tag>,
    },
    {
      title: "Aksi",
      key: "action",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Group gap={4} justify="center">
          <Tooltip label="Detail">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => router.push(`/perencanaan/formasi/${record.formasi_id}/usulan`)}
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              color="green"
              size="sm"
              onClick={() => setModal({ open: true, data: record })}
            >
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Popconfirm
            title="Hapus formasi?"
            description="Formasi yang memiliki usulan tidak dapat dihapus"
            onConfirm={() => hapusFormasi(record.formasi_id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Tooltip label="Hapus">
              <ActionIcon variant="subtle" color="red" size="sm" loading={isDeleting}>
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Popconfirm>
        </Group>
      ),
    },
  ];

  return (
    <Stack gap="xs">
      {/* Header + Stats + Filter (1 row) */}
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          {/* Stats inline */}
          <Group gap="md">
            <Group gap={4}>
              <Text size="xs" c="dimmed">Total:</Text>
              <Text size="sm" fw={600}>{total}</Text>
            </Group>
            <Group gap={4}>
              <Text size="xs" c="dimmed">Aktif:</Text>
              <Text size="sm" fw={600} c="green">{aktif}</Text>
            </Group>
            <Group gap={4}>
              <Text size="xs" c="dimmed">Usulan:</Text>
              <Text size="sm" fw={600} c="blue">{totalUsulan}</Text>
            </Group>
          </Group>

          {/* Filter & Actions */}
          <Group gap="xs">
            <Input
              placeholder="Cari judul..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 160 }}
              size="small"
              allowClear
            />
            <InputNumber
              placeholder="Tahun"
              value={tahun || undefined}
              onChange={(val) => updateFilters({ tahun: val || "", page: 1 })}
              style={{ width: 90 }}
              size="small"
              min={2020}
              max={2100}
            />
            <Select
              placeholder="Status"
              value={status || undefined}
              onChange={(val) => updateFilters({ status: val || "", page: 1 })}
              style={{ width: 100 }}
              size="small"
              allowClear
            >
              <Select.Option value="aktif">Aktif</Select.Option>
              <Select.Option value="nonaktif">Nonaktif</Select.Option>
            </Select>
            <Tooltip label="Refresh">
              <Button icon={<IconRefresh size={14} />} onClick={() => refetch()} size="small" />
            </Tooltip>
            <Button
              type="primary"
              icon={<IconPlus size={14} />}
              onClick={() => setModal({ open: true, data: null })}
              size="small"
            >
              Buat Formasi
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Table */}
      <Paper p="xs" radius="sm" withBorder>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="formasi_id"
          size="small"
          loading={isLoading}
          pagination={{
            current: Number(page),
            pageSize: Number(limit),
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
            onChange: (p, l) => updateFilters({ page: p, limit: l }),
          }}
          scroll={{ x: 800 }}
        />
      </Paper>

      {/* Modal */}
      <FormasiModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        data={modal.data}
      />
    </Stack>
  );
}

export default FormasiList;
