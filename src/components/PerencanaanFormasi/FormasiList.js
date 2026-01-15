import {
  deleteFormasi,
  deleteFormasiUsulan,
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
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
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

// Pengajuan Status Badge
const PengajuanStatusBadge = ({ status }) => {
  const config = {
    draft: { color: "default", icon: IconEdit, label: "Draft" },
    menunggu: { color: "orange", icon: IconClock, label: "Menunggu" },
    disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
    ditolak: { color: "red", icon: IconX, label: "Ditolak" },
    perbaikan: { color: "blue", icon: IconEdit, label: "Perbaikan" },
  };
  const { color, icon: Icon, label } = config[status] || config.draft;
  return (
    <Tag color={color} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Icon size={12} />
      {label}
    </Tag>
  );
};

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
  const [deletingId, setDeletingId] = useState(null);
  const [deletingPengajuanId, setDeletingPengajuanId] = useState(null);
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

  // Delete formasi mutation (admin only)
  const { mutate: hapusFormasi } = useMutation(
    (id) => deleteFormasi(id),
    {
      onMutate: (id) => {
        setDeletingId(id);
      },
      onSuccess: () => {
        message.success("Formasi berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus formasi"
        );
      },
      onSettled: () => {
        setDeletingId(null);
      },
    }
  );

  // Delete pengajuan mutation (user's own)
  const { mutate: hapusPengajuan } = useMutation(
    (id) => deleteFormasiUsulan(id),
    {
      onMutate: (id) => {
        setDeletingPengajuanId(id);
      },
      onSuccess: () => {
        message.success("Pengajuan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus pengajuan"
        );
      },
      onSettled: () => {
        setDeletingPengajuanId(null);
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

  // Base columns for all users
  const baseColumns = [
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
  ];

  // Admin columns
  const adminColumns = [
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
  ];

  // Non-admin columns (show user's own pengajuan)
  const userColumns = [
    {
      title: "Pengajuan Saya",
      key: "pengajuan_saya",
      width: 200,
      render: (_, record) => {
        const pengajuan = record.pengajuan_saya;
        if (!pengajuan) {
          return <Text size="xs" c="dimmed">Belum ada pengajuan</Text>;
        }
        return (
          <Stack gap={2}>
            <PengajuanStatusBadge status={pengajuan.status} />
            <Text size="xs" c="dimmed">
              Update: {dayjs(pengajuan.diperbarui_pada).format("DD/MM/YY HH:mm")}
            </Text>
          </Stack>
        );
      },
    },
    {
      title: "Operator / Perangkat Daerah",
      key: "operator",
      width: 220,
      render: (_, record) => {
        const pengajuan = record.pengajuan_saya;
        if (!pengajuan?.pembuat) {
          return <Text size="xs" c="dimmed">-</Text>;
        }
        const pembuat = pengajuan.pembuat;
        return (
          <Group gap="xs" wrap="nowrap">
            <Avatar src={pembuat.image} size="sm" radius="xl">
              {pembuat.username?.[0]?.toUpperCase() || "?"}
            </Avatar>
            <Stack gap={0}>
              <Text size="sm" fw={500}>{pembuat.username || "-"}</Text>
              <Tooltip title={pembuat.perangkat_daerah_detail || "-"}>
                <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 150 }}>
                  {pembuat.perangkat_daerah_detail || "-"}
                </Text>
              </Tooltip>
            </Stack>
          </Group>
        );
      },
    },
  ];

  // Action column
  const actionColumn = {
    title: "Aksi",
    key: "action",
    width: isAdmin ? 130 : 100,
    align: "center",
    render: (_, record) => {
      const pengajuan = record.pengajuan_saya;
      const canDeletePengajuan = !isAdmin && pengajuan && pengajuan.status === "draft";

      return (
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
              <Tooltip label="Hapus Formasi">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={deletingId === record.formasi_id}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          )}
          {canDeletePengajuan && (
            <Popconfirm
              title="Hapus pengajuan?"
              description="Semua data usulan di dalamnya akan hilang."
              onConfirm={() => hapusPengajuan(pengajuan.formasi_usulan_id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Tooltip label="Hapus Pengajuan Saya">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={deletingPengajuanId === pengajuan.formasi_usulan_id}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          )}
        </Group>
      );
    },
  };

  // Combine columns based on role
  const columns = isAdmin
    ? [...baseColumns, ...adminColumns, actionColumn]
    : [...baseColumns, ...userColumns, actionColumn];

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