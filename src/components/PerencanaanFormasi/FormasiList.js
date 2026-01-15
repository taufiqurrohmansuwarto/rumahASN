import {
  deleteFormasi,
  getFormasi,
} from "@/services/perencanaan-formasi.services";
import {
  ActionIcon,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import FormasiModal from "./FormasiModal";

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { color: "green", label: "Aktif" },
    nonaktif: { color: "default", label: "Nonaktif" },
  };
  const { color, label } = config[status] || config.nonaktif;
  return <Tag color={color}>{label}</Tag>;
};

function FormasiList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState({ open: false, data: null });
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";

  // Get filters from URL
  const {
    page = 1,
    limit = 10,
    status = "",
    tahun = "",
    search = "",
  } = router.query;

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
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Filters object for query
  const filters = {
    page: Number(page),
    limit: Number(limit),
    status,
    tahun,
    search,
  };

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
        message.error(
          error?.response?.data?.message || "Gagal menghapus formasi"
        );
      },
    }
  );

  // Stats
  const total = data?.rekap?.total || data?.meta?.total || 0;
  const aktif =
    data?.rekap?.aktif ||
    data?.data?.filter((item) => item.status === "aktif").length ||
    0;

  // Total usulan (calculated from current page data, approximation)
  const totalUsulan =
    data?.data?.reduce((acc, item) => {
      // Logic backend might not return usulan count directly here anymore
      // unless we asked for it. Assuming 0 if not present.
      return acc + (item.usulan_count || 0); 
    }, 0) || 0;

  const columns = [
    {
      title: "Judul",
      dataIndex: "deskripsi",
      key: "deskripsi",
      ellipsis: true,
      render: (val) => (
        <Text size="sm" fw={500}>
          {val || "-"}
        </Text>
      ),
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
      render: (val) => (
        <Text size="xs" c="dimmed">
          {val?.username || "-"}
        </Text>
      ),
    },
    {
      title: "Dibuat pada",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 120,
      render: (val) => (
        <Text size="xs" c="dimmed">
          {dayjs(val).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
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
              onClick={() =>
                router.push(`/perencanaan/formasi/${record.formasi_id}`)
              }
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
          {isAdmin && (
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
          )}
          {isAdmin && (
            <Popconfirm
              title="Hapus formasi?"
              description="Formasi yang memiliki usulan tidak dapat dihapus"
              onConfirm={() => hapusFormasi(record.formasi_id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Tooltip label="Hapus">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={isDeleting}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          )}
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
              <Text size="xs" c="dimmed">
                Total:
              </Text>
              <Text size="sm" fw={600}>
                {total}
              </Text>
            </Group>
            <Group gap={4}>
              <Text size="xs" c="dimmed">
                Aktif:
              </Text>
              <Text size="sm" fw={600} c="green">
                {aktif}
              </Text>
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
              <Button
                icon={<IconRefresh size={14} />}
                onClick={() => refetch()}
                size="small"
              />
            </Tooltip>
            {isAdmin && (
              <Button
                type="primary"
                icon={<IconPlus size={14} />}
                onClick={() => setModal({ open: true, data: null })}
                size="small"
              >
                Buat Formasi
              </Button>
            )}
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total}`,
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