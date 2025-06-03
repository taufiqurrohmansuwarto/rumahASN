import { Flex, DatePicker, Card, Space, Typography, Skeleton } from "antd";
import { CalendarOutlined, BarChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logSIASNDashboard } from "@/services/log.services";
import Bar from "@/components/Plots/Bar";

const { Title, Text } = Typography;

const DashboardLogSiasn = () => {
  const [month, setMonth] = useState(dayjs().startOf("month").toDate());

  const { data, isLoading } = useQuery({
    queryKey: ["log-siasn-dashboard", month],
    queryFn: () => logSIASNDashboard({ month: dayjs(month).format("YYYY-MM") }),
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
          Dashboard Log SIASN
        </Title>
        <Text type="secondary" style={{ fontSize: "16px", lineHeight: "24px" }}>
          Monitoring dan analisis log aktivitas sistem SIASN
        </Text>
      </div>

      {/* Filter Section */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Flex align="center" gap={8}>
            <CalendarOutlined style={{ color: "#6B7280", fontSize: "16px" }} />
            <Text strong style={{ color: "#374151", fontSize: "16px" }}>
              Pilih Periode
            </Text>
          </Flex>
          <DatePicker.MonthPicker
            type="month"
            format="YYYY-MM"
            value={dayjs(month)}
            onChange={(date) => setMonth(date)}
            placeholder="Pilih bulan untuk melihat data log..."
            style={{ width: "100%" }}
            size="large"
          />
        </Space>
      </Card>

      {/* Chart Section */}
      <div>
        {isLoading ? (
          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : data && data.length > 0 ? (
          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "32px" }}
            hoverable
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
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
                  <BarChartOutlined
                    style={{ color: "white", fontSize: "18px" }}
                  />
                </div>
                <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                  Visualisasi Log Aktivitas
                </Title>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  {dayjs(month).format("MMMM YYYY")}
                </Text>
              </Flex>

              <div style={{ padding: "16px 0" }}>
                <Bar {...config} />
              </div>
            </Space>
          </Card>
        ) : (
          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "64px 32px" }}
          >
            <Space direction="vertical" size={16}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <BarChartOutlined
                  style={{ color: "#9CA3AF", fontSize: "24px" }}
                />
              </div>
              <Space direction="vertical" size={8}>
                <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                  Tidak ada data log untuk periode ini
                </Text>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Coba pilih periode yang berbeda untuk melihat data log
                </Text>
              </Space>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardLogSiasn;
