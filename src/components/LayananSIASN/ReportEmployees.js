import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  downloadEmployeesSIASN,
  showEmployees,
  uploadEmployees,
} from "@/services/siasn-services";
import {
  CloudDownloadOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  MailOutlined,
  IdcardOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Flex,
  Grid,
  Table,
  Typography,
  Upload,
  message,
  Dropdown,
  Space,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Constants
const EMPLOYEE_COLUMNS = [
  {
    title: (
      <Flex align="center" gap={8}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IdcardOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text strong style={{ color: "#1a1a1a" }}>
          🆔 NIP
        </Text>
      </Flex>
    ),
    dataIndex: "nip_baru",
    key: "nip_baru",
    width: 180,
    render: (nip) => (
      <div
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
          border: "1px solid #e8e8e8",
          fontFamily: "monospace",
          fontWeight: 600,
          color: "#1890ff",
        }}
      >
        {nip || "N/A"}
      </div>
    ),
  },
  {
    title: (
      <Flex align="center" gap={8}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text strong style={{ color: "#1a1a1a" }}>
          👤 Nama
        </Text>
      </Flex>
    ),
    dataIndex: "nama",
    key: "nama",
    width: 200,
    render: (nama) => (
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1a1a1a",
        }}
      >
        {nama || "N/A"}
      </Text>
    ),
  },
  {
    title: (
      <Flex align="center" gap={8}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MailOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text strong style={{ color: "#1a1a1a" }}>
          📧 Email
        </Text>
      </Flex>
    ),
    dataIndex: "email",
    key: "email",
    width: 200,
    render: (email) => (
      <Text
        style={{
          fontSize: "12px",
          color: "#666",
          fontStyle: email ? "normal" : "italic",
        }}
      >
        {email || "Tidak ada email"}
      </Text>
    ),
  },
  {
    title: (
      <Flex align="center" gap={8}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CalendarOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text strong style={{ color: "#1a1a1a" }}>
          📅 Tanggal Lahir
        </Text>
      </Flex>
    ),
    dataIndex: "tanggal_lahir",
    key: "tanggal_lahir",
    width: 150,
    render: (tanggal) => (
      <Text
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        {tanggal || "N/A"}
      </Text>
    ),
  },
  {
    title: (
      <Flex align="center" gap={8}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DatabaseOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text strong style={{ color: "#1a1a1a" }}>
          💼 Jenis Jabatan
        </Text>
      </Flex>
    ),
    dataIndex: "jenis_jabatan_nama",
    key: "jenis_jabatan_nama",
    width: 200,
    render: (jabatan) => (
      <Text
        style={{
          fontSize: "12px",
          color: "#1a1a1a",
          fontWeight: 500,
        }}
      >
        {jabatan || "N/A"}
      </Text>
    ),
  },
];

// Utility Functions
const createFormData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

const getUploadProps = (fileList, setFileList) => ({
  beforeUpload: (file) => {
    setFileList([file]);
    return false;
  },
  fileList,
  showUploadList: {
    downloadIcon: false,
    previewIcon: false,
    removeIcon: false,
    showDownloadIcon: false,
    showPreviewIcon: false,
    showRemoveIcon: false,
  },
  multiple: false,
  maxCount: 1,
});

// Upload Excel Component
const UploadExcel = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [fileList, setFileList] = useState([]);

  const { mutateAsync, isLoading } = useMutation((data) =>
    uploadEmployees(data)
  );

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = createFormData(file);

      await mutateAsync(formData);
      queryClient.invalidateQueries("getAllEmployeesSiasn");

      navigateToFirstPage(router);
      message.success("Berhasil mengunggah file");
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunggah file");
    }
  };

  const navigateToFirstPage = (router) => {
    router.push({
      query: {
        ...router.query,
        page: 1,
      },
    });
  };

  const uploadProps = getUploadProps(fileList, setFileList);
  const isUploadDisabled = isLoading || fileList.length === 0;

  return (
    <Flex gap={12} align="center" wrap>
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          style={{
            borderColor: "#FF4500",
            color: "#FF4500",
            borderRadius: "8px",
          }}
        >
          Select File SIASN Employees
        </Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={isUploadDisabled}
        loading={isLoading}
        style={{
          background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
          borderColor: "#FF4500",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        {isLoading ? "Uploading..." : "Start Upload"}
      </Button>
    </Flex>
  );
};

// Hook for employees data
const useEmployeesData = () => {
  const router = useRouter();

  return useQuery(
    ["getAllEmployeesSiasn", router.query],
    () => showEmployees(router.query),
    {
      enabled: !!router.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
};

// Download Hook for Excel and CSV
const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ downloadFormat }) =>
      downloadEmployeesSIASN({ downloadFormat }),
    onSuccess: (data, variables) => {
      const { downloadFormat } = variables;
      const isExcel = downloadFormat === "excel";

      const blob = new Blob([data], {
        type: isExcel
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv",
      });

      const filename = isExcel
        ? "data-pegawai-siasn.xlsx"
        : `data-pegawai-siasn-${new Date().toISOString().split("T")[0]}.csv`;

      saveAs(blob, filename);
      message.success(`Berhasil mengunduh file ${isExcel ? "Excel" : "CSV"}`);
    },
    onError: (error) => {
      console.error("Download error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Gagal mengunduh file. Silakan coba lagi.";
      message.error(errorMessage);
    },
    retry: false,
  });
};

// Pagination Handler
const usePaginationHandler = () => {
  const router = useRouter();

  const handlePageChange = (page) => {
    router.push({
      query: {
        ...router.query,
        page,
      },
    });
  };

  return handlePageChange;
};

// Pagination Configuration
const createPaginationConfig = (data, handlePageChange) => ({
  showSizeChanger: false,
  position: ["bottomRight", "topRight"],
  current: data?.pagination?.page,
  showTotal: (total, range) => (
    <Text style={{ color: "#666", fontSize: "14px" }}>
      Menampilkan{" "}
      <Text strong style={{ color: "#FF4500" }}>
        {range[0]}-{range[1]}
      </Text>{" "}
      dari{" "}
      <Text strong style={{ color: "#FF4500" }}>
        {total.toLocaleString()}
      </Text>{" "}
      pegawai
    </Text>
  ),
  total: data?.pagination?.total,
  pageSize: data?.pagination?.limit,
  onChange: handlePageChange,
});

// Main Component
function ReportEmployees() {
  useScrollRestoration();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, isFetching, refetch } = useEmployeesData();
  const handlePageChange = usePaginationHandler();
  const { mutate: download, isLoading: isDownloadingLoading } =
    useDownloadFile();

  const paginationConfig = createPaginationConfig(data, handlePageChange);
  const isTableLoading = isLoading || isFetching;

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={16} wrap justify="space-between">
          <Flex align="center" gap={16}>
            <div
              style={{
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                backgroundColor: "#FF4500",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatabaseOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              />
            </div>
            <div>
              <Title
                level={isMobile ? 4 : 3}
                style={{ margin: 0, color: "#1a1a1a" }}
              >
                👥 Data Pegawai SIASN
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "14px" }}
              >
                Upload dan kelola data pegawai SIASN
              </Text>
            </div>
          </Flex>
        </Flex>
      </Card>

      {/* Upload Section */}
      <Card
        style={{
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex vertical gap={12}>
          <Flex align="center" gap={8}>
            <UploadOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
            <Text strong style={{ color: "#1a1a1a", fontSize: "16px" }}>
              📤 Upload Data Pegawai
            </Text>
          </Flex>
          <UploadExcel />
        </Flex>
      </Card>

      {/* Actions */}
      <Card
        style={{
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Flex align="center" gap={8}>
            <DatabaseOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
            <Text strong style={{ color: "#1a1a1a", fontSize: "16px" }}>
              ⚡ Aksi Data
            </Text>
          </Flex>

          <Flex gap={8}>
            <Button
              icon={<SyncOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
              style={{
                borderColor: "#1890ff",
                color: "#1890ff",
                borderRadius: "8px",
              }}
            >
              Refresh
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "excel",
                    label: "📊 Download Excel",
                    icon: <CloudDownloadOutlined />,
                    onClick: () => {
                      if (isDownloadingLoading) return;
                      download({ downloadFormat: "excel" });
                    },
                  },
                  {
                    key: "csv",
                    label: "📄 Download CSV",
                    icon: <CloudDownloadOutlined />,
                    onClick: () => {
                      if (isDownloadingLoading) return;
                      download({ downloadFormat: "csv" });
                    },
                  },
                  {
                    key: "excel-csv",
                    label: "📄 Download Excel CSV",
                    icon: <CloudDownloadOutlined />,
                    onClick: () => {
                      if (isDownloadingLoading) return;
                      download({ downloadFormat: "excel-csv" });
                    },
                  },
                ],
              }}
              disabled={isDownloadingLoading}
            >
              <Button
                type="primary"
                loading={isDownloadingLoading}
                disabled={isDownloadingLoading}
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                <CloudDownloadOutlined />
                {!isDownloadingLoading && "Download"}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Flex>
        </Flex>
      </Card>

      {/* Stats Card */}
      {data && (
        <Card
          style={{
            marginBottom: "20px",
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Flex justify="space-around" align="center" wrap>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#FF4500",
                }}
              >
                {data.pagination?.total?.toLocaleString() || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Pegawai
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#52c41a",
                }}
              >
                {data.pagination?.page || 1}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Halaman
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#1890ff",
                }}
              >
                {data.pagination?.limit || 10}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Per Halaman
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#722ed1",
                }}
              >
                {data?.data?.length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Ditampilkan
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Table */}
      <Card
        style={{
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          columns={EMPLOYEE_COLUMNS}
          pagination={paginationConfig}
          rowKey={(row) => row?.id}
          dataSource={data?.data}
          loading={isTableLoading}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 800 : undefined }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item:hover a {
          color: #ff4500 !important;
        }

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportEmployees;
