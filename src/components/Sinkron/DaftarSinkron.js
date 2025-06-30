import { refSinkronisasi } from "@/services/sync.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Flex, Grid, Table, Tag, Typography } from "antd";
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  SyncOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function DaftarSinkron() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["daftar-sinkron"],
    () => refSinkronisasi(),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const columns = [
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
            <DatabaseOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            📱 Aplikasi
          </Text>
        </Flex>
      ),
      dataIndex: "aplikasi",
      key: "aplikasi",
      width: isMobile ? 120 : isTablet ? 150 : 200,
      render: (aplikasi) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF4500";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 69, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e8e8e8";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Flex align="center" gap={8}>
            <div
              style={{
                width: isMobile ? "32px" : "36px",
                height: isMobile ? "32px" : "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(255, 69, 0, 0.3)",
              }}
            >
              <DatabaseOutlined style={{ color: "white", fontSize: "14px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                }}
              >
                {aplikasi || "N/A"}
              </Text>
            </div>
          </Flex>
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
            <SyncOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🔄 Layanan
          </Text>
        </Flex>
      ),
      dataIndex: "layanan",
      key: "layanan",
      width: isMobile ? 150 : isTablet ? 200 : 250,
      render: (layanan) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f0f5ff 100%)",
            border: "1px solid #d3e8ff",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#1890ff";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(24, 144, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d3e8ff";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Tag
            style={{
              borderRadius: "16px",
              fontSize: isMobile ? "10px" : "12px",
              fontWeight: 600,
              padding: "4px 12px",
              border: "1px solid #1890ff",
              backgroundColor: "#f0f5ff",
              color: "#1890ff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              width: "fit-content",
            }}
            icon={<SyncOutlined style={{ fontSize: "10px" }} />}
          >
            {layanan || "Unknown"}
          </Tag>
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
              borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClockCircleOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ⏰ Update Terakhir
          </Text>
        </Flex>
      ),
      key: "updated_at",
      width: isMobile ? 180 : isTablet ? 220 : 280,
      render: (_, record) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#52c41a";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(82, 196, 26, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e8e8e8";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Flex vertical align="center" gap={6}>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                color: "white",
                fontSize: isMobile ? "10px" : "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s ease",
                boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {dayjs(record.updated_at).locale("id").fromNow()}
            </div>
            <Text
              style={{
                fontSize: isMobile ? "9px" : "10px",
                color: "#666",
                fontWeight: 500,
              }}
            >
              {dayjs(record.updated_at).format("DD/MM/YY • HH:mm")}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? "8px" : "9px",
                color: "#999",
                fontWeight: 400,
              }}
            >
              {dayjs(record.updated_at).locale("id").format("dddd")}
            </Text>
          </Flex>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align="center"
          gap={isMobile ? 12 : 16}
          wrap
          justify="space-between"
        >
          <Flex align="center" gap={isMobile ? 12 : 16}>
            <div
              style={{
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                backgroundColor: "#FF4500",
                borderRadius: isMobile ? "8px" : "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SyncOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={isMobile ? 4 : 3}
                style={{ margin: 0, color: "#1a1a1a" }}
              >
                🔄 Daftar Status Sinkronisasi
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "14px" }}
              >
                Monitoring status sinkronisasi aplikasi dan layanan
              </Text>
            </div>
          </Flex>

          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              borderColor: "#FF4500",
              borderRadius: "8px",
              fontWeight: 600,
              boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(255, 69, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 4px rgba(255, 69, 0, 0.3)";
            }}
            size={isMobile ? "small" : "middle"}
          >
            {isMobile ? "Refresh" : "🔄 Refresh Data"}
          </Button>
        </Flex>
      </Card>

      {/* Stats Card */}
      {data && (
        <Card
          style={{
            marginBottom: isMobile ? "12px" : "20px",
            borderRadius: isMobile ? "8px" : "12px",
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
                {data?.length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Layanan
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
                {new Set(data?.map((item) => item.aplikasi)).size || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Aplikasi
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
                {data?.filter(
                  (item) => dayjs().diff(dayjs(item.updated_at), "hours") <= 24
                ).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Update Hari Ini
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
                {data?.filter(
                  (item) => dayjs().diff(dayjs(item.updated_at), "hours") > 24
                ).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Perlu Update
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Table */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          pagination={false}
          dataSource={data}
          loading={isLoading || isFetching}
          rowKey={(row) => row?.id}
          columns={columns}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 600 : isTablet ? 800 : undefined }}
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

export default DaftarSinkron;
