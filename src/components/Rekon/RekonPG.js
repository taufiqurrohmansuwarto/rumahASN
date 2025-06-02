import React from "react";
import { getRekonPGDashboard } from "@/services/rekon.services";
import {
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Space,
  Table,
  Typography,
  Skeleton,
  Flex,
  Badge,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const { Title, Text } = Typography;

function RekonPG() {
  const [tglUsulan, setTglUsulan] = useState(dayjs());
  const [query, setQuery] = useState({});
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekonPGDashboard", query],
    queryFn: () => getRekonPGDashboard(query),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const router = useRouter();

  const handleChange = (value) => {
    setTglUsulan(value);
    const formattedDate = dayjs(value).format("DD-MM-YYYY");
    setQuery({ tgl_usulan: formattedDate });
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
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
              Pencantuman Gelar
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              Monitoring data pencantuman gelar pegawai
            </Text>
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => router.push("/rekon/dashboard/pg")}
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
        {/* Date Selection */}
        <Col xs={24} md={24}>
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
                  Tanggal Usulan
                </Text>
              </Flex>

              <DatePicker
                value={tglUsulan}
                onChange={handleChange}
                format={{ format: "DD-MM-YYYY", type: "mask" }}
                style={{ width: "100%" }}
                size="large"
              />
            </Space>
          </Card>
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

          {isLoading || isFetching ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <Table
              rowKey={(record) => record.id_unor}
              dataSource={data?.data}
              loading={isLoading || isFetching}
              columns={columns}
              pagination={{
                pageSize: 15,
                position: ["bottomRight"],
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} item`,
                style: { marginTop: "24px" },
              }}
              scroll={{ x: "max-content" }}
              style={{ borderRadius: "8px" }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
}

export default RekonPG;
