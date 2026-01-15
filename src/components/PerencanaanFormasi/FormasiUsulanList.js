import {
  createFormasiUsulan,
  deleteFormasiUsulan,
  getFormasiUsulan,
  getUsulan,
} from "@/services/perencanaan-formasi.services";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { ActionIcon, Group, Paper, Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCheck,
  IconClock,
  IconDownload,
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
  Avatar,
  Button,
  Input,
  message,
  Modal,
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

const { confirm } = Modal;

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
  const userId = session?.user?.id; // custom_id from session
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

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
  const { mutate: remove } = useMutation(
    (id) => deleteFormasiUsulan(id),
    {
      onMutate: (id) => {
        setDeletingId(id);
      },
      onSuccess: () => {
        message.success("Pengajuan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Gagal menghapus pengajuan");
      },
      onSettled: () => {
        setDeletingId(null);
      },
    }
  );

  // Confirmation modal before creating
  const handleCreateNew = () => {
    confirm({
      title: "Buat Pengajuan Baru?",
      content: (
        <Stack gap="xs">
          <Text size="sm">
            Anda akan membuat pengajuan usulan formasi baru untuk periode:
          </Text>
          <Paper p="xs" radius="sm" bg="blue.0" withBorder>
            <Text size="sm" fw={600} c="blue.7">
              {formasi?.deskripsi || "Formasi"} - Tahun {formasi?.tahun || "-"}
            </Text>
          </Paper>
          <Text size="xs" c="dimmed">
            Setelah dibuat, Anda dapat menambahkan daftar jabatan yang diusulkan
            dan mengunggah dokumen pendukung.
          </Text>
        </Stack>
      ),
      okText: "Ya, Buat Pengajuan",
      cancelText: "Batal",
      onOk: () => create(),
      centered: true,
    });
  };

  // Stats from data
  const stats = {
    total: data?.meta?.total || 0,
    draft: data?.rekap?.draft || 0,
    menunggu: data?.rekap?.menunggu || 0,
    disetujui: data?.rekap?.disetujui || 0,
    ditolak: data?.rekap?.ditolak || 0,
    perbaikan: data?.rekap?.perbaikan || 0,
  };

  // Download all usulan for admin
  const [downloading, setDownloading] = useState(false);

  const handleDownloadAll = async () => {
    try {
      setDownloading(true);
      message.loading({ content: "Mengunduh semua data usulan...", key: "download-all" });

      // Fetch all usulan for this formasi (across all submissions)
      const allUsulan = await getUsulan({
        formasi_id: formasiId,
        limit: -1,
      });

      if (!allUsulan?.data?.length) {
        message.warning({ content: "Tidak ada data usulan untuk diunduh", key: "download-all" });
        return;
      }

      // Transform data for Excel with specified columns
      const excelData = allUsulan.data.map((item, index) => {
        const formasiUsulan = item.formasiUsulan || {};
        const pembuat = formasiUsulan.pembuat || {};
        const formasi = formasiUsulan.formasi || {};
        
        return {
          "No": index + 1,
          "Nama Pengusul": pembuat?.username || "-",
          "Perangkat Daerah": pembuat?.perangkat_daerah_detail || "-",
          "Formasi": formasi?.deskripsi || formasi?.nama || "-",
          "Jenis Jabatan": item.jenis_jabatan || "-",
          "Nama Jabatan": item.nama_jabatan || item.jabatan_id || "-",
          "Kualifikasi Pendidikan": item.kualifikasi_pendidikan_detail
            ?.map((p) => `${p.tk_pend} - ${p.label}`)
            .join("; ") || "-",
          "Unit Kerja": item.unit_kerja_text || item.unit_kerja || "-",
          "Alokasi": item.alokasi || 0,
          "Status Usulan Formasi": formasiUsulan.status || "-",
          "Tanggal Usulan Dibuat": item.dibuat_pada
            ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm")
            : "-",
          "Tanggal Verifikasi": formasiUsulan.diverifikasi_pada
            ? dayjs(formasiUsulan.diverifikasi_pada).format("DD/MM/YYYY HH:mm")
            : "-",
          "Nama Verifikator": formasiUsulan.korektor?.username || "-",
        };
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Semua Usulan");

      // Auto-width columns
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(key.length + 5, 15),
      }));
      ws["!cols"] = colWidths;

      // Generate buffer and save
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Semua_Usulan_${formasi?.deskripsi || "Formasi"}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
      saveAs(blob, fileName);
      message.success({ content: "Data berhasil diunduh", key: "download-all" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal mengunduh data", key: "download-all" });
    } finally {
      setDownloading(false);
    }
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
        <Group gap="xs" wrap="nowrap">
          <Avatar src={val?.image} size="sm" radius="xl">
            {val?.username?.[0]?.toUpperCase() || "?"}
          </Avatar>
          <Stack gap={0}>
            <Text size="sm" fw={500}>{val?.username || "-"}</Text>
            <Tooltip title={val?.perangkat_daerah_detail || "-"}>
              <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 200 }}>
                {val?.perangkat_daerah_detail || val?.custom_id || "-"}
              </Text>
            </Tooltip>
          </Stack>
        </Group>
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
                  <ActionIcon variant="subtle" color="red" loading={deletingId === record.formasi_usulan_id}>
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
            {/* Admin: Download all usulan */}
            {isAdmin && (
              <Tooltip title="Unduh semua data usulan beserta jabatan">
                <Button
                  icon={<IconDownload size={14} />}
                  onClick={handleDownloadAll}
                  loading={downloading}
                  size="small"
                >
                  Unduh Semua
                </Button>
              </Tooltip>
            )}
            {/* Non-admin can create if formasi is active */}
            {!isAdmin && formasi?.status === "aktif" && (
              <Button
                type="primary"
                icon={<IconPlus size={14} />}
                onClick={handleCreateNew}
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
