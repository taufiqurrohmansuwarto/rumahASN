import { getRiwayatAuditBySubmissionId } from "@/services/perencanaan-formasi.services";
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
  Grid,
  Tooltip
} from "antd";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Aksi Badge
const AksiBadge = ({ aksi }) => {
  const config = {
    // Usulan jabatan actions
    CREATE: { color: "green", label: "Tambah Jabatan" },
    UPDATE: { color: "blue", label: "Edit Jabatan" },
    DELETE: { color: "red", label: "Hapus Jabatan" },
    // Usulan verification actions (per jabatan)
    VERIFY_DISETUJUI: { color: "green", label: "Jabatan Disetujui" },
    VERIFY_DITOLAK: { color: "red", label: "Jabatan Ditolak" },
    VERIFY_PERBAIKAN: { color: "orange", label: "Jabatan Perbaikan" },
    VERIFY_MENUNGGU: { color: "default", label: "Jabatan Menunggu" },
    // Submission actions
    UPDATE_SUBMISSION: { color: "blue", label: "Edit Pengajuan" },
    SUBMIT_SUBMISSION: { color: "processing", label: "Kirim Pengajuan" },
    // Submission verification actions
    VERIFY_SUBMISSION_DISETUJUI: { color: "green", label: "Disetujui" },
    VERIFY_SUBMISSION_DITOLAK: { color: "red", label: "Ditolak" },
    VERIFY_SUBMISSION_PERBAIKAN: { color: "orange", label: "Perlu Perbaikan" },
    VERIFY_SUBMISSION_MENUNGGU: { color: "default", label: "Menunggu" },
    // Lampiran actions
    UPLOAD_LAMPIRAN: { color: "cyan", label: "Upload Lampiran" },
    UPDATE_LAMPIRAN: { color: "geekblue", label: "Edit Lampiran" },
    DELETE_LAMPIRAN: { color: "magenta", label: "Hapus Lampiran" },
  };

  // Check direct match first
  let matchedConfig = config[aksi];

  // Handle dynamic patterns if no direct match
  if (!matchedConfig && aksi) {
    if (aksi.startsWith("VERIFY_SUBMISSION_")) {
      const status = aksi.replace("VERIFY_SUBMISSION_", "").toLowerCase();
      if (status.includes("disetujui")) {
        matchedConfig = { color: "green", label: "Disetujui" };
      } else if (status.includes("ditolak")) {
        matchedConfig = { color: "red", label: "Ditolak" };
      } else if (status.includes("perbaikan")) {
        matchedConfig = { color: "orange", label: "Perlu Perbaikan" };
      } else if (status.includes("menunggu")) {
        matchedConfig = { color: "processing", label: "Menunggu Verifikasi" };
      } else {
        matchedConfig = { color: "purple", label: "Verifikasi" };
      }
    } else if (aksi.startsWith("verifikasi_")) {
      const status = aksi.replace("verifikasi_", "").toLowerCase();
      if (status.includes("disetujui")) {
        matchedConfig = { color: "green", label: "Jabatan Disetujui" };
      } else if (status.includes("ditolak")) {
        matchedConfig = { color: "red", label: "Jabatan Ditolak" };
      } else if (status.includes("perbaikan")) {
        matchedConfig = { color: "orange", label: "Jabatan Perbaikan" };
      } else {
        matchedConfig = { color: "blue", label: "Verifikasi Jabatan" };
      }
    }
  }

  const { color, label } = matchedConfig || {
    color: "default",
    label: aksi?.replace(/_/g, " ") || "-",
  };

  return <Tag color={color}>{label}</Tag>;
};

// Filter options for aksi
const AKSI_OPTIONS = [
  { label: "--- Usulan Jabatan ---", value: "group-usulan", disabled: true },
  { label: "Create Usulan", value: "CREATE" },
  { label: "Edit Usulan", value: "UPDATE" },
  { label: "Hapus Usulan", value: "DELETE" },
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

  const fieldsToCheck = [
    "alokasi",
    "status",
    "jabatan_id",
    "jenis_jabatan",
    "unit_kerja",
  ];

  fieldsToCheck.forEach((field) => {
    const lama = dataLama?.[field];
    const baru = dataBaru?.[field];
    if (lama !== baru && (lama || baru)) {
      changes.push({
        field: field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
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
        <Descriptions.Item label="ID">
          {data.riwayat_audit_id}
        </Descriptions.Item>
        <Descriptions.Item label="Aksi">
          <AksiBadge aksi={data.aksi} />
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan" span={isXs ? 1 : 2}>
          {data.nama_jabatan ||
            data.data_baru?.jabatan_id ||
            data.data_lama?.jabatan_id ||
            "-"}
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

function SubmissionAuditLogList({ formasiId, formasiUsulanId, submissionData }) {
  const router = useRouter();
  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  // Get filters from URL
  const {
    alPage = 1,
    alLimit = 10,
    alSearch = "",
    alAksi = "",
    alStartDate = "",
    alEndDate = "",
  } = router.query;

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(alSearch);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== alSearch) {
      updateFilters({ alSearch: debouncedSearch, alPage: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sync URL search to local state on mount
  useEffect(() => {
    setSearchInput(alSearch);
  }, [alSearch]);

  // Update URL params
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

  // Filters object for query
  const filters = {
    page: Number(alPage),
    limit: Number(alLimit),
    search: alSearch,
    aksi: alAksi,
    startDate: alStartDate,
    endDate: alEndDate,
  };

  // Fetch audit log
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["perencanaan-submission-audit-log", formasiUsulanId, filters],
    () => getRiwayatAuditBySubmissionId(formasiUsulanId, filters),
    { enabled: !!formasiUsulanId, keepPreviousData: true }
  );

  // Handle date range change
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      updateFilters({
        alStartDate: dates[0].format("YYYY-MM-DD"),
        alEndDate: dates[1].format("YYYY-MM-DD"),
        alPage: 1,
      });
    } else {
      updateFilters({ alStartDate: "", alEndDate: "", alPage: 1 });
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
      width: 120,
      render: (val) => <AksiBadge aksi={val} />,
    },
    {
      title: "Jabatan",
      key: "jabatan",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        const jabatan =
          record.nama_jabatan ||
          record.data_baru?.jabatan_id ||
          record.data_lama?.jabatan_id;
        if (!jabatan)
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              -
            </Text>
          );
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
        const unitKerja =
          record.unit_kerja_text ||
          record.data_baru?.unit_kerja ||
          record.data_lama?.unit_kerja;
        if (!unitKerja)
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              -
            </Text>
          );
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
        if (lama === baru || (!lama && !baru))
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              -
            </Text>
          );
        return (
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {lama ?? "-"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              →
            </Text>
            <Text strong style={{ color: "#1890ff", fontSize: 12 }}>
              {baru ?? "-"}
            </Text>
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
      const allData = await getRiwayatAuditBySubmissionId(formasiUsulanId, {
        ...filters,
        limit: -1,
      });

      if (!allData?.data?.length) {
        message.warning({
          content: "Tidak ada data untuk diunduh",
          key: "download",
        });
        return;
      }

      // Create workbook
      const wb = new ExcelJS.Workbook();
      wb.creator = "Rumah ASN";
      wb.created = new Date();

      const ws = wb.addWorksheet("Audit Log");

      // Get formasi and perangkat daerah info
      const formasiTitle = submissionData?.formasi?.deskripsi || "Formasi";
      const perangkatDaerah =
        submissionData?.pembuat?.unor?.name ||
        submissionData?.pembuat?.perangkat_daerah_detail ||
        "-";
      const pengusul = submissionData?.pembuat?.username || "-";

      // Define columns
      ws.columns = [
        { key: "no", width: 5 },
        { key: "operator", width: 20 },
        { key: "aksi", width: 18 },
        { key: "jabatan", width: 35 },
        { key: "unit_kerja", width: 35 },
        { key: "alokasi_lama", width: 10 },
        { key: "alokasi_baru", width: 10 },
        { key: "waktu", width: 18 },
        { key: "ip", width: 15 },
      ];

      // Add title rows
      ws.mergeCells("A1:I1");
      const titleCell = ws.getCell("A1");
      titleCell.value = `AUDIT LOG PENGAJUAN ${formasiTitle.toUpperCase()}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 25;

      ws.mergeCells("A2:I2");
      const subtitleCell = ws.getCell("A2");
      subtitleCell.value = perangkatDaerah;
      subtitleCell.font = { bold: true, size: 11 };
      subtitleCell.alignment = { horizontal: "center", vertical: "middle" };

      ws.mergeCells("A3:I3");
      const pengusulCell = ws.getCell("A3");
      pengusulCell.value = `Pengusul: ${pengusul} | Dicetak: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
      pengusulCell.font = { size: 10, italic: true };
      pengusulCell.alignment = { horizontal: "center", vertical: "middle" };

      // Add empty row
      ws.addRow([]);

      // Add header row
      const headerRow = ws.addRow([
        "NO",
        "OPERATOR",
        "AKSI",
        "JABATAN",
        "UNIT KERJA",
        "ALOKASI LAMA",
        "ALOKASI BARU",
        "WAKTU",
        "IP ADDRESS",
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
          size: 10,
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

      // Helper to get aksi label
      const getAksiLabel = (aksi) => {
        const config = {
          CREATE: "Tambah Jabatan",
          UPDATE: "Edit Jabatan",
          DELETE: "Hapus Jabatan",
          VERIFY_DISETUJUI: "Jabatan Disetujui",
          VERIFY_DITOLAK: "Jabatan Ditolak",
          VERIFY_PERBAIKAN: "Jabatan Perbaikan",
          UPDATE_SUBMISSION: "Edit Pengajuan",
          SUBMIT_SUBMISSION: "Kirim Pengajuan",
          UPLOAD_LAMPIRAN: "Upload Lampiran",
          UPDATE_LAMPIRAN: "Edit Lampiran",
          DELETE_LAMPIRAN: "Hapus Lampiran",
        };
        if (config[aksi]) return config[aksi];
        if (aksi?.startsWith("VERIFY_SUBMISSION_")) {
          const status = aksi.replace("VERIFY_SUBMISSION_", "");
          if (status.includes("DISETUJUI")) return "Disetujui";
          if (status.includes("DITOLAK")) return "Ditolak";
          if (status.includes("PERBAIKAN")) return "Perlu Perbaikan";
          return "Verifikasi";
        }
        return aksi?.replace(/_/g, " ") || "-";
      };

      // Add data rows
      allData.data.forEach((item, index) => {
        const row = ws.addRow({
          no: index + 1,
          operator: item.dibuatOleh?.username || "-",
          aksi: getAksiLabel(item.aksi),
          jabatan: item.nama_jabatan || item.data_baru?.jabatan_id || item.data_lama?.jabatan_id || "-",
          unit_kerja: item.unit_kerja_text || item.data_baru?.unit_kerja || item.data_lama?.unit_kerja || "-",
          alokasi_lama: item.data_lama?.alokasi ?? "-",
          alokasi_baru: item.data_baru?.alokasi ?? "-",
          waktu: item.dibuat_pada ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm:ss") : "-",
          ip: item.ip_address || "-",
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
            wrapText: colNumber >= 4 && colNumber <= 5, // Wrap for Jabatan, Unit Kerja
          };
          cell.font = { size: 10 };
          // Alternate row colors
          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF5F5F5" },
            };
          }
        });
      });

      // Generate buffer and save
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `audit_log_${formasiTitle}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
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
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Total Activity Log:</Text>
              <Text strong>{total}</Text>
            </Space>
          </Col>
        </Row>
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
              Audit Log Submission
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Riwayat aktivitas pada pengajuan ini
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
                      value={alAksi || undefined}
                      onChange={(val) => updateFilters({ alAksi: val || "", alPage: 1 })}
                      style={{ width: "100%" }}
                      allowClear
                      options={AKSI_OPTIONS}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <RangePicker
                      onChange={handleDateChange}
                      format="DD/MM/YYYY"
                      placeholder={["Dari", "Sampai"]}
                      style={{ width: "100%" }}
                      value={
                        alStartDate && alEndDate
                          ? [dayjs(alStartDate), dayjs(alEndDate)]
                          : null
                      }
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
              pagination={{
                position: ["bottomRight"],
                current: Number(alPage),
                pageSize: Number(alLimit),
                total: data?.meta?.total || 0,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} log`,
                onChange: (p, l) => updateFilters({ alPage: p, alLimit: l }),
              }}
              scroll={{ x: 1100 }}
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

export default SubmissionAuditLogList;