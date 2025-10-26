import {
  usePengajuanTTEAdmin,
  useUpdatePengajuanTTEAdmin,
} from "@/hooks/kominfo-submissions";
import {
  CheckCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Text, Group } from "@mantine/core";
import {
  IconCertificate,
  IconExternalLink,
  IconFileText,
  IconId,
  IconMail,
  IconUser,
  IconDownload,
} from "@tabler/icons-react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useState } from "react";
import { listPengajuanTTEAdmin } from "@/services/kominfo-submissions.services";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Paragraph } = Typography;
const { Search } = Input;

const DaftarTTEPengajuanAdmin = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "DIAJUKAN",
  } = router.query;

  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  const { data, isLoading, isFetching, refetch, isRefetching } =
    usePengajuanTTEAdmin({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status,
    });

  const updatePengajuan = useUpdatePengajuanTTEAdmin();

  const handleSearch = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        search: value || undefined,
        page: 1,
      },
    });
  };

  const handleStatusChange = (newStatus) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        status: newStatus,
        page: 1,
      },
    });
  };

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      status: "",
      catatan: record.catatan || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      await updatePengajuan.mutateAsync({
        id: selectedRecord.id,
        data: values,
      });

      message.success("Status pengajuan berhasil diupdate");
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error("Error updating pengajuan:", error);
      message.error("Gagal update status pengajuan");
    }
  };

  // Handle download Excel
  const handleDownload = async () => {
    try {
      message.loading({ content: "Sedang mengunduh data...", key: "download" });

      // Fetch all data dengan limit = -1
      const response = await listPengajuanTTEAdmin({
        search: search || "",
        status: status || "DIAJUKAN",
        page: 1,
        limit: -1,
      });

      // Handle response: bisa array langsung atau object dengan property data
      const dataArray = Array.isArray(response)
        ? response
        : response?.data || [];

      if (!dataArray || dataArray.length === 0) {
        message.warning({
          content: "Tidak ada data untuk diunduh",
          key: "download",
        });
        return;
      }

      // Format data untuk Excel
      const excelData = dataArray.map((item, index) => ({
        No: index + 1,
        NIP: item?.nip || "-",
        NIK: item?.nik || "-",
        "Nama Pegawai": item?.user?.username || "-",
        Jabatan: item?.user?.nama_jabatan || "-",
        "Unit Kerja": item?.user?.perangkat_daerah_detail || "-",
        "Email Jatimprov": item?.email_jatimprov || "-",
        Status: item?.status || "-",
        Catatan: item?.catatan || "-",
        "Tanggal Ajuan": item?.tanggal_ajuan
          ? dayjs(item.tanggal_ajuan).format("DD/MM/YYYY HH:mm:ss")
          : "-",
        "Tanggal Diproses": item?.tanggal_diproses
          ? dayjs(item.tanggal_diproses).format("DD/MM/YYYY HH:mm:ss")
          : "-",
        "Diproses Oleh": item?.korektor?.username || "-",
        "File KTP": item?.file_ktp || "-",
        "File SK Jabatan": item?.file_sk_pangkat || "-",
        "File Surat Usulan": item?.file_surat_usulan || "-",
      }));

      // Create workbook dan worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pengajuan TTE");

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No
        { wch: 20 }, // NIP
        { wch: 18 }, // NIK
        { wch: 30 }, // Nama
        { wch: 35 }, // Jabatan
        { wch: 50 }, // Unit Kerja
        { wch: 30 }, // Email Jatimprov
        { wch: 12 }, // Status
        { wch: 30 }, // Catatan
        { wch: 20 }, // Tanggal Ajuan
        { wch: 20 }, // Tanggal Diproses
        { wch: 30 }, // Diproses Oleh
        { wch: 60 }, // File KTP
        { wch: 60 }, // File SK Jabatan
        { wch: 60 }, // File Surat Usulan
      ];

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const fileName = `Pengajuan_TTE_${status || "SEMUA"}_${dayjs().format(
        "YYYY-MM-DD_HHmmss"
      )}.xlsx`;
      saveAs(blob, fileName);

      message.success({
        content: `Berhasil mengunduh ${excelData.length} data`,
        key: "download",
      });
    } catch (error) {
      console.error("Download error:", error);
      message.error({
        content: "Gagal mengunduh data",
        key: "download",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: "gray", text: "DRAFT" },
      DIAJUKAN: { color: "blue", text: "DIAJUKAN" },
      PERBAIKAN: { color: "orange", text: "PERBAIKAN" },
      DISETUJUI: { color: "green", text: "DISETUJUI" },
      DITOLAK: { color: "red", text: "DITOLAK" },
    };

    const config = statusConfig[status] || {
      color: "gray",
      text: status || "UNKNOWN",
    };

    return (
      <Badge color={config.color} variant="light" size="md">
        {config.text}
      </Badge>
    );
  };

  const columns = [
    {
      title: "Pemohon",
      key: "user",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record.user?.image}
            size={40}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {!record.user?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: "1.2" }}>
            <div>
              <Text fw={600} size="xs">
                {record.user?.username || record.user_id}
              </Text>
            </div>
            <div style={{ marginTop: "2px" }}>
              <Text size="xs" c="dimmed">
                {record.nip}
              </Text>
            </div>
            {record.user?.nama_jabatan && (
              <div style={{ marginTop: "2px" }}>
                <Text size="xs" c="blue" lineClamp={1}>
                  {record.user.nama_jabatan}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Tanggal Ajuan",
      dataIndex: "tanggal_ajuan",
      key: "tanggal_ajuan",
      width: 130,
      render: (text) =>
        text ? (
          <Tooltip title={dayjs(text).format("DD MMMM YYYY HH:mm")}>
            <div style={{ lineHeight: "1.2", cursor: "pointer" }}>
              <Text size="xs">{dayjs(text).format("DD/MM/YY")}</Text>
              <div style={{ marginTop: "2px" }}>
                <Text size="xs" c="dimmed">
                  {dayjs(text).format("HH:mm")}
                </Text>
              </div>
            </div>
          </Tooltip>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
    },
    {
      title: "Diproses oleh",
      key: "korektor",
      width: 180,
      render: (_, record) =>
        record.korektor ? (
          <Space size="small">
            <Avatar src={record.korektor?.image} size={32}>
              {!record.korektor?.image && <UserOutlined />}
            </Avatar>
            <div style={{ lineHeight: "1.2" }}>
              <Text size="xs" fw={600}>
                {record.korektor?.username}
              </Text>
              {record.tanggal_diproses && (
                <div style={{ marginTop: "2px" }}>
                  <Text size="xs" c="dimmed">
                    {dayjs(record.tanggal_diproses).format("DD/MM/YY HH:mm")}
                  </Text>
                </div>
              )}
            </div>
          </Space>
        ) : (
          <Text size="xs" c="dimmed">
            Belum diproses
          </Text>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(record)}
          style={{
            background: "#6366f1",
            borderColor: "#6366f1",
          }}
        >
          Proses
        </Button>
      ),
    },
  ];

  const tableData = data?.data || [];

  return (
    <div>
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
              background: "#6366f1",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconCertificate size={32} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Daftar Pengajuan TTE
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Kelola dan proses pengajuan Tanda Tangan Elektronik
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text fw={600} size="sm" c="dimmed">
                    Cari berdasarkan Nama/NIP:
                  </Text>
                  <Search
                    placeholder="Masukkan nama atau NIP..."
                    allowClear
                    defaultValue={search}
                    onSearch={handleSearch}
                    style={{ width: "100%" }}
                  />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text fw={600} size="sm" c="dimmed">
                    Filter Status:
                  </Text>
                  <Radio.Group
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="DIAJUKAN">Diajukan</Radio.Button>
                    <Radio.Button value="PERBAIKAN">Perbaikan</Radio.Button>
                    <Radio.Button value="DISETUJUI">Disetujui</Radio.Button>
                    <Radio.Button value="DITOLAK">Ditolak</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>
              <Col xs={24} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<IconDownload size={14} />}
                  onClick={handleDownload}
                  style={{
                    background: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Download Excel
                </Button>
              </Col>
            </Row>
            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
              <Col
                xs={24}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading || isRefetching}
                  onClick={() => refetch()}
                  style={{ borderRadius: 6, fontWeight: 500 }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 900 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: (newPage) => {
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      page: newPage,
                    },
                  });
                },
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} pengajuan`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <IconCertificate
                      size={64}
                      color="#d1d5db"
                      style={{ marginBottom: 24 }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada pengajuan
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada pengajuan TTE yang masuk
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modal Update Status */}
      <Modal
        title={
          <Group gap="xs">
            <IconCertificate size={20} color="#6366f1" />
            <span>Proses Pengajuan TTE</span>
          </Group>
        }
        open={showModal}
        onCancel={handleCloseModal}
        width={700}
        footer={null}
      >
        {selectedRecord && (
          <div>
            {/* Pemohon Info */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: "#f0f5ff",
                border: "1px solid #adc6ff",
              }}
            >
              <Space size="small">
                <Avatar src={selectedRecord.user?.image} size={40}>
                  {!selectedRecord.user?.image && <UserOutlined />}
                </Avatar>
                <div>
                  <Text fw={600} size="sm">
                    {selectedRecord.user?.username}
                  </Text>
                  <div style={{ marginTop: 2 }}>
                    <Text size="xs" c="dimmed">
                      NIP: {selectedRecord.nip} • Email:{" "}
                      {selectedRecord.email_jatimprov}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Status Badge */}
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              {getStatusBadge(selectedRecord.status)}
            </div>

            {/* File Links */}
            <Card
              size="small"
              title={
                <Text size="sm" fw={600}>
                  Dokumen Terlampir
                </Text>
              }
              style={{ marginBottom: 16 }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Group justify="space-between">
                  <Text size="sm">📄 KTP</Text>
                  {selectedRecord.file_ktp ? (
                    <a
                      href={selectedRecord.file_ktp}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#6366f1",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <IconExternalLink size={12} />
                      Lihat File
                    </a>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Belum diunggah
                    </Text>
                  )}
                </Group>
                <Group justify="space-between">
                  <Text size="sm">📄 SK Jabatan</Text>
                  {selectedRecord.file_sk_pangkat ? (
                    <a
                      href={selectedRecord.file_sk_pangkat}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#6366f1",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <IconExternalLink size={12} />
                      Lihat File
                    </a>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Belum diunggah
                    </Text>
                  )}
                </Group>
                <Group justify="space-between">
                  <Text size="sm">📄 Surat Usulan TTE</Text>
                  {selectedRecord.file_surat_usulan ? (
                    <a
                      href={selectedRecord.file_surat_usulan}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#6366f1",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <IconExternalLink size={12} />
                      Lihat File
                    </a>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Belum diunggah
                    </Text>
                  )}
                </Group>
              </Space>
            </Card>

            {/* Form Update */}
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Ubah Status"
                name="status"
                rules={[{ required: true, message: "Pilih status" }]}
              >
                <Radio.Group buttonStyle="solid" style={{ width: "100%" }}>
                  <Radio.Button value="PERBAIKAN" style={{ width: "50%" }}>
                    <Space>
                      <IconFileText size={14} />
                      Perbaikan
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="DISETUJUI" style={{ width: "50%" }}>
                    <Space>
                      <CheckCircleOutlined />
                      Disetujui
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Catatan"
                name="catatan"
                rules={[{ required: true, message: "Catatan wajib diisi" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Berikan catatan untuk pemohon..."
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                <Group justify="flex-end" gap="sm">
                  <Button onClick={handleCloseModal}>Batal</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updatePengajuan.isPending}
                    style={{
                      background: "#6366f1",
                      borderColor: "#6366f1",
                    }}
                  >
                    Update Status
                  </Button>
                </Group>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DaftarTTEPengajuanAdmin;
