import { useEmailJatimprovPegawaiAdmin } from "@/hooks/kominfo-submissions";
import {
  IconMail,
  IconUser,
  IconPhone,
  IconSearch,
  IconRefresh,
  IconUpload,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react";
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  Tooltip,
  Upload,
  message,
  Modal,
  Alert,
} from "antd";
import { Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useMutation } from "@tanstack/react-query";
import {
  uploadEmailJatimprovExcel,
  listEmailJatimprovPegawaiAdmin,
} from "@/services/kominfo-submissions.services";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

dayjs.locale("id");

const { Title } = Typography;

function EmailJatimProvAdmin() {
  const router = useRouter();
  const { page = 1, limit = 10, search = "" } = router.query;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Fetch data dengan params dari URL
  const { data, isLoading, isFetching, refetch } =
    useEmailJatimprovPegawaiAdmin({
      search,
      page,
      limit,
    });

  // Upload mutation
  const { mutateAsync: uploadExcel, isPending: isUploading } = useMutation({
    mutationFn: (formData) => uploadEmailJatimprovExcel(formData),
    onSuccess: (response) => {
      message.success(response.message || "Data berhasil diupload!");
      setUploadModalOpen(false);
      setFileList([]);
      refetch();
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Gagal upload file";
      message.error(errorMessage);
    },
  });

  // Handle search
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

  // Handle pagination
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

  // Handle reset
  const handleReset = () => {
    router.push({
      pathname: router.pathname,
      query: {},
    });
  };

  // Handle upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Silakan pilih file Excel terlebih dahulu");
      return;
    }

    const file = fileList[0].originFileObj || fileList[0];

    if (!file) {
      message.error("File tidak valid");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading file:", file.name, file.type, file.size);

    await uploadExcel(formData);
  };

  // Handle download Excel
  const handleDownload = async () => {
    try {
      message.loading({ content: "Sedang mengunduh data...", key: "download" });

      // Fetch all data dengan limit = -1
      const response = await listEmailJatimprovPegawaiAdmin({
        search: search || "",
        page: 1,
        limit: -1,
      });

      if (!response || response.length === 0) {
        message.warning({
          content: "Tidak ada data untuk diunduh",
          key: "download",
        });
        return;
      }

      // Format data untuk Excel
      const excelData = response.map((item, index) => ({
        No: index + 1,
        NIP: item?.nip || "-",
        "Nama Pegawai": item?.user?.nama_master || "-",
        Jabatan: item?.user?.jabatan_master || "-",
        "Unit Kerja": item?.user?.opd_master || "-",
        "Email Jatimprov": item?.email_jatimprov || "-",
        "Nomor HP": item?.no_hp || "-",
        Status: item?.user?.status_master || "-",
        "Tanggal Dibuat": item?.created_at
          ? dayjs(item.created_at).format("DD/MM/YYYY HH:mm:ss")
          : "-",
        "Tanggal Update": item?.updated_at
          ? dayjs(item.updated_at).format("DD/MM/YYYY HH:mm:ss")
          : "-",
      }));

      // Create workbook dan worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Email Jatimprov");

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No
        { wch: 20 }, // NIP
        { wch: 35 }, // Nama Pegawai
        { wch: 35 }, // Jabatan
        { wch: 60 }, // Unit Kerja
        { wch: 35 }, // Email
        { wch: 15 }, // No HP
        { wch: 12 }, // Status
        { wch: 20 }, // Created
        { wch: 20 }, // Updated
      ];

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const fileName = `Email_Jatimprov_${dayjs().format(
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

  // Upload props
  const uploadProps = {
    accept: ".xlsx,.xls",
    maxCount: 1,
    fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("Hanya file Excel (.xlsx, .xls) yang diperbolehkan!");
        return false;
      }

      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  // Table columns
  const columns = [
    {
      title: "Pegawai",
      key: "pegawai",
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space size={6}>
            <Avatar
              src={record?.user?.foto}
              size={32}
              icon={<IconUser size={14} />}
            />
            <div>
              <Text strong style={{ fontSize: 12 }}>
                {record?.user?.nama_master || "-"}
              </Text>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, fontFamily: "monospace" }}
                >
                  NIP: {record?.nip || "-"}
                </Text>
              </div>
            </div>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <IconPhone size={11} style={{ marginRight: 4 }} />
            {record?.no_hp || "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Jabatan & Unit Kerja",
      key: "jabatan",
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 11 }}>
            {record?.user?.jabatan_master || "-"}
          </Text>
          <Text type="secondary" style={{ fontSize: 10, lineHeight: 1.3 }}>
            {record?.user?.opd_master || "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Email Jatimprov",
      dataIndex: "email_jatimprov",
      key: "email_jatimprov",
      width: 280,
      render: (email) => (
        <Space size={4}>
          <IconMail size={14} color="#ff6b35" />
          <Text
            style={{ fontSize: 12, fontFamily: "monospace", color: "#ff6b35" }}
          >
            {email || "-"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date) => (
        <Tooltip
          title={date ? dayjs(date).format("DD MMMM YYYY HH:mm:ss") : "-"}
        >
          <Space size={4}>
            <IconCalendar size={12} />
            <Text style={{ fontSize: 11 }}>
              {date ? dayjs(date).format("DD/MM/YY HH:mm") : "-"}
            </Text>
          </Space>
        </Tooltip>
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
        {/* Header */}
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
                Daftar Email Jatimprov Pegawai
              </Title>
              <Text
                style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 11 }}
              >
                Total: <strong>{data?.total || 0}</strong> email
              </Text>
            </div>
          </Space>
        </div>

        {/* Filters & Actions */}
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
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>

          <Space size="small" wrap>
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              loading={isLoading || isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
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
            <Button
              type="primary"
              size="small"
              icon={<IconUpload size={14} />}
              onClick={() => setUploadModalOpen(true)}
              style={{
                background: "#ff6b35",
                borderColor: "#ff6b35",
              }}
            >
              Upload Excel
            </Button>
          </Space>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 1200 }}
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

      {/* Upload Modal */}
      <Modal
        title={
          <Space size="small">
            <IconUpload size={18} />
            <Text strong style={{ fontSize: 14 }}>
              Upload Data Email Jatimprov
            </Text>
          </Space>
        }
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setFileList([]);
        }}
        footer={[
          <Button
            key="cancel"
            size="small"
            onClick={() => {
              setUploadModalOpen(false);
              setFileList([]);
            }}
          >
            Batal
          </Button>,
          <Button
            key="upload"
            type="primary"
            size="small"
            loading={isUploading}
            onClick={handleUpload}
            style={{
              background: "#ff6b35",
              borderColor: "#ff6b35",
            }}
          >
            Upload
          </Button>,
        ]}
        width={500}
      >
        <Alert
          message="Format File Excel"
          description={
            <div style={{ fontSize: 12 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Kolom yang diperlukan:</strong>
              </p>
              <ul style={{ marginLeft: 16, marginBottom: 0 }}>
                <li>
                  <strong>nip</strong> - Nomor Induk Pegawai (18 digit)
                </li>
                <li>
                  <strong>email_jatimprov</strong> - Email lengkap dengan
                  @jatimprov.go.id
                </li>
                <li>
                  <strong>no_hp</strong> - Nomor HP (opsional)
                </li>
              </ul>
              <p style={{ marginTop: 8, marginBottom: 0 }}>
                <strong>Contoh:</strong>
              </p>
              <code
                style={{
                  background: "#f5f5f5",
                  padding: "4px 8px",
                  borderRadius: 4,
                  display: "block",
                  marginTop: 4,
                  fontSize: 11,
                }}
              >
                199103052019031008 | taufiq@jatimprov.go.id | 08123456789
              </code>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <IconUpload size={48} color="#ff6b35" />
          </p>
          <p className="ant-upload-text">
            Klik atau drag file Excel ke area ini
          </p>
          <p className="ant-upload-hint">
            Hanya file .xlsx atau .xls yang diperbolehkan
          </p>
        </Upload.Dragger>
      </Modal>
    </>
  );
}

export default EmailJatimProvAdmin;
