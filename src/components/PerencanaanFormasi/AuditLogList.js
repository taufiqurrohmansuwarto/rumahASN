import { getRiwayatAudit } from "@/services/perencanaan-formasi.services";
import {
  IconDownload,
  IconEye,
  IconRefresh,
  IconHistory
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
  Card,
  Row,
  Col,
  Typography,
  Space,
  Grid
} from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useDebouncedValue } from "@mantine/hooks";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
const DetailModal = ({ open, onClose, data, isXs }) => {
  if (!data) return null;

  const perubahan = parsePerubahan(data.data_lama, data.data_baru);

  return (
    <Modal
      title="Detail Audit Log"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Tutup</Button>}
      width={isXs ? "95%" : 600}
      centered={isXs}
    >
      <Descriptions bordered column={isXs ? 1 : 2} size="small">
        <Descriptions.Item label="ID">{data.riwayat_audit_id}</Descriptions.Item>
        <Descriptions.Item label="Aksi">
          <AksiBadge aksi={data.aksi} />
        </Descriptions.Item>
        <Descriptions.Item label="Formasi" span={isXs ? 1 : 2}>
          {data.formasi?.deskripsi || data.formasi_id || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan" span={isXs ? 1 : 2}>
          {data.nama_jabatan || data.data_baru?.jabatan_id || data.data_lama?.jabatan_id || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Operator" span={isXs ? 1 : 2}>
          {data.dibuatOleh?.username || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Waktu" span={isXs ? 1 : 2}>
          {dayjs(data.dibuat_pada).format("DD/MM/YYYY HH:mm:ss")}
        </Descriptions.Item>
        <Descriptions.Item label="IP Address" span={isXs ? 1 : 2}>
          {data.ip_address || "-"}
        </Descriptions.Item>
      </Descriptions>

      <Text strong style={{ marginTop: 16, display: 'block', marginBottom: 8 }}>
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

  const screens = useBreakpoint();
  const isXs = !screens?.sm;

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
  const { data, isLoading, refetch, isFetching } = useQuery(
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
        <Text strong style={{ fontSize: 12 }}>
          {val?.username || "-"}
        </Text>
      ),
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      key: "aksi",
      width: 140,
      render: (val) => <AksiBadge aksi={val} />,
    },
    {
      title: "Formasi",
      dataIndex: "formasi",
      key: "formasi",
      width: 120,
      render: (val) => (
        <Text style={{ color: "#1890ff", fontWeight: 500, fontSize: 12 }}>
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
        if (!jabatan) return <Text type="secondary" style={{ fontSize: 12 }}>-</Text>;
        return (
          <Tooltip title={jabatan}>
            <Text style={{ fontSize: 12 }} ellipsis>
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
        if (!unitKerja) return <Text type="secondary" style={{ fontSize: 12 }}>-</Text>;
        return (
          <Tooltip title={unitKerja}>
            <Text style={{ fontSize: 12 }} ellipsis>
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
        if (lama === baru || (!lama && !baru)) return <Text type="secondary" style={{ fontSize: 12 }}>-</Text>;
        return (
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{lama ?? "-"}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>→</Text>
            <Text strong style={{ color: "#1890ff", fontSize: 12 }}>{baru ?? "-"}</Text>
          </Space>
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
        if (lama === baru || (!lama && !baru)) return <Text type="secondary" style={{ fontSize: 12 }}>-</Text>;
        return (
          <Space direction="vertical" size={0}>
            {lama && <Text type="secondary" style={{ fontSize: 11 }}>{lama}</Text>}
            {baru && (
              <Tag
                color={baru === "disetujui" ? "green" : baru === "ditolak" ? "red" : baru === "perbaikan" ? "orange" : "blue"}
                style={{ margin: 0 }}
              >
                {baru}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Waktu",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 130,
      render: (val) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(val).format("DD-MM-YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Detail">
          <Button
            type="text"
            icon={<IconEye size={16} />}
            style={{ color: "#1890ff" }}
            onClick={() => setDetailModal({ open: true, data: record })}
          />
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
    <div style={{ width: "100%" }}>
      {/* Stats Section */}
      <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }} bordered>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>Total Log Activity:</Text>
          <Text strong>{total}</Text>
        </Space>
      </Card>

      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconHistory size={32} style={{ marginBottom: 8 }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Audit Log
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Riwayat aktivitas pengguna
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} lg={18}>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={8} md={6}>
                    <Input.Search
                      placeholder="Cari operator..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      allowClear
                      style={{ width: "100%" }}
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={8} md={6}>
                    <Select
                      placeholder="Filter Aksi"
                      value={aksi || undefined}
                      onChange={(val) => updateFilters({ aksi: val || "", page: 1 })}
                      style={{ width: "100%" }}
                      allowClear
                      options={AKSI_OPTIONS}
                      showSearch
                      optionFilterProp="label"
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <RangePicker
                      onChange={handleDateChange}
                      format="DD/MM/YYYY"
                      placeholder={["Dari", "Sampai"]}
                      style={{ width: "100%" }}
                      value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
                      size="small"
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs={24} lg={6} style={{ display: "flex", justifyContent: isXs ? "flex-start" : "flex-end" }}>
                <Space wrap>
                  <Tooltip title="Refresh">
                    <Button
                        icon={<IconRefresh size={14} />}
                        onClick={() => refetch()}
                        loading={isLoading || isFetching}
                    />
                  </Tooltip>
                  <Button
                    icon={<IconDownload size={14} />}
                    loading={downloading}
                    onClick={handleDownloadExcel}
                    type="primary"
                    ghost
                  >
                    Unduh
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              dataSource={data?.data || []}
              columns={columns}
              rowKey="riwayat_audit_id"
              size="middle"
              loading={isLoading || isFetching}
              scroll={{ x: 1100 }}
              pagination={{
                position: ["bottomRight"],
                current: Number(page),
                pageSize: Number(limit),
                total: data?.meta?.total || 0,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} log`,
                onChange: (p, l) => updateFilters({ page: p, limit: l }),
              }}
            />
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, data: null })}
        data={detailModal.data}
        isXs={isXs}
      />
    </div>
  );
}

export default AuditLogList;