import { dashboardPensiunJatim } from "@/services/rekon.services";
import {
  CalendarOutlined,
  SearchOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useState } from "react";

const { Title, Text } = Typography;
const format = "MM-YYYY";
const queryFormat = "DD-MM-YYYY";
const DEFAULT_PERIODE = "01-04-2025";

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

function RekonLayananPensiun() {
  const [period, setPeriod] = useState(null);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardPensiunJatim", period],
    queryFn: () =>
      dashboardPensiunJatim({
        periode: period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE,
      }),
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    setPeriod(value);
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
      onFilter: (value, record) =>
        record.nama_unor.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.nama_unor.localeCompare(b.nama_unor),
      width: "30%",
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ color: "#374151" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
      align: "center",
      render: (value) => (
        <Tag color="#6366F1" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "TTD Pertek",
      dataIndex: "jumlah_ttd_pertek",
      sorter: (a, b) => a.jumlah_ttd_pertek - b.jumlah_ttd_pertek,
      align: "center",
      render: (value) => (
        <Tag color="#22C55E" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "SK Berhasil",
      dataIndex: "jumlah_sk_berhasil",
      sorter: (a, b) => a.jumlah_sk_berhasil - b.jumlah_sk_berhasil,
      align: "center",
      render: (value) => (
        <Tag color="#F59E0B" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
  ];

  const statisticItems = [
    {
      title: "Total Usulan",
      value: data?.jumlah_usulan_keseluruhan || 0,
      suffix: "Usulan",
      prefix: <BarChartOutlined />,
      valueStyle: { color: "#6366F1" },
      color: "#EEF2FF",
      borderColor: "#C7D2FE",
      iconBg: "#6366F1",
    },
  ];

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
        <Flex justify="space-between" align="center">
          <div>
            <Title
              level={2}
              style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
            >
              Pensiun
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              Monitoring dan rekapitulasi data pemberhentian pegawai
            </Text>
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => router.push("/rekon/dashboard/pemberhentian")}
            style={{
              borderRadius: "8px",
              fontWeight: 500,
              height: "40px",
              padding: "0 20px",
            }}
          >
            Detail Dashboard
          </Button>
        </Flex>
      </div>

      {/* Control Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        {/* Period Selection */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
                  <CalendarOutlined
                    style={{ color: "white", fontSize: "18px" }}
                  />
                </div>
                <Text strong style={{ color: "#374151", fontSize: "16px" }}>
                  Pilih Periode
                </Text>
              </Flex>

              <DatePicker.MonthPicker
                format={{
                  format,
                  type: "mask",
                }}
                onChange={handleChange}
                defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
                style={{ width: "100%" }}
                size="large"
              />
            </Space>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} md={12}>
          {isLoading ? (
            <Card style={{ borderRadius: "16px" }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ) : (
            <Card
              style={{
                borderRadius: "16px",
                border: `1px solid ${statisticItems[0].borderColor}`,
                backgroundColor: statisticItems[0].color,
                transition: "all 0.3s ease",
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
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: statisticItems[0].iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(statisticItems[0].prefix, {
                      style: { color: "white", fontSize: "18px" },
                    })}
                  </div>
                  <Text strong style={{ color: "#374151", fontSize: "14px" }}>
                    {statisticItems[0].title}
                  </Text>
                </Flex>

                <div>
                  <Statistic
                    value={statisticItems[0].value}
                    valueStyle={{
                      ...statisticItems[0].valueStyle,
                      fontSize: "28px",
                      fontWeight: 700,
                      lineHeight: "32px",
                    }}
                    suffix={
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          fontWeight: 500,
                        }}
                      >
                        {statisticItems[0].suffix}
                      </Text>
                    }
                  />
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* Data Table Section */}
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Flex align="center" justify="space-between">
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
                <TeamOutlined style={{ color: "white", fontSize: "18px" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                Data Perangkat Daerah
              </Title>
              <Badge
                count={data?.data?.length || 0}
                style={{ backgroundColor: "#6366F1" }}
              />
            </Flex>
          </Flex>

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              rowKey={(row) => row?.id_unor}
              dataSource={data?.data}
              loading={isLoading}
              columns={columns}
              pagination={{
                pageSize: 15,
                position: ["bottomRight"],
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} item`,
                style: { marginTop: "24px" },
              }}
              sortDirections={["ascend", "descend"]}
              scroll={{ x: "max-content" }}
              style={{ borderRadius: "8px" }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
}

export default RekonLayananPensiun;
