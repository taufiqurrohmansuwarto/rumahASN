import { artiStatus } from "@/utils/client-utils";
import {
  QuestionCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Table,
  Tooltip,
  Card,
  Typography,
  Descriptions,
  Tag,
  Grid,
  Space,
} from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function TableUsulan({ data, isLoading }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getStatusColor = (status) => {
    const statusMap = {
      USULAN_DIBUAT: "#1890FF",
      USULAN_DISETUJUI: "#52C41A",
      USULAN_DITOLAK: "#FF4500",
      USULAN_SELESAI: "#52C41A",
      USULAN_DIVERIFIKASI: "#722ED1",
      USULAN_DIVALIDASI: "#13C2C2",
    };
    return statusMap[status] || "#787C7E";
  };

  const getStatusIcon = (status) => {
    if (status?.includes("SELESAI") || status?.includes("DISETUJUI")) {
      return <CheckCircleOutlined style={{ color: "#52C41A" }} />;
    }
    return <FileTextOutlined style={{ color: getStatusColor(status) }} />;
  };

  const columns = [
    {
      title: "Data Usulan",
      key: "data",
      responsive: ["xs"],
      render: (row) => {
        return (
          <Card
            size="small"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #EDEFF1",
              borderRadius: "8px",
              margin: "4px 0",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <Descriptions layout="vertical" size="small" column={1}>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    👤 Nama Pegawai
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {row?.nama}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    🆔 NIP
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  {row?.nip}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    🏢 Jenis Layanan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Tag
                  color="blue"
                  style={{ borderRadius: "4px", fontSize: "11px" }}
                >
                  {row?.jenis_layanan_nama}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📊 Status Usulan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Space>
                  <Tag
                    icon={getStatusIcon(row?.status_usulan)}
                    color={getStatusColor(row?.status_usulan)}
                    style={{ borderRadius: "4px", fontSize: "11px" }}
                  >
                    {row?.status_usulan?.replace("USULAN_", "")}
                  </Tag>
                  <Tooltip
                    title={artiStatus(row?.status_usulan)}
                    placement="top"
                  >
                    <QuestionCircleOutlined
                      style={{
                        color: "#1890FF",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    />
                  </Tooltip>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📅 Tanggal Usulan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#52C41A",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {row?.tanggal_usulan}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📝 Keterangan
                  </Text>
                }
              >
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: "12px",
                    lineHeight: "1.4",
                  }}
                >
                  {row?.keterangan || "Tidak ada keterangan"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      },
    },
    {
      title: "Nama",
      dataIndex: "nama",
      responsive: ["sm"],
      render: (text) => (
        <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: "NIP",
      dataIndex: "nip",
      responsive: ["sm"],
      render: (text) => (
        <Text style={{ color: "#787C7E", fontFamily: "monospace" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan_nama",
      responsive: ["sm"],
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: "4px" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Status Usulan",
      responsive: ["sm"],
      key: "status_usulan",
      render: (row) => (
        <Space>
          <Tag
            icon={getStatusIcon(row?.status_usulan)}
            color={getStatusColor(row?.status_usulan)}
            style={{ borderRadius: "4px" }}
          >
            {row?.status_usulan?.replace("USULAN_", "")}
          </Tag>
          <Tooltip title={artiStatus(row?.status_usulan)} placement="top">
            <QuestionCircleOutlined
              style={{ color: "#1890FF", cursor: "pointer" }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Tanggal Usulan",
      dataIndex: "tanggal_usulan",
      responsive: ["sm"],
      render: (text) => (
        <Text style={{ color: "#52C41A", fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      responsive: ["sm"],
      render: (text) => (
        <Text style={{ color: "#787C7E" }}>
          {text || "Tidak ada keterangan"}
        </Text>
      ),
    },
  ];

  return (
    <Table
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
      }}
      rowKey={(row) => row?.id}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} usulan`,
        style: { marginTop: "16px" },
      }}
      columns={columns}
      dataSource={data}
      loading={isLoading}
      size="small"
      rowClassName={(record, index) =>
        index % 2 === 0 ? "" : "table-row-light"
      }
    />
  );
}

export default TableUsulan;
