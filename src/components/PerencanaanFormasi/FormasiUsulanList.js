import {
  createFormasiUsulan,
  deleteFormasiUsulan,
  getFormasiUsulan,
} from "@/services/perencanaan-formasi.services";
import { ActionIcon, Group, Paper, Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconFileCheck,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

// Status Badge
const StatusBadge = ({ status, isConfirmed }) => {
  const config = {
    draft: { color: "default", icon: IconEdit, label: "Draft" },
    menunggu: { color: "orange", icon: IconClock, label: "Menunggu Verifikasi" },
    disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
    ditolak: { color: "red", icon: IconX, label: "Ditolak" },
    perbaikan: { color: "blue", icon: IconEdit, label: "Perlu Perbaikan" },
  };
  const { color, icon: Icon, label } = config[status] || {
    color: "default",
    icon: IconEdit,
    label: status,
  };
  return (
    <Tag color={color}>
      <Group gap={4} wrap="nowrap">
        <Icon size={12} />
        <span>{label}</span>
        {isConfirmed && status !== "draft" && <IconFileCheck size={12} />}
      </Group>
    </Tag>
  );
};

function FormasiUsulanList({ formasiId, formasi }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const userId = session?.user?.customId;
  const queryClient = useQueryClient();

  // Filters
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
  } = router.query;

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Sync search
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateFilters = useCallback(
    (newFilters) => {
      const query = { ...router.query, ...newFilters };
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  const filters = {
    page: Number(page),
    limit: Number(limit),
    formasi_id: formasiId,
    search,
    status,
  };

  // Fetch data
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-formasi-usulan", filters],
    () => getFormasiUsulan(filters),
    { enabled: !!formasiId, keepPreviousData: true }
  );

  // Create mutation
  const { mutate: create, isLoading: isCreating } = useMutation(
    () => createFormasiUsulan({ formasi_id: formasiId }),
    {
      onSuccess: (res) => {
        message.success("Pengajuan berhasil dibuat");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
        if (res?.data?.formasi_usulan_id) {
          router.push(
            `/perencanaan/formasi/${formasiId}/${res.data.formasi_usulan_id}/usulan`
          );
        }
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Gagal membuat pengajuan");
      },
    }
  );

  // Delete mutation
  const { mutate: remove, isLoading: isDeleting } = useMutation(
    (id) => deleteFormasiUsulan(id),
    {
      onSuccess: () => {
        message.success("Pengajuan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Gagal menghapus pengajuan");
      },
    }
  );

  // Stats from data
  const stats = {
    total: data?.meta?.total || 0,
    draft: data?.rekap?.draft || 0,
    menunggu: data?.rekap?.menunggu || 0,
    disetujui: data?.rekap?.disetujui || 0,
    ditolak: data?.rekap?.ditolak || 0,
    perbaikan: data?.rekap?.perbaikan || 0,
  };

  // Columns
  const columns = [
    {
      title: "No",
      width: 50,
      render: (_, __, i) => (filters.page - 1) * filters.limit + i + 1,
    },
    {
      title: "Operator / Perangkat Daerah",
      dataIndex: "pembuat",
      key: "pembuat",
      render: (val) => (
        <Stack gap={0}>
          <Text size="sm" fw={500}>{val?.username || "-"}</Text>
          <Text size="xs" c="dimmed">{val?.perangkat_daerah_detail || val?.custom_id || "-"}</Text>
        </Stack>
      ),
    },
    {
      title: "Jumlah Usulan",
      key: "jumlah_usulan",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tag color="blue">{record.jumlah_usulan || 0} jabatan</Tag>
      ),
    },
    {
      title: "Total Alokasi",
      key: "total_alokasi",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Text size="sm" fw={600} c="blue">{record.total_alokasi || 0}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (val, record) => <StatusBadge status={val} isConfirmed={record.is_confirmed} />,
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: 100,
      render: (_, record) =>
        record.dokumen_url ? (
          <Tag color="green">Ada</Tag>
        ) : (
          <Tag color="default">Belum</Tag>
        ),
    },
    {
      title: "Update Terakhir",
      dataIndex: "diperbarui_pada",
      key: "diperbarui_pada",
      width: 140,
      render: (val) => (
        <Text size="xs" c="dimmed">
          {dayjs(val).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 90,
      align: "center",
      render: (_, record) => {
        const isOwner = record.user_id === userId;
        const canDelete = isAdmin || (isOwner && record.status === "draft");

        return (
          <Group gap={4} justify="center">
            <Tooltip title="Lihat Detail">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() =>
                  router.push(
                    `/perencanaan/formasi/${formasiId}/${record.formasi_usulan_id}/usulan`
                  )
                }
              >
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
            {canDelete && (
              <Popconfirm
                title="Hapus pengajuan?"
                description="Semua data usulan di dalamnya akan hilang."
                onConfirm={() => remove(record.formasi_usulan_id)}
                okText="Ya"
                cancelText="Batal"
              >
                <Tooltip title="Hapus">
                  <ActionIcon variant="subtle" color="red" loading={isDeleting}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Popconfirm>
            )}
          </Group>
        );
      },
    },
  ];

  return (
    <Stack gap="xs">
      {/* Stats Row */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="lg" wrap="wrap">
          <Group gap={4}>
            <Text size="xs" c="dimmed">Total:</Text>
            <Text size="sm" fw={600}>{stats.total}</Text>
          </Group>
          <Text size="xs" c="dimmed">|</Text>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Draft:</Text>
            <Text size="sm" fw={600}>{stats.draft}</Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Menunggu:</Text>
            <Text size="sm" fw={600} c="orange">{stats.menunggu}</Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Disetujui:</Text>
            <Text size="sm" fw={600} c="green">{stats.disetujui}</Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Perbaikan:</Text>
            <Text size="sm" fw={600} c="blue">{stats.perbaikan}</Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Ditolak:</Text>
            <Text size="sm" fw={600} c="red">{stats.ditolak}</Text>
          </Group>
        </Group>
      </Paper>

      {/* Filter & Action Bar */}
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Group gap="xs">
            <Input
              placeholder="Cari operator..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 180 }}
              size="small"
              allowClear
            />
            <Select
              placeholder="Status"
              value={status || undefined}
              onChange={(val) => updateFilters({ status: val || "", page: 1 })}
              style={{ width: 140 }}
              size="small"
              allowClear
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="menunggu">Menunggu</Select.Option>
              <Select.Option value="disetujui">Disetujui</Select.Option>
              <Select.Option value="perbaikan">Perbaikan</Select.Option>
              <Select.Option value="ditolak">Ditolak</Select.Option>
            </Select>
            <Tooltip title="Refresh">
              <Button
                icon={<IconRefresh size={14} />}
                onClick={() => refetch()}
                size="small"
              />
            </Tooltip>
          </Group>

          <Group gap="xs">
            {/* Non-admin can create if formasi is active */}
            {!isAdmin && formasi?.status === "aktif" && (
              <Button
                type="primary"
                icon={<IconPlus size={14} />}
                onClick={() => create()}
                loading={isCreating}
                size="small"
              >
                Buat Pengajuan Baru
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
          rowKey="formasi_usulan_id"
          loading={isLoading}
          size="small"
          pagination={{
            current: Number(page),
            pageSize: Number(limit),
            total: data?.meta?.total || 0,
            onChange: (p, l) => updateFilters({ page: p, limit: l }),
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
            showSizeChanger: true,
          }}
          scroll={{ x: 900 }}
        />
      </Paper>
    </Stack>
  );
}

export default FormasiUsulanList;
