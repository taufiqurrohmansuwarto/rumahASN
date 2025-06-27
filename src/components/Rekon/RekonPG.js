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
  Grid,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RekonPG() {
  const [tglUsulan, setTglUsulan] = useState(dayjs());
  const [query, setQuery] = useState({});
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekonPGDashboard", query],
    queryFn: () => getRekonPGDashboard(query),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = (value) => {
    setTglUsulan(value);
    const formattedDate = dayjs(value).format("DD-MM-YYYY");
    setQuery({ tgl_usulan: formattedDate });
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
      width: "60%",
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
        <Tag color="#FF4500" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align="center"
          gap={isMobile ? 10 : 12}
          wrap={isMobile}
          justify={isMobile ? "center" : "space-between"}
        >
          <Flex align="center" gap={isMobile ? 10 : 12}>
            <div
              style={{
                width: isMobile ? "36px" : "40px",
                height: isMobile ? "36px" : "40px",
                backgroundColor: "#FF4500",
                borderRadius: isMobile ? "6px" : "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileTextOutlined
                style={{ color: "white", fontSize: isMobile ? "18px" : "20px" }}
              />
            </div>
            <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
              <Title
                level={isMobile ? 5 : 4}
                style={{
                  margin: 0,
                  color: "#1a1a1a",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              >
                📋 Pencantuman Gelar
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? "11px" : "13px",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                Monitoring data pencantuman gelar pegawai
              </Text>
            </div>
          </Flex>

          {!isMobile && (
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => router.push("/rekon/dashboard/pg")}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "8px",
                fontWeight: 500,
                height: isTablet ? "36px" : "40px",
                padding: "0 20px",
              }}
            >
              Detail Dashboard
            </Button>
          )}
        </Flex>

        {isMobile && (
          <div style={{ marginTop: "12px" }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => router.push("/rekon/dashboard/pg")}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "8px",
                fontWeight: 500,
                height: "36px",
                width: "100%",
              }}
            >
              Detail Dashboard
            </Button>
          </div>
        )}
      </Card>

      {/* Date Selection */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Flex align="center" gap={6}>
            <CalendarOutlined style={{ fontSize: "14px", color: "#FF4500" }} />
            <Text
              strong
              style={{
                color: "#1a1a1a",
                fontSize: isMobile ? "13px" : "15px",
              }}
            >
              Tanggal Usulan
            </Text>
          </Flex>

          <DatePicker
            value={tglUsulan}
            onChange={handleChange}
            format={{ format: "DD-MM-YYYY", type: "mask" }}
            style={{ width: "100%" }}
            size={isMobile ? "middle" : "large"}
          />
        </Space>
      </Card>

      {/* Data Table Section */}
      <Card
        style={{
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
        }}
      >
        {isLoading || isFetching ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : data?.data && data.data.length > 0 ? (
          <Space
            direction="vertical"
            size={isMobile ? 16 : 20}
            style={{ width: "100%" }}
          >
            <Flex
              align="center"
              gap={8}
              wrap={isMobile}
              justify="space-between"
            >
              <Flex align="center" gap={8}>
                <div
                  style={{
                    width: isMobile ? "32px" : "36px",
                    height: isMobile ? "32px" : "36px",
                    borderRadius: "6px",
                    backgroundColor: "#FF4500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TeamOutlined
                    style={{
                      color: "white",
                      fontSize: isMobile ? "16px" : "18px",
                    }}
                  />
                </div>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1a1a1a",
                    fontSize: isMobile ? "14px" : "18px",
                  }}
                >
                  📊 Data Perangkat Daerah
                </Title>
              </Flex>

              <div
                style={{
                  backgroundColor: "#FF4500",
                  color: "white",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: "16px",
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: 600,
                  minWidth: "fit-content",
                }}
              >
                Total: {data?.data?.length || 0}
              </div>
            </Flex>

            <div
              style={{
                padding: isMobile ? "4px 0" : "8px 0",
                overflow: "hidden",
              }}
            >
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
                size={isMobile ? "small" : "middle"}
              />
            </div>
          </Space>
        ) : (
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              padding: isMobile ? "30px 20px" : "40px 20px",
              color: "#999",
            }}
          >
            <FileTextOutlined
              style={{
                color: "#d9d9d9",
                fontSize: isMobile ? "40px" : "48px",
                marginBottom: "12px",
              }}
            />
            <Title
              level={isMobile ? 5 : 4}
              style={{ color: "#999", margin: "0 0 6px 0" }}
            >
              Tidak ada data tersedia
            </Title>
            <Text
              type="secondary"
              style={{
                textAlign: "center",
                fontSize: isMobile ? "12px" : "14px",
              }}
            >
              Tidak ada data pencantuman gelar untuk tanggal ini
              <br />
              Silakan pilih tanggal lain atau hubungi administrator
            </Text>
          </Flex>
        )}
      </Card>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          box-shadow: none !important;
          border: 1px solid #e8e8e8 !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-date-picker:not(.ant-picker-disabled):hover .ant-picker-selector,
        .ant-picker:not(.ant-picker-disabled):hover .ant-picker-selector {
          border-color: #ff4500 !important;
        }

        .ant-date-picker-focused .ant-picker-selector,
        .ant-picker-focused .ant-picker-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn-primary {
          background: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-btn-primary:hover {
          background: #ff6b35 !important;
          border-color: #ff6b35 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.25) !important;
        }

        .ant-tag {
          border-radius: 4px !important;
        }

        .ant-table-thead > tr > th {
          background: #fafafa !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fff7e6 !important;
        }

        @media (max-width: 576px) {
          .ant-col {
            margin-bottom: 4px !important;
          }

          .ant-card-body {
            padding: 12px 8px !important;
          }

          .ant-space-vertical {
            gap: 4px !important;
          }

          .ant-card {
            margin-bottom: 8px !important;
          }

          .ant-table-pagination {
            margin-top: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 6px !important;
          }

          .ant-card-body {
            padding: 16px 12px !important;
          }

          .ant-card {
            margin-bottom: 12px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1199px) {
          .ant-card-body {
            padding: 20px 16px !important;
          }

          .ant-card {
            margin-bottom: 16px !important;
          }
        }

        @media (min-width: 1200px) {
          .ant-card-body {
            padding: 24px 20px !important;
          }

          .ant-card {
            margin-bottom: 20px !important;
          }
        }

        .ant-skeleton-content .ant-skeleton-paragraph > li {
          height: 10px !important;
        }
      `}</style>
    </div>
  );
}

export default RekonPG;
