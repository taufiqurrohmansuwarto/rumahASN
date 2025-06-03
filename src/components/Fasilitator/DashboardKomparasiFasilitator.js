import { compareEmployeesSimasterSiasn } from "@/services/master.services";
import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Table,
  Tooltip,
  Typography,
  Flex,
  Badge,
} from "antd";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;

const GrafikFasilitatorKomparasi = ({ data }) => {
  const router = useRouter();

  const gotoDetailEmployee = (nip) => {
    const url = `/apps-managements/integrasi/siasn/${nip}`;
    router.push(url);
  };

  const detailColumns = [
    {
      title: "NIP",
      dataIndex: "nip_master",
    },
    {
      title: "Nama",
      dataIndex: "nama_master",
    },
    {
      title: "Aksi",
      key: "detail",
      render: (_, row) => (
        <a onClick={() => gotoDetailEmployee(row.nip_master)}>Detail</a>
      ),
    },
  ];

  const columns = [
    {
      title: "Jenis",
      key: "type",
      render: (_, row) => {
        return (
          <Space>
            <span>{row.type}</span>
            <Tooltip title={row?.description} color="pink">
              <QuestionCircleOutlined style={{ cursor: "pointer" }} />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Jumlah",
      dataIndex: "value",
    },
  ];

  const downloadData = (type, data) => {
    const hasil = data?.map((d) => ({
      nama: d.nama_master,
      nip: d.nip_master,
    }));
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, "data.xlsx");
  };

  const statisticItems = [
    {
      title: "Total Pegawai SIASN",
      value: data?.totalPegawaiSIASN || 0,
      prefix: <UserOutlined />,
      valueStyle: { color: "#6366F1" },
      color: "#EEF2FF",
      borderColor: "#C7D2FE",
      iconBg: "#6366F1",
    },
    {
      title: "Total Pegawai SIMASTER",
      value: data?.totalPegawaiSimaster || 0,
      prefix: <DatabaseOutlined />,
      valueStyle: { color: "#22C55E" },
      color: "#F0FDF4",
      borderColor: "#BBF7D0",
      iconBg: "#22C55E",
    },
  ];

  return (
    <div>
      {/* Statistics Section */}
      <div style={{ marginBottom: "24px" }}>
        <Row gutter={[24, 24]}>
          {statisticItems.map((item, index) => (
            <Col xs={24} sm={12} lg={12} key={index}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: `1px solid ${item.borderColor}`,
                  backgroundColor: item.color,
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                bodyStyle={{ padding: "24px" }}
                hoverable
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {/* Header */}
                  <Flex align="center" gap={12}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        backgroundColor: item.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {React.cloneElement(item.prefix, {
                        style: { color: "white", fontSize: "18px" },
                      })}
                    </div>
                    <Text strong style={{ color: "#374151", fontSize: "14px" }}>
                      {item.title}
                    </Text>
                  </Flex>

                  {/* Statistic */}
                  <div>
                    <Statistic
                      value={item.value}
                      valueStyle={{
                        ...item.valueStyle,
                        fontSize: "28px",
                        fontWeight: 700,
                        lineHeight: "32px",
                      }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Table Section */}
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Header */}
          <Flex align="center" gap={12}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "#6366F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChartOutlined style={{ color: "white", fontSize: "18px" }} />
            </div>
            <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
              Data Komparasi Pegawai
            </Title>
            <Badge
              count={data?.grafik?.length || 0}
              style={{ backgroundColor: "#6366F1" }}
            />
          </Flex>

          {/* Alert */}
          <Alert
            title="Informasi Penting"
            color="yellow"
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: "8px" }}
          >
            Data diperbarui otomatis setiap hari oleh BKD Provinsi Jawa Timur.
            Perubahan data tidak ditampilkan secara realtime dan memerlukan
            waktu untuk sinkronisasi.
          </Alert>

          {/* Table */}
          <div style={{ marginTop: "16px" }}>
            <Table
              rowKey={(record) => record.type}
              expandable={{
                expandedRowRender: (record) => (
                  <Card
                    extra={
                      <a
                        onClick={() =>
                          downloadData(record?.type, record?.detail)
                        }
                        style={{
                          color: "#6366F1",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        📥 Unduh Data
                      </a>
                    }
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      marginTop: "12px",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Table
                      rowKey={(record) => record.nip_master}
                      dataSource={record.detail}
                      columns={detailColumns}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} dari ${total} pegawai`,
                      }}
                      size="small"
                    />
                  </Card>
                ),
                rowExpandable: (record) =>
                  record.detail && record.detail.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <span
                    onClick={(e) => onExpand(record, e)}
                    style={{
                      cursor: "pointer",
                      color: "#6366F1",
                      fontWeight: 500,
                      fontSize: "12px",
                    }}
                  >
                    {expanded ? "🔽 Tutup" : "🔍 Lihat Detail"}
                  </span>
                ),
              }}
              size="middle"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Menampilkan ${range[0]}-${range[1]} dari ${total} kategori`,
              }}
              dataSource={data?.grafik}
              columns={columns}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

function DashboardKomparasiFasilitator() {
  const { data, isLoading } = useQuery(
    ["dashboard-compare-siasn"],
    () => compareEmployeesSimasterSiasn(),
    {}
  );

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
        >
          Dashboard Komparasi Fasilitator
        </Title>
        <Text type="secondary" style={{ fontSize: "16px", lineHeight: "24px" }}>
          Perbandingan data pegawai antara SIASN dan SIMASTER untuk fasilitator
        </Text>
      </div>

      {data && <GrafikFasilitatorKomparasi data={data} />}
    </div>
  );
}

export default DashboardKomparasiFasilitator;
