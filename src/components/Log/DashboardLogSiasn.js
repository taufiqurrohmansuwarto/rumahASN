import {
  DatePicker,
  Card,
  Space,
  Typography,
  Skeleton,
  Grid,
  Row,
  Col,
  Button,
} from "antd";
import { BarChartOutlined, ReloadOutlined } from "@ant-design/icons";
import { Text as MText, Badge } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logSIASNDashboard } from "@/services/log.services";
import Bar from "@/components/Plots/Bar";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const DashboardLogSiasn = () => {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["log-siasn-dashboard", month],
    queryFn: () => logSIASNDashboard({ month: month?.format("YYYY-MM") }),
  });

  const config = {
    data: data,
    xField: "value",
    yField: "label",
    seriesField: "label",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <BarChartOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Dashboard Log SIASN
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
              Monitoring dan analisis log aktivitas SIASN
            </Text>
          </div>

          {/* Filter Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={12} md={10}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isXs ? "column" : "row",
                        alignItems: isXs ? "stretch" : "center",
                        gap: 6,
                      }}
                    >
                      <Text strong style={{ color: "#6b7280" }}>
                        Filter Bulan:
                      </Text>
                      <DatePicker
                        placeholder="Pilih Bulan"
                        picker="month"
                        value={month}
                        onChange={(date) => setMonth(date)}
                        allowClear={false}
                        style={{ width: isXs ? "100%" : 160 }}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={24}
                md={8}
                style={{
                  display: "flex",
                  justifyContent: isXs ? "flex-start" : "flex-end",
                }}
              >
                <Space wrap>
                  <Button
                    icon={<ReloadOutlined />}
                    loading={isLoading || isRefetching}
                    onClick={() => refetch()}
                    style={{
                      borderRadius: 6,
                      fontWeight: 500,
                      padding: "0 16px",
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Chart Section */}
          <div style={{ marginTop: 16 }}>
            {isLoading ? (
              <div style={{ padding: 24 }}>
                <Skeleton active paragraph={{ rows: 8 }} />
              </div>
            ) : data && data.length > 0 ? (
              <div style={{ padding: "16px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                    padding: "8px 12px",
                    backgroundColor: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                  }}
                >
                  <MText fw={700} size="sm">Visualisasi Log Aktivitas</MText>
                  <Badge color="orange" variant="light" size="sm">
                    {month?.format("MMMM YYYY")}
                  </Badge>
                </div>
                <Bar {...config} />
              </div>
            ) : (
              <div style={{ padding: 48, textAlign: "center" }}>
                <BarChartOutlined
                  style={{ fontSize: 42, color: "#d1d5db", marginBottom: 12 }}
                />
                <div>
                  <Text style={{ color: "#6b7280", fontSize: 16 }}>
                    Tidak ada data log untuk periode ini
                  </Text>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Coba pilih periode yang berbeda untuk melihat data log
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardLogSiasn;
