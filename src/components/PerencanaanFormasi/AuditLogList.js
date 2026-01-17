import { getRiwayatAudit } from "@/services/perencanaan-formasi.services";
import {
  ActionIcon,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import {
  IconDownload,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Descriptions,
  Input,
  message,
  Modal,
  Select,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;

// Aksi Badge
const AksiBadge = ({ aksi }) => {
  const config = {
    // Usulan actions
    CREATE: { color: "green", label: "Create Usulan" },
    UPDATE: { color: "blue", label: "Edit Usulan" },
    DELETE: { color: "red", label: "Hapus Usulan" },
    VERIFY_DISETUJUI: { color: "green", label: "Disetujui" },
    VERIFY_DITOLAK: { color: "red", label: "Ditolak" },
    VERIFY_PERBAIKAN: { color: "orange", label: "Perbaikan" },
    VERIFY_MENUNGGU: { color: "default", label: "Menunggu" },
    // Submission actions (Formasi Usulan)
    CREATE_SUBMISSION: { color: "green", label: "Buat Pengajuan" },
    UPDATE_SUBMISSION: { color: "blue", label: "Edit Pengajuan" },
    DELETE_SUBMISSION: { color: "red", label: "Hapus Pengajuan" },
    VERIFY_SUBMISSION_DISETUJUI: { color: "green", label: "Disetujui" },
    VERIFY_SUBMISSION_DITOLAK: { color: "red", label: "Ditolak" },
    VERIFY_SUBMISSION_PERBAIKAN: { color: "orange", label: "Perbaikan" },
    VERIFY_SUBMISSION_MENUNGGU: { color: "default", label: "Menunggu" },
    SUBMIT_SUBMISSION: { color: "processing", label: "Kirim Pengajuan" },
    // Lampiran actions
    UPLOAD_LAMPIRAN: { color: "cyan", label: "Upload Lampiran" },
    UPDATE_LAMPIRAN: { color: "geekblue", label: "Edit Lampiran" },
    DELETE_LAMPIRAN: { color: "magenta", label: "Hapus Lampiran" },
    // Formasi actions
    CREATE_FORMASI: { color: "lime", label: "Create Formasi" },
    UPDATE_FORMASI: { color: "purple", label: "Edit Formasi" },
    DELETE_FORMASI: { color: "volcano", label: "Hapus Formasi" },
  };

  // Handle dynamic aksi values (e.g., VERIFY_SUBMISSION_CPNS2026 -> check prefix)
  let matchedConfig = config[aksi];

  if (!matchedConfig && aksi) {
    // Check for prefix patterns
    if (aksi.startsWith("VERIFY_SUBMISSION_")) {
      const suffix = aksi.replace("VERIFY_SUBMISSION_", "");
      if (suffix === "DISETUJUI" || suffix.includes("DISETUJUI")) {
        matchedConfig = { color: "green", label: "Disetujui" };
      } else if (suffix === "DITOLAK" || suffix.includes("DITOLAK")) {
        matchedConfig = { color: "red", label: "Ditolak" };
      } else if (suffix === "PERBAIKAN" || suffix.includes("PERBAIKAN")) {
        matchedConfig = { color: "orange", label: "Perbaikan" };
      } else if (suffix === "MENUNGGU" || suffix.includes("MENUNGGU")) {
        matchedConfig = { color: "default", label: "Menunggu" };
      } else {
        matchedConfig = { color: "processing", label: "Verifikasi" };
      }
    } else if (aksi.startsWith("UPDATE_SUBMISSION")) {
      matchedConfig = { color: "blue", label: "Edit Pengajuan" };
    } else if (aksi.startsWith("CREATE_SUBMISSION")) {
      matchedConfig = { color: "green", label: "Buat Pengajuan" };
    } else if (aksi.startsWith("DELETE_SUBMISSION")) {
      matchedConfig = { color: "red", label: "Hapus Pengajuan" };
    }
  }

  const { color, label } = matchedConfig || { color: "default", label: aksi?.replace(/_/g, " ") || "-" };
  return <Tag color={color}>{label}</Tag>;
};

// Filter options for aksi with grouping
const AKSI_OPTIONS = [
  { label: "--- Usulan Jabatan ---", value: "group-usulan", disabled: true },
  { label: "Create Usulan", value: "CREATE" },
  { label: "Edit Usulan", value: "UPDATE" },
  { label: "Hapus Usulan", value: "DELETE" },
  { label: "--- Pengajuan ---", value: "group-submission", disabled: true },
  { label: "Buat Pengajuan", value: "CREATE_SUBMISSION" },
  { label: "Edit Pengajuan", value: "UPDATE_SUBMISSION" },
  { label: "Hapus Pengajuan", value: "DELETE_SUBMISSION" },
  { label: "Kirim Pengajuan", value: "SUBMIT_SUBMISSION" },
  { label: "--- Verifikasi ---", value: "group-verify", disabled: true },
  { label: "Disetujui", value: "VERIFY_DISETUJUI" },
  { label: "Ditolak", value: "VERIFY_DITOLAK" },
  { label: "Perbaikan", value: "VERIFY_PERBAIKAN" },
  { label: "--- Lampiran ---", value: "group-lampiran", disabled: true },
  { label: "Upload Lampiran", value: "UPLOAD_LAMPIRAN" },
  { label: "Edit Lampiran", value: "UPDATE_LAMPIRAN" },
  { label: "Hapus Lampiran", value: "DELETE_LAMPIRAN" },
];

// Parse perubahan dari data_lama dan data_baru
const parsePerubahan = (dataLama, dataBaru) => {
  const changes = [];
  
  if (!dataLama && dataBaru) {
    return [{ field: "Data", lama: "-", baru: "Dibuat baru" }];
  }
  
  if (dataLama && !dataBaru) {
    return [{ field: "Data", lama: "Data dihapus", baru: "-" }];
  }

  const fieldsToCheck = ["alokasi", "status", "jabatan_id", "jenis_jabatan", "unit_kerja"];
  
  fieldsToCheck.forEach((field) => {
    const lama = dataLama?.[field];
    const baru = dataBaru?.[field];
    if (lama !== baru && (lama || baru)) {
      changes.push({
        field: field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        lama: lama || "-",
        baru: baru || "-",
      });
    }
  });

  return changes.length > 0 ? changes : [{ field: "-", lama: "-", baru: "-" }];
};

// Detail Modal
const DetailModal = ({ open, onClose, data, isMobile }) => {
  if (!data) return null;

  const perubahan = parsePerubahan(data.data_lama, data.data_baru);

  return (
    <Modal
      title="Detail Audit Log"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Tutup</Button>}
      width={isMobile ? "95%" : 600}
      centered={isMobile}
    >
      <Descriptions bordered column={isMobile ? 1 : 2} size="small">
        <Descriptions.Item label="ID">{data.riwayat_audit_id}</Descriptions.Item>
        <Descriptions.Item label="Aksi">
          <AksiBadge aksi={data.aksi} />
        </Descriptions.Item>
        <Descriptions.Item label="Formasi" span={isMobile ? 1 : 2}>
          {data.formasi?.deskripsi || data.formasi_id || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan" span={isMobile ? 1 : 2}>
          {data.nama_jabatan || data.data_baru?.jabatan_id || data.data_lama?.jabatan_id || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Operator" span={isMobile ? 1 : 2}>
          {data.dibuatOleh?.username || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Waktu" span={isMobile ? 1 : 2}>
          {dayjs(data.dibuat_pada).format("DD/MM/YYYY HH:mm:ss")}
        </Descriptions.Item>
        <Descriptions.Item label="IP Address" span={isMobile ? 1 : 2}>
          {data.ip_address || "-"}
        </Descriptions.Item>
      </Descriptions>

      <Text fw={600} size="sm" mt="md" mb="xs">
        Perubahan Data
      </Text>
      <Table
        dataSource={perubahan}
        columns={[
          { title: "Field", dataIndex: "field", key: "field", width: 150 },
          { title: "Dari", dataIndex: "lama", key: "lama" },
          { title: "Menjadi", dataIndex: "baru", key: "baru" },
        ]}
        rowKey="field"
        size="small"
        pagination={false}
      />
    </Modal>
  );
};

function AuditLogList() {
  const router = useRouter();
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // Responsive breakpoint
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get filters from URL
  const {
    page = 1,
    limit = 10,
    search = "",
    aksi = "",
    startDate = "",
    endDate = "",
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
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  // Filters object for query
  const filters = {
    page: Number(page),
    limit: Number(limit),
    search,
    aksi,
    startDate,
    endDate,
  };

  // Fetch audit log
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-audit-log", filters],
    () => getRiwayatAudit(filters),
    { keepPreviousData: true }
  );

  // Handle date range change
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      updateFilters({
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
        page: 1,
      });
    } else {
      updateFilters({ startDate: "", endDate: "", page: 1 });
    }
  };

  const columns = [
    {
      title: "Operator",
      dataIndex: "dibuatOleh",
      key: "dibuatOleh",
      width: 140,
      fixed: "left",
      render: (val) => (
        <Text size="xs" fw={500} lineClamp={2}>
          {val?.username || "-"}
        </Text>
      ),
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      key: "aksi",
      width: 120,
      render: (val) => <AksiBadge aksi={val} />,
    },
    {
      title: "Formasi",
      dataIndex: "formasi",
      key: "formasi",
      width: 100,
      render: (val) => (
        <Text size="xs" c="blue" fw={500}>
          {val?.deskripsi || "-"}
        </Text>
      ),
    },
    {
      title: "Jabatan",
      key: "jabatan",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        const jabatan = record.nama_jabatan || record.data_baru?.jabatan_id || record.data_lama?.jabatan_id;
        if (!jabatan) return <Text size="xs" c="dimmed">-</Text>;
        return (
          <Tooltip label={jabatan}>
            <Text size="xs" lineClamp={2}>
              {jabatan}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Unit Kerja",
      key: "unit_kerja",
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const unitKerja = record.unit_kerja_text || record.data_baru?.unit_kerja || record.data_lama?.unit_kerja;
        if (!unitKerja) return <Text size="xs" c="dimmed">-</Text>;
        return (
          <Tooltip label={unitKerja}>
            <Text size="xs" lineClamp={2}>
              {unitKerja}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Alokasi",
      key: "perubahan_alokasi",
      width: 100,
      align: "center",
      render: (_, record) => {
        const lama = record.data_lama?.alokasi;
        const baru = record.data_baru?.alokasi;
        if (lama === baru || (!lama && !baru)) return <Text size="xs" c="dimmed">-</Text>;
        return (
          <Group gap={4} justify="center" wrap="nowrap">
            <Text size="xs" c="dimmed">{lama ?? "-"}</Text>
            <Text size="xs" c="dimmed">→</Text>
            <Text size="xs" fw={600} c="blue">{baru ?? "-"}</Text>
          </Group>
        );
      },
    },
    {
      title: "Status",
      key: "perubahan_status",
      width: 120,
      align: "center",
      render: (_, record) => {
        const lama = record.data_lama?.status;
        const baru = record.data_baru?.status;
        if (lama === baru || (!lama && !baru)) return <Text size="xs" c="dimmed">-</Text>;
        return (
          <Stack gap={2} align="center">
            {lama && <Text size="xs" c="dimmed">{lama}</Text>}
            {baru && (
              <Tag
                color={baru === "disetujui" ? "green" : baru === "ditolak" ? "red" : baru === "perbaikan" ? "orange" : "blue"}
                style={{ margin: 0 }}
              >
                {baru}
              </Tag>
            )}
          </Stack>
        );
      },
    },
    {
      title: "Waktu",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 130,
      render: (val) => (
        <Text size="xs" c="dimmed">
          {dayjs(val).format("DD-MM-YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Tooltip label="Detail">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => setDetailModal({ open: true, data: record })}
          >
            <IconEye size={14} />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];

  // Stats
  const total = data?.meta?.total || 0;

  // Download Excel handler
  const [downloading, setDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      message.loading({ content: "Mengunduh data...", key: "download" });

      // Fetch all data with limit=-1
      const allData = await getRiwayatAudit({ ...filters, limit: -1 });

      if (!allData?.data?.length) {
        message.warning({ content: "Tidak ada data untuk diunduh", key: "download" });
        return;
      }

      // Transform data for Excel
      const excelData = allData.data.map((item, index) => ({
        No: index + 1,
        Operator: item.dibuatOleh?.username || "-",
        Aksi: item.aksi || "-",
        Formasi: item.formasi?.deskripsi || "-",
        Jabatan: item.nama_jabatan || item.data_baru?.jabatan_id || item.data_lama?.jabatan_id || "-",
        "Unit Kerja": item.unit_kerja_text || item.data_baru?.unit_kerja || item.data_lama?.unit_kerja || "-",
        "Alokasi Lama": item.data_lama?.alokasi || "-",
        "Alokasi Baru": item.data_baru?.alokasi || "-",
        "Status Lama": item.data_lama?.status || "-",
        "Status Baru": item.data_baru?.status || "-",
        Waktu: item.dibuat_pada ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm:ss") : "-",
        "IP Address": item.ip_address || "-",
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Audit Log");

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `audit_log_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
      message.success({ content: "Data berhasil diunduh", key: "download" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal mengunduh data", key: "download" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Stack gap="xs">
      {/* Header: Stats */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="lg">
          <Group gap={4}>
            <Text size="xs" c="dimmed">Total Log:</Text>
            <Text size="sm" fw={600}>{total}</Text>
          </Group>
        </Group>
      </Paper>

      {/* Filter Row */}
      <Paper p="xs" radius="sm" withBorder>
        <Stack gap="xs">
          {/* Filters */}
          <Group gap="xs" wrap="wrap">
            <Input
              placeholder="Cari operator..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: isMobile ? "100%" : 160, flex: isMobile ? 1 : undefined }}
              size="small"
              allowClear
            />
            <Select
              placeholder="Filter Aksi"
              value={aksi || undefined}
              onChange={(val) => updateFilters({ aksi: val || "", page: 1 })}
              style={{ width: isMobile ? "calc(50% - 4px)" : 180 }}
              size="small"
              allowClear
              options={AKSI_OPTIONS}
              showSearch
              optionFilterProp="label"
            />
            <RangePicker
              size="small"
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              placeholder={["Dari", "Sampai"]}
              style={{ width: isMobile ? "calc(50% - 4px)" : 220 }}
              value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
            />
          </Group>

          {/* Action Buttons */}
          <Group gap="xs" justify={isMobile ? "space-between" : "flex-end"}>
            <Tooltip label="Refresh">
              <Button icon={<IconRefresh size={14} />} onClick={() => refetch()} size="small" />
            </Tooltip>
            <Button
              icon={<IconDownload size={14} />}
              size="small"
              loading={downloading}
              onClick={handleDownloadExcel}
            >
              {isMobile ? null : "Unduh"}
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper p="xs" radius="sm" withBorder>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="riwayat_audit_id"
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
          scroll={{ x: isMobile ? 800 : 1140 }}
        />
      </Paper>

      {/* Detail Modal */}
      <DetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, data: null })}
        data={detailModal.data}
        isMobile={isMobile}
      />
    </Stack>
  );
}

export default AuditLogList;
