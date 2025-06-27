import React from "react";
import {
  getRekonIPASNDashboard,
  syncRekonIPASN,
} from "@/services/rekon.services";
import { SearchOutlined, TeamOutlined, SyncOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Space,
  Table,
  Typography,
  message,
  Skeleton,
  Flex,
  Badge,
  Tag,
  Grid,
} from "antd";
import { useRouter } from "next/router";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RekonIPASN() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn"],
    queryFn: getRekonIPASNDashboard,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: syncRekonIpasn, isLoading: isSyncRekonIpasnLoading } =
    useMutation({
      mutationFn: () => syncRekonIPASN(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rekon-ipasn"] });
        message.success("Data berhasil disinkronisasi");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const handleSyncRekonIpasn = () => {
    syncRekonIpasn();
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "name",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.name,
        value: item?.name,
      })),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: "40%",
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ color: "#374151" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "PNS",
      dataIndex: "rerata_total_pns",
      sorter: (a, b) => a.rerata_total_pns - b.rerata_total_pns,
      align: "center",
      render: (value) => (
        <Tag color="#FF4500" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "PPPK",
      dataIndex: "rerata_total_pppk",
      sorter: (a, b) => a.rerata_total_pppk - b.rerata_total_pppk,
      align: "center",
      render: (value) => (
        <Tag color="#22C55E" style={{ fontWeight: 500 }}>
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
              <TeamOutlined
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
                👥 IPASN Pemprov Jatim
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? "11px" : "13px",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                Monitoring data IPASN dan sinkronisasi informasi pegawai
              </Text>
            </div>
          </Flex>

          {!isMobile && (
            <Space size="middle">
              <Button
                type="default"
                icon={<SyncOutlined />}
                loading={isSyncRekonIpasnLoading}
                disabled={isSyncRekonIpasnLoading}
                onClick={handleSyncRekonIpasn}
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  height: isTablet ? "36px" : "40px",
                  padding: "0 16px",
                }}
              >
                Sinkronkan Data
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => router.push("/rekon/dashboard/ipasn")}
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
            </Space>
          )}
        </Flex>

        {isMobile && (
          <div style={{ marginTop: "12px" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Button
                type="default"
                icon={<SyncOutlined />}
                loading={isSyncRekonIpasnLoading}
                disabled={isSyncRekonIpasnLoading}
                onClick={handleSyncRekonIpasn}
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  height: "36px",
                  width: "100%",
                }}
              >
                Sinkronkan Data
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => router.push("/rekon/dashboard/ipasn")}
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
            </Space>
          </div>
        )}
      </Card>

      {/* Data Table Section */}
      <Card
        style={{
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
        }}
      >
        {isLoading ? (
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
                rowKey={(row) => row?.id}
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
            <TeamOutlined
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
              Tidak ada data IPASN yang tersedia saat ini
              <br />
              Coba sinkronkan data atau hubungi administrator
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

        .ant-btn-default:hover {
          border-color: #ff4500 !important;
          color: #ff4500 !important;
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

export default RekonIPASN;
