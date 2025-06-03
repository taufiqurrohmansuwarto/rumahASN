import { dashboardConsistency } from "@/services/dimensi-consistency.services";
import {
  BarChartOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Empty,
  Flex,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Badge,
} from "antd";
import { useRouter } from "next/router";
import React from "react";

const { Text, Title } = Typography;

function DashboardDimensiConsistency() {
  const router = useRouter();
  const { data, isLoading } = useQuery(["dashboard-dimensi-consistency"], () =>
    dashboardConsistency()
  );

  const handleClick = (key) => {
    router.push(`/rekon/anomali/consistency/${key}`);
  };

  const columns = [
    {
      title: "Indikator Konsistensi",
      dataIndex: "label",
      key: "label",
      render: (text) => (
        <Text strong style={{ color: "#374151", fontSize: "14px" }}>
          {text}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: "Data Inkonsisten",
      key: "value",
      dataIndex: "value",
      align: "center",
      render: (_, record) => (
        <Tooltip title={`SIMASTER: ${record.value} | SIASN: ${record.siasn}`}>
          <Tag
            color={record.value > 0 ? "error" : "success"}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Space size={4}>
              <ExclamationCircleOutlined />
              <span>{record.value}</span>
              <span>/</span>
              <span>{record.siasn}</span>
            </Space>
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Bobot",
      dataIndex: "bobot",
      key: "bobot",
      align: "center",
      render: (value) => (
        <Tooltip title={`Bobot indikator: ${value}%`}>
          <Badge
            count={`${value}%`}
            style={{
              backgroundColor: "#6366F1",
              fontSize: "12px",
              fontWeight: 500,
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleClick(record.id)}
          style={{
            borderRadius: "8px",
            fontWeight: 500,
            fontSize: "12px",
            height: "32px",
          }}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#FAFAFB",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
        >
          Dimensi Consistency
        </Title>
        <Text type="secondary" style={{ fontSize: "16px", lineHeight: "24px" }}>
          Monitoring dan analisis konsistensi data ASN untuk memastikan
          keseragaman informasi
        </Text>
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
              Detail Indikator Consistency
            </Title>
            <Badge
              count={data?.length || 0}
              style={{ backgroundColor: "#6366F1" }}
            />
          </Flex>

          {/* Alert */}
          <Alert
            title="Informasi Penting"
            color="purple"
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: "8px" }}
          >
            Dimensi Consistency mengukur keseragaman dan konsistensi data ASN.
            Semakin konsisten data, semakin reliable informasi yang dihasilkan.
          </Alert>

          {/* Table */}
          <div style={{ marginTop: "16px" }}>
            <Table
              loading={isLoading}
              dataSource={data}
              columns={columns}
              rowKey="id"
              size="middle"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Menampilkan ${range[0]}-${range[1]} dari ${total} indikator`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                        Tidak ada data indikator yang tersedia
                      </Text>
                    }
                  />
                ),
              }}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default DashboardDimensiConsistency;
