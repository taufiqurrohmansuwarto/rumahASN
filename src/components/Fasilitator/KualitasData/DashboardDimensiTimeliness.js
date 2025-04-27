import { dashboardTimeliness } from "@/services/dimensi-timeliness.services";
import {
  BarChartOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Divider,
  Empty,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";

const { Text, Title } = Typography;

function DashboardDimensiTimeliness() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["dashboard-dimensi-timeliness"], () =>
    dashboardTimeliness()
  );

  // Menghitung total data bermasalah dan total pegawai
  const totalBermasalah = data?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalPegawai = data?.[0]?.total_pegawai || 0;
  const persentaseBermasalah = totalPegawai
    ? (totalBermasalah / totalPegawai) * 100
    : 0;

  const handleClick = (key) => {
    router.push(`/rekon/anomali/timeliness/${key}`);
  };

  const columns = [
    {
      title: (
        <Space>
          <BarChartOutlined />
          <span>Indikator</span>
        </Space>
      ),
      dataIndex: "label",
      key: "label",
      render: (text) => (
        <Text strong type="primary">
          {text}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: (
        <Space>
          <InfoCircleOutlined />
          <span>Data Bermasalah</span>
        </Space>
      ),
      dataIndex: "value",
      key: "value",
      align: "right",
      render: (value) => (
        <Tag color={value > 0 ? "error" : "success"}>
          {value?.toLocaleString("id-ID")}
        </Tag>
      ),
    },
    {
      title: "Bobot",
      dataIndex: "bobot",
      key: "bobot",
      align: "center",
      render: (value) => (
        <Tooltip title={`Bobot indikator: ${value}`}>
          <Tag color="blue">{value}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Tindakan",
      key: "aksi",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleClick(record.id)}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <BarChartOutlined />
        <Title level={4} style={{ margin: 0 }}>
          Dimensi Timeliness
        </Title>
        <Tooltip title="Dimensi Timeliness mengukur kecepatan pengiriman data ASN">
          <InfoCircleOutlined />
        </Tooltip>
      </Space>

      <Divider>
        <Space>
          <InfoCircleOutlined />
          <Text strong>Detail Indikator Timeliness</Text>
        </Space>
      </Divider>

      <Table
        loading={isLoading}
        pagination={false}
        dataSource={data}
        columns={columns}
        rowKey="id"
        size="middle"
        scroll={{ x: "max-content" }}
        bordered
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Tidak ada data yang tersedia"
            />
          ),
        }}
      />
    </div>
  );
}

export default DashboardDimensiTimeliness;
