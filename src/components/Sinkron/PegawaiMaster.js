import useScrollRestoration from "@/hooks/useScrollRestoration";
import { downloadPegawaiMaster, pegawaiMaster } from "@/services/sync.services";
import {
  CloudDownloadOutlined,
  SyncOutlined,
  UserOutlined,
  DatabaseOutlined,
  IdcardOutlined,
  HomeOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Grid,
  message,
  Table,
  Typography,
} from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PegawaiMaster = () => {
  useScrollRestoration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["pegawai-master", page, limit],
    queryFn: () => pegawaiMaster({ page, limit }),
    enabled: !!page && !!limit,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: downloadData, isLoading: isDownloading } = useMutation({
    mutationFn: () => downloadPegawaiMaster(),
    onSuccess: (data) => {
      const blob = new Blob([data], {
        type: "text/csv",
      });
      saveAs(blob, "data-pegawai-master.csv");
      message.success("Data berhasil diunduh");
    },
    onError: (error) => {
      console.log(error);
      const msg = error?.response?.data?.message || "Gagal mengunduh data";
      message.error(msg);
    },
  });

  const handleChangePage = (page, limit) => {
    router.push(
      `/apps-managements/sync/pegawai-master?page=${page}&limit=${limit}`
    );
  };

  const handleDownload = () => {
    downloadData();
  };

  const columns = [
    {
      title: (
        <Flex align="center" gap={8}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            📷 Foto
          </Text>
        </Flex>
      ),
      key: "foto",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div
          style={{
            padding: "8px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Avatar
            src={record.foto}
            alt="Foto"
            size={isMobile ? 32 : 40}
            style={{
              border: "2px solid #FF4500",
              boxShadow: "0 2px 8px rgba(255, 69, 0, 0.3)",
            }}
            icon={<UserOutlined />}
          />
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
      dataIndex: "nama_master",
      key: "nama_master",
      width: isMobile ? 150 : 200,
      render: (nama) => (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #fff 0%, #f0f5ff 100%)",
            border: "1px solid #d3e8ff",
          }}
        >
          <Text
            style={{
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            {nama || "N/A"}
          </Text>
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
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
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
      dataIndex: "nip_master",
      key: "nip_master",
      width: isMobile ? 150 : 180,
      render: (nip) => (
        <div
          style={{
            padding: "6px 10px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #fff 0%, #f6ffed 100%)",
            border: "1px solid #b7eb8f",
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#52c41a",
            textAlign: "center",
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
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CrownOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            💼 Jabatan
          </Text>
        </Flex>
      ),
      dataIndex: "jabatan_master",
      key: "jabatan_master",
      width: isMobile ? 180 : 250,
      render: (jabatan) => (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #fff 0%, #f9f0ff 100%)",
            border: "1px solid #d3adf7",
          }}
        >
          <Text
            style={{
              fontSize: isMobile ? "11px" : "12px",
              color: "#722ed1",
              fontWeight: 500,
            }}
          >
            {jabatan || "N/A"}
          </Text>
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
              background: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HomeOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🏢 Perangkat Daerah
          </Text>
        </Flex>
      ),
      dataIndex: "opd_master",
      key: "opd_master",
      width: isMobile ? 200 : 300,
      render: (opd) => (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #fff 0%, #fff7e6 100%)",
            border: "1px solid #ffcc99",
          }}
        >
          <Text
            style={{
              fontSize: isMobile ? "11px" : "12px",
              color: "#fa8c16",
              fontWeight: 500,
            }}
          >
            {opd || "N/A"}
          </Text>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card
        style={{
          borderRadius: "12px",
          border: "1px solid #ff4d4f",
          backgroundColor: "#fff2f0",
        }}
      >
        <Text type="danger" style={{ fontSize: "16px", fontWeight: 600 }}>
          Error: {error.message}
        </Text>
      </Card>
    );
  }

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
                👥 Data Pegawai Master
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "14px" }}
              >
                Kelola dan monitoring data pegawai master
              </Text>
            </div>
          </Flex>
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
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={handleDownload}
              loading={isDownloading}
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                borderColor: "#52c41a",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              {isMobile ? "Download" : "Download CSV"}
            </Button>
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
                {data?.total?.toLocaleString() || 0}
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
                {page}
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
                {limit}
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
          rowKey={(record) => record.id || record.nama_master}
          pagination={{
            onChange: (page, limit) => handleChangePage(page, limit),
            showSizeChanger: false,
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
            total: data?.total,
            current: parseInt(page),
            pageSize: parseInt(limit),
          }}
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading || isFetching}
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
};

export default PegawaiMaster;
