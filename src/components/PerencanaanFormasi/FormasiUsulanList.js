import {
  createFormasiUsulan,
  deleteFormasiUsulan,
  getFormasiUsulan,
  getUsulan,
} from "@/services/perencanaan-formasi.services";
import { getOpdFasilitator } from "@/services/master.services";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { ActionIcon, Group, Paper, Stack, Text } from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import {
  IconDownload,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
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
  TreeSelect,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const { confirm } = Modal;

// Status Badge - Compact version
const StatusBadge = ({ status, isConfirmed }) => {
  const config = {
    draft: { color: "default", label: "Draft" },
    menunggu: { color: "orange", label: "Menunggu" },
    disetujui: { color: "green", label: "Disetujui" },
    ditolak: { color: "red", label: "Ditolak" },
    perbaikan: { color: "blue", label: "Perbaikan" },
  };
  const { color, label } = config[status] || { color: "default", label: status };
  return (
    <Tag color={color} style={{ margin: 0 }}>
      {label}
      {isConfirmed && status !== "draft" && " ✓"}
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

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 992px)");

  // Filters
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    "organization-id": organizationId = "",
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

  // Fetch Unit Kerja (OPD) - Tree data for filter
  const { data: opdTree, isLoading: loadingOpd } = useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: getOpdFasilitator,
    staleTime: 1000 * 60 * 10,
  });

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
    organization_id: organizationId,
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

      // Helper function to sort pendidikan by level
      const sortPendidikan = (pendidikanList) => {
        if (!pendidikanList || !Array.isArray(pendidikanList)) return [];
        const levelOrder = ["S3", "S2", "S1", "D-IV", "DIV", "D-III", "DIII", "D-II", "DII", "D-I", "DI", "SMA", "SMK", "SLTA", "SMP", "SLTP", "SD"];
        return [...pendidikanList].sort((a, b) => {
          const levelA = levelOrder.findIndex(l => a.tk_pend?.toUpperCase()?.includes(l)) ?? 999;
          const levelB = levelOrder.findIndex(l => b.tk_pend?.toUpperCase()?.includes(l)) ?? 999;
          return levelA - levelB;
        });
      };

      // Create workbook
      const wb = new ExcelJS.Workbook();
      wb.creator = "Rumah ASN";
      wb.created = new Date();

      const ws = wb.addWorksheet("Semua Usulan");

      // Define columns (narrower widths)
      ws.columns = [
        { key: "no", width: 5 },
        { key: "pengusul", width: 20 },
        { key: "perangkat_daerah", width: 25 },
        { key: "jenis_jabatan", width: 12 },
        { key: "nama_jabatan", width: 30 },
        { key: "kualifikasi", width: 25 },
        { key: "unit_kerja", width: 35 },
        { key: "alokasi", width: 8 },
        { key: "status", width: 12 },
        { key: "tgl_dibuat", width: 15 },
        { key: "verifikator", width: 18 },
        { key: "tgl_verifikasi", width: 15 },
      ];

      // Add title rows
      ws.mergeCells("A1:L1");
      const titleCell = ws.getCell("A1");
      titleCell.value = `REKAP SEMUA USULAN KEBUTUHAN FORMASI`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 25;

      ws.mergeCells("A2:L2");
      const subtitleCell = ws.getCell("A2");
      subtitleCell.value = `${formasi?.deskripsi || "Formasi"} | Dicetak: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
      subtitleCell.font = { size: 10, italic: true };
      subtitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // Add empty row
      ws.addRow([]);

      // Add header row (row 4)
      const headerRow = ws.addRow([
        "NO", "PENGUSUL", "PERANGKAT DAERAH", "JENIS", "NAMA JABATAN",
        "KUALIFIKASI", "UNIT KERJA", "ALOKASI", "STATUS", "TGL DIBUAT", "VERIFIKATOR", "TGL VERIFIKASI"
      ]);
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E88E5" },
        };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 9,
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Status color mapping
      const statusColors = {
        draft: { bg: "FFE0E0E0", font: "FF666666" },      // Gray
        menunggu: { bg: "FFFFF3E0", font: "FFE65100" },   // Orange
        disetujui: { bg: "FFE8F5E9", font: "FF2E7D32" },  // Green
        ditolak: { bg: "FFFFEBEE", font: "FFC62828" },    // Red
        perbaikan: { bg: "FFE3F2FD", font: "FF1565C0" },  // Blue
      };

      // Add data rows
      allUsulan.data.forEach((item, index) => {
        const formasiUsulan = item.formasiUsulan || {};
        const pembuat = formasiUsulan.pembuat || {};
        const perangkatDaerah = pembuat?.unor?.name || pembuat?.perangkat_daerah_detail || "-";
        const status = formasiUsulan.status || "-";
        const jenisJabatan = item.jenis_jabatan ? item.jenis_jabatan.toUpperCase() : "-";

        // Sort and format kualifikasi pendidikan (vertical with newlines)
        const sortedPendidikan = sortPendidikan(item.kualifikasi_pendidikan_detail);
        const kualifikasiText = sortedPendidikan.length > 0
          ? sortedPendidikan.map((p) => `${p.tk_pend} - ${p.label}`).join("\n")
          : "-";

        const row = ws.addRow({
          no: index + 1,
          pengusul: pembuat?.username || "-",
          perangkat_daerah: perangkatDaerah,
          jenis_jabatan: jenisJabatan,
          nama_jabatan: item.nama_jabatan || item.jabatan_id || "-",
          kualifikasi: kualifikasiText,
          unit_kerja: item.unit_kerja_text || item.unit_kerja || "-",
          alokasi: item.alokasi || 0,
          status: status.toUpperCase(),
          tgl_dibuat: item.dibuat_pada ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm") : "-",
          verifikator: formasiUsulan.korektor?.username || "-",
          tgl_verifikasi: formasiUsulan.corrected_at ? dayjs(formasiUsulan.corrected_at).format("DD/MM/YYYY HH:mm") : "-",
        });

        // Style data rows
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            wrapText: colNumber >= 5 && colNumber <= 7, // Wrap for Nama Jabatan, Kualifikasi, Unit Kerja
          };
          cell.font = { size: 9 };

          // Status column (column 9) - special coloring
          if (colNumber === 9 && statusColors[status]) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: statusColors[status].bg },
            };
            cell.font = {
              bold: true,
              size: 9,
              color: { argb: statusColors[status].font },
            };
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
          } else if (index % 2 === 1) {
            // Alternate row colors for other cells
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF5F5F5" },
            };
          }
        });
      });

      // Add total row
      const totalAlokasi = allUsulan.data.reduce((sum, item) => sum + (item.alokasi || 0), 0);
      const totalRow = ws.addRow(["", "", "", "", "", "", "TOTAL", totalAlokasi, "", "", "", ""]);
      totalRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = { bold: true, size: 9 };
        if (colNumber === 7) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        if (colNumber === 8) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF9C4" }, // Yellow
          };
        }
      });

      // Generate buffer and save
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
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
      width: 40,
      align: "center",
      render: (_, __, i) => (filters.page - 1) * filters.limit + i + 1,
    },
    {
      title: "Operator",
      dataIndex: "pembuat",
      key: "pembuat",
      width: 250,
      render: (val) => {
        const perangkatDaerah = val?.unor?.name || val?.perangkat_daerah_detail || "-";
        return (
          <Group gap={8} wrap="nowrap" align="flex-start">
            <Avatar src={val?.image} size={28}>
              {val?.username?.[0]?.toUpperCase() || "?"}
            </Avatar>
            <div>
              <Text size="xs" fw={500} lh={1.2}>{val?.username || "-"}</Text>
              <Text size="xs" c="dimmed" lh={1.2}>{perangkatDaerah}</Text>
            </div>
          </Group>
        );
      },
    },
    {
      title: "Usulan",
      key: "jumlah_usulan",
      width: 80,
      align: "center",
      render: (_, record) => {
        const current = record.jumlah_usulan || 0;
        const snapshot = record.jumlah_usulan_snapshot;
        const hasSnapshot = record.is_confirmed && snapshot !== undefined;
        const changed = hasSnapshot && current !== snapshot;

        return (
          <Tooltip title={hasSnapshot ? `Dikirim: ${snapshot} → Sekarang: ${current}` : `${current} jabatan`}>
            <Text size="xs" fw={500} c={changed ? "orange" : undefined}>
              {current}{hasSnapshot && changed && ` (${snapshot})`}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Alokasi",
      key: "total_alokasi",
      width: 80,
      align: "center",
      render: (_, record) => {
        const current = record.total_alokasi || 0;
        const snapshot = record.total_alokasi_snapshot;
        const hasSnapshot = record.is_confirmed && snapshot !== undefined;
        const changed = hasSnapshot && current !== snapshot;

        return (
          <Tooltip title={hasSnapshot ? `Dikirim: ${snapshot} → Sekarang: ${current}` : `Total: ${current}`}>
            <Text size="xs" fw={600} c={changed ? "orange" : "blue"}>
              {current}{hasSnapshot && changed && ` (${snapshot})`}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      align: "center",
      render: (val, record) => <StatusBadge status={val} isConfirmed={record.is_confirmed} />,
    },
    {
      title: "Dok",
      key: "dokumen",
      width: 50,
      align: "center",
      render: (_, record) => (
        <Tooltip title={record.dokumen_url ? record.dokumen_name || "Ada dokumen" : "Belum ada dokumen"}>
          <Text size="xs" c={record.dokumen_url ? "green" : "dimmed"}>
            {record.dokumen_url ? "✓" : "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Verifikasi",
      key: "verifikasi",
      width: 180,
      render: (_, record) => {
        if (!record.corrected_at && !record.korektor) {
          return <Text size="xs" c="dimmed">-</Text>;
        }
        return (
          <Tooltip title={`${record.korektor?.username || "-"}\n${record.corrected_at ? dayjs(record.corrected_at).format("DD/MM/YYYY HH:mm") : "-"}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar src={record.korektor?.image} size={28} style={{ flexShrink: 0 }}>
                {record.korektor?.username?.[0]?.toUpperCase() || "?"}
              </Avatar>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Text size="xs" fw={500} lh={1.2} lineClamp={1}>{record.korektor?.username || "-"}</Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {record.corrected_at ? dayjs(record.corrected_at).format("DD/MM/YY HH:mm") : "-"}
                </Text>
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 70,
      align: "center",
      render: (_, record) => {
        const isOwner = record.user_id === userId;
        const canDelete = isAdmin || (isOwner && record.status === "draft");

        return (
          <Group gap={4} justify="center">
            <Tooltip title="Detail">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() =>
                  router.push(
                    `/perencanaan/formasi/${formasiId}/${record.formasi_usulan_id}/usulan`
                  )
                }
              >
                <IconEye size={14} />
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
                  <ActionIcon variant="subtle" color="red" size="sm" loading={deletingId === record.formasi_usulan_id}>
                    <IconTrash size={14} />
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
        <Group gap={isMobile ? "xs" : "lg"} wrap="wrap">
          <Group gap={4}>
            <Text size="xs" c="dimmed">Total:</Text>
            <Text size="sm" fw={600}>{stats.total}</Text>
          </Group>
          {!isMobile && <Text size="xs" c="dimmed">|</Text>}
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
        <Stack gap="xs">
          {/* Filter Row */}
          <Group gap="xs" wrap="wrap">
            <Input
              placeholder="Cari operator..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: isMobile ? "100%" : 180, flex: isMobile ? 1 : undefined }}
              size="small"
              allowClear
            />
            <Select
              placeholder="Status"
              value={status || undefined}
              onChange={(val) => updateFilters({ status: val || "", page: 1 })}
              style={{ width: isMobile ? "calc(50% - 4px)" : 140 }}
              size="small"
              allowClear
            >
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="menunggu">Menunggu</Select.Option>
              <Select.Option value="disetujui">Disetujui</Select.Option>
              <Select.Option value="perbaikan">Perbaikan</Select.Option>
              <Select.Option value="ditolak">Ditolak</Select.Option>
            </Select>
            {isAdmin && (
              <TreeSelect
                placeholder="Perangkat Daerah"
                value={organizationId || undefined}
                onChange={(val) => updateFilters({ "organization-id": val || "", page: 1 })}
                treeData={opdTree}
                showSearch
                treeNodeFilterProp="label"
                allowClear
                loading={loadingOpd}
                style={{ width: isMobile ? "calc(50% - 4px)" : 220 }}
                size="small"
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              />
            )}
          </Group>

          {/* Action Buttons Row */}
          <Group gap="xs" justify={isMobile ? "space-between" : "flex-end"}>
            <Tooltip title="Refresh">
              <Button
                icon={<IconRefresh size={14} />}
                onClick={() => refetch()}
                size="small"
              />
            </Tooltip>
            {/* Admin: Download all usulan */}
            {isAdmin && (
              <Tooltip title="Unduh semua data usulan beserta jabatan">
                <Button
                  icon={<IconDownload size={14} />}
                  onClick={handleDownloadAll}
                  loading={downloading}
                  size="small"
                >
                  {isMobile ? null : "Unduh Semua"}
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
                {isMobile ? "Buat" : "Buat Pengajuan Baru"}
              </Button>
            )}
          </Group>
        </Stack>
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
          scroll={{ x: isMobile ? 700 : 900 }}
        />
      </Paper>
    </Stack>
  );
}

export default FormasiUsulanList;
