import {
  useEmailSubmissionsAdmin,
  useUpdateEmailSubmissionAdmin,
} from "@/hooks/kominfo-submissions";
import {
  IconMail,
  IconUser,
  IconPhone,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconSearch,
  IconRefresh,
  IconFileText,
  IconDownload,
} from "@tabler/icons-react";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  message,
  Tag,
  Space,
  Avatar,
  Typography,
  Divider,
  Badge,
  Grid,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { listEmailSubmissionAdmin } from "@/services/kominfo-submissions.services";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text, Title } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

function EmailSubmissionAdmin() {
  const router = useRouter();
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "DIAJUKAN",
  } = router.query;
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // Fetch data dengan params dari URL
  const { data, isLoading, isFetching } = useEmailSubmissionsAdmin({
    search,
    page,
    limit,
    status,
  });

  const { mutateAsync: updateSubmission, isPending: isUpdating } =
    useUpdateEmailSubmissionAdmin();

  // Handle filter changes
  const handleSearchChange = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        search: value || undefined,
        page: 1,
      },
    });
  };

  const handleStatusChange = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        status: value,
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage, newPageSize) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: newPage,
        limit: newPageSize,
      },
    });
  };

  const handleReset = () => {
    router.push({
      pathname: router.pathname,
      query: {},
    });
  };

  // Handle download Excel
  const handleDownload = async () => {
    try {
      message.loading({ content: "Sedang mengunduh data...", key: "download" });

      // Fetch all data dengan limit = -1
      const response = await listEmailSubmissionAdmin({
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
        "Nama Pegawai": item?.user?.username || "-",
        Jabatan: item?.user?.nama_jabatan || "-",
        "Unit Kerja": item?.user?.perangkat_daerah_detail || "-",
        "Nomor HP": item?.no_hp || "-",
        "Email Usulan": item?.email_usulan || "-",
        Status: item?.status || "-",
        Catatan: item?.catatan || "-",
        "Tanggal Ajuan": item?.tanggal_ajuan
          ? dayjs(item.tanggal_ajuan).format("DD/MM/YYYY HH:mm:ss")
          : "-",
        "Tanggal Diproses": item?.tanggal_diproses
          ? dayjs(item.tanggal_diproses).format("DD/MM/YYYY HH:mm:ss")
          : "-",
      }));

      // Create workbook dan worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pengajuan Email");

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No
        { wch: 20 }, // NIP
        { wch: 30 }, // Nama
        { wch: 35 }, // Jabatan
        { wch: 50 }, // Unit Kerja
        { wch: 15 }, // No HP
        { wch: 30 }, // Email Usulan
        { wch: 12 }, // Status
        { wch: 30 }, // Catatan
        { wch: 20 }, // Tanggal Ajuan
        { wch: 20 }, // Tanggal Diproses
      ];

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const fileName = `Pengajuan_Email_${status || "SEMUA"}_${dayjs().format(
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

  // Open modal untuk edit status
  const handleEdit = (record) => {
    setSelectedRecord(record);

    // Strip @jatimprov.go.id dari email_usulan jika ada
    let emailUsername = record.email_usulan || "";
    if (emailUsername.includes("@jatimprov.go.id")) {
      emailUsername = emailUsername.replace("@jatimprov.go.id", "");
    }

    form.setFieldsValue({
      status: record.status,
      catatan: record.catatan || "",
      email_usulan: emailUsername,
    });
    setModalOpen(true);
  };

  // Submit update
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateSubmission({
        id: selectedRecord.id,
        data: values,
      });
      message.success("Status pengajuan berhasil diperbarui!");
      setModalOpen(false);
      form.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui status";
      message.error(errorMessage);
    }
  };

  // Status badge renderer - Compact
  const getStatusTag = (status) => {
    const statusConfig = {
      DIAJUKAN: {
        color: "orange",
        icon: <IconClock size={12} />,
        text: "Diajukan",
      },
      DIPROSES: {
        color: "blue",
        icon: <IconEdit size={12} />,
        text: "Diproses",
      },
      SELESAI: {
        color: "green",
        icon: <IconCircleCheck size={12} />,
        text: "Selesai",
      },
      DITOLAK: {
        color: "red",
        icon: <IconCircleX size={12} />,
        text: "Ditolak",
      },
    };

    const config = statusConfig[status] || {
      color: "default",
      text: status || "Unknown",
    };

    return (
      <Tag
        color={config.color}
        icon={config.icon}
        style={{ fontSize: 11, padding: "0 6px", margin: 0 }}
      >
        {config.text}
      </Tag>
    );
  };

  // Table columns - Compact
  const columns = [
    {
      title: "User & NIP",
      key: "user",
      width: 240,
      fixed: isXs ? false : "left",
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ padding: "4px 0" }}>
          <Space size={6}>
            <Avatar
              src={record?.user?.image}
              size={28}
              icon={<IconUser size={14} />}
            />
            <div>
              <Text strong style={{ fontSize: 12 }}>
                {record?.user?.username || "N/A"}
              </Text>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, fontFamily: "monospace" }}
                >
                  {record?.nip || "-"}
                </Text>
              </div>
            </div>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            📱 {record?.no_hp || "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Jabatan & Unit Kerja",
      key: "jabatan",
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ padding: "4px 0" }}>
          <Text strong style={{ fontSize: 11 }}>
            {record?.user?.nama_jabatan || "-"}
          </Text>
          <Tooltip title={record?.user?.perangkat_daerah_detail}>
            <Text type="secondary" style={{ fontSize: 10, lineHeight: 1.3 }}>
              {record?.user?.perangkat_daerah_detail?.substring(0, 50) || "-"}
              {(record?.user?.perangkat_daerah_detail?.length || 0) > 50
                ? "..."
                : ""}
            </Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email_usulan",
      key: "email_usulan",
      width: 180,
      render: (email) => (
        <Text style={{ fontSize: 11, fontFamily: "monospace" }}>
          {email || (
            <Text type="secondary" italic style={{ fontSize: 11 }}>
              Belum diisi
            </Text>
          )}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Waktu",
      key: "tanggal",
      width: 140,
      render: (_, record) => (
        <Tooltip
          title={
            record?.tanggal_ajuan
              ? dayjs(record.tanggal_ajuan).format("DD MMMM YYYY HH:mm")
              : "-"
          }
        >
          <Text style={{ fontSize: 11 }}>
            {record?.tanggal_ajuan
              ? dayjs(record.tanggal_ajuan).format("DD/MM/YY HH:mm")
              : "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 70,
      fixed: isXs ? false : "right",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<IconEdit size={12} />}
          onClick={() => handleEdit(record)}
          style={{ fontSize: 11, padding: "0 8px", height: 24 }}
        />
      ),
    },
  ];

  return (
    <>
      <Card
        style={{
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: 16 }}
      >
        {/* Header - Compact */}
        <div
          style={{
            background: "#ff6b35",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px 8px 0 0",
            margin: "-16px -16px 12px -16px",
          }}
        >
          <Space align="center" size="small">
            <IconMail size={20} />
            <div>
              <Title
                level={5}
                style={{ color: "white", margin: 0, fontSize: 15 }}
              >
                Kelola Pengajuan Email Jatimprov
              </Title>
              <Text
                style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 11 }}
              >
                Total: <strong>{data?.total || 0}</strong> pengajuan
              </Text>
            </div>
          </Space>
        </div>

        {/* Filters - Compact */}
        <Space
          style={{
            marginBottom: 12,
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Space size="small" wrap>
            <Input
              placeholder="Cari NIP..."
              prefix={<IconSearch size={14} />}
              style={{ width: 180 }}
              size="small"
              defaultValue={search}
              onPressEnter={(e) => handleSearchChange(e.target.value)}
              allowClear
              onClear={() => handleSearchChange("")}
            />
            <Select
              placeholder="Status"
              style={{ width: 130 }}
              size="small"
              value={status}
              onChange={handleStatusChange}
              options={[
                { label: "Diajukan", value: "DIAJUKAN" },
                { label: "Diproses", value: "DIPROSES" },
                { label: "Selesai", value: "SELESAI" },
                { label: "Ditolak", value: "DITOLAK" },
              ]}
            />
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>

          <Button
            size="small"
            icon={<IconDownload size={14} />}
            onClick={handleDownload}
            style={{
              background: "#52c41a",
              borderColor: "#52c41a",
              color: "white",
            }}
          >
            Download Excel
          </Button>
        </Space>

        {/* Table - Compact */}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 1000 }}
          size="small"
          style={{ fontSize: 11 }}
          pagination={{
            total: data?.total || 0,
            pageSize: parseInt(limit),
            current: parseInt(page),
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total}`,
            onChange: handlePageChange,
            pageSizeOptions: ["10", "20", "50", "100"],
            size: "small",
            style: { marginTop: 12, marginBottom: 0 },
          }}
        />
      </Card>

      {/* Modal Edit - Compact */}
      <Modal
        title={
          <Space size="small">
            <IconEdit size={18} />
            <Text strong style={{ fontSize: 14 }}>
              Update Status
            </Text>
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={500}
      >
        {selectedRecord && (
          <>
            <Card
              size="small"
              style={{ marginBottom: 12, background: "#f9f9f9", padding: 8 }}
            >
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Space size={8}>
                  <Avatar
                    src={selectedRecord?.user?.image}
                    size={32}
                    icon={<IconUser size={14} />}
                  />
                  <div>
                    <Text strong style={{ fontSize: 13 }}>
                      {selectedRecord?.user?.username || "-"}
                    </Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {selectedRecord?.user?.nama_jabatan || "-"}
                      </Text>
                    </div>
                  </div>
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  NIP: {selectedRecord?.nip || "-"} • HP:{" "}
                  {selectedRecord?.no_hp || "-"}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {selectedRecord?.tanggal_ajuan
                    ? dayjs(selectedRecord.tanggal_ajuan).format(
                        "DD MMMM YYYY HH:mm"
                      )
                    : "-"}
                </Text>
              </Space>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              size="small"
            >
              <Form.Item
                name="status"
                label={<Text style={{ fontSize: 12 }}>Status</Text>}
                rules={[{ required: true, message: "Status wajib dipilih!" }]}
                style={{ marginBottom: 12 }}
              >
                <Select
                  size="small"
                  options={[
                    { label: "Diajukan", value: "DIAJUKAN" },
                    { label: "Diproses", value: "DIPROSES" },
                    { label: "Selesai", value: "SELESAI" },
                    { label: "Ditolak", value: "DITOLAK" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="email_usulan"
                label={<Text style={{ fontSize: 12 }}>Email Usulan</Text>}
                help={
                  <Text style={{ fontSize: 11 }}>
                    Username email (tanpa @jatimprov.go.id)
                  </Text>
                }
                style={{ marginBottom: 12 }}
              >
                <Input
                  size="small"
                  placeholder="contoh: taufiqurrohman.suwarto"
                  addonAfter="@jatimprov.go.id"
                />
              </Form.Item>

              <Form.Item
                name="catatan"
                label={<Text style={{ fontSize: 12 }}>Catatan</Text>}
                style={{ marginBottom: 12 }}
              >
                <TextArea size="small" rows={2} placeholder="Catatan..." />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space
                  style={{ width: "100%", justifyContent: "flex-end" }}
                  size="small"
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setModalOpen(false);
                      form.resetFields();
                      setSelectedRecord(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    htmlType="submit"
                    loading={isUpdating}
                    style={{
                      background: "#ff6b35",
                      borderColor: "#ff6b35",
                    }}
                  >
                    Simpan
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}

export default EmailSubmissionAdmin;
