import { dashboardTimeliness } from "@/services/dimensi-timeliness.services";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import React from "react";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function DashboardDimensiTimeliness() {
  useScrollRestoration();
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data, isLoading } = useQuery(["dashboard-dimensi-timeliness"], () =>
    dashboardTimeliness()
  );

  const handleClick = (key) => {
    router.push(`/rekon/anomali/timeliness/${key}`);
  };

  // Statistik ringkasan untuk overview
  const statisticItems = [
    {
      title: "Total Indikator",
      subtitle: "Jumlah parameter yang diukur",
      value: data?.length || 0,
      prefix: <DatabaseOutlined />,
      valueStyle: { color: "#FF4500" },
      color: "#fff7e6",
      borderColor: "#FF4500",
      iconBg: "#FF4500",
      description: "Total indikator ketepatan waktu data yang dievaluasi",
    },
    {
      title: "Data Berbeda",
      subtitle: "Indikator dengan perbedaan data",
      value: data?.filter((item) => item.value !== item.siasn).length || 0,
      prefix: <ExclamationCircleOutlined />,
      valueStyle: { color: "#dc2626" },
      color: "#fef2f2",
      borderColor: "#dc2626",
      iconBg: "#dc2626",
      description:
        "Jumlah indikator yang memiliki perbedaan antara SIMASTER dan SIASN",
    },
    {
      title: "Data Konsisten",
      subtitle: "Indikator dengan data sama",
      value: data?.filter((item) => item.value === item.siasn).length || 0,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: "#22C55E" },
      color: "#F0FDF4",
      borderColor: "#22C55E",
      iconBg: "#22C55E",
      description:
        "Jumlah indikator yang memiliki data konsisten antara kedua sistem",
    },
  ];

  return (
    <div>
      {/* Header - Prioritas Utama */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "8px" : isTablet ? "10px" : "12px",
          border: "2px solid #FF4500",
          background: "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
          boxShadow: "0 2px 8px rgba(255, 69, 0, 0.1)",
        }}
        bodyStyle={{
          padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
        }}
      >
        <Flex
          align="center"
          gap={isMobile ? 12 : 16}
          wrap={isMobile}
          justify={isMobile ? "center" : "flex-start"}
        >
          <div
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              backgroundColor: "#FF4500",
              borderRadius: isMobile ? "8px" : "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 3px 10px rgba(255, 69, 0, 0.2)",
            }}
          >
            <ClockCircleOutlined
              style={{ color: "white", fontSize: isMobile ? "20px" : "24px" }}
            />
          </div>
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                color: "#1a1a1a",
                fontSize: isMobile ? "16px" : "20px",
                fontWeight: 700,
              }}
            >
              ⏰ Dimensi Timeliness (Ketepatan Waktu)
            </Title>
            <Text
              style={{
                fontSize: isMobile ? "12px" : "14px",
                display: "block",
                marginTop: "2px",
                color: "#666",
                lineHeight: "1.3",
              }}
            >
              Evaluasi ketepatan waktu data Pegawai ASN untuk memastikan
              validitas informasi kepegawaian
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Ringkasan Data - Informasi Utama */}
      <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
        <Title
          level={5}
          style={{
            margin: "0 0 8px 0",
            color: "#1a1a1a",
            fontSize: isMobile ? "14px" : "16px",
            fontWeight: 600,
          }}
        >
          ⏰ Ringkasan Ketepatan Waktu Data
        </Title>
        <Row
          gutter={[
            isMobile ? 10 : isTablet ? 12 : 16,
            isMobile ? 10 : isTablet ? 12 : 16,
          ]}
        >
          {statisticItems.map((item, index) => (
            <Col xs={24} sm={8} md={8} lg={8} xl={8} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: isMobile ? "8px" : "12px",
                  border: `2px solid ${item.borderColor}`,
                  backgroundColor: item.color,
                  transition: "all 0.3s ease",
                  height: "100%",
                  minHeight: isMobile ? "100px" : isTablet ? "110px" : "120px",
                  boxShadow: `0 2px 8px ${item.borderColor}20`,
                }}
                bodyStyle={{
                  padding: isMobile ? "12px" : isTablet ? "16px" : "20px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = isMobile
                    ? "translateY(-2px)"
                    : "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${item.borderColor}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 2px 8px ${item.borderColor}20`;
                }}
              >
                <Space
                  direction="vertical"
                  size={isMobile ? 6 : 8}
                  style={{ width: "100%", flex: 1 }}
                >
                  {/* Header dengan Hierarki Visual */}
                  <Flex align="flex-start" gap={isMobile ? 8 : 10}>
                    <div
                      style={{
                        width: isMobile ? "32px" : "36px",
                        height: isMobile ? "32px" : "36px",
                        borderRadius: "8px",
                        backgroundColor: item.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 3px 8px ${item.iconBg}30`,
                      }}
                    >
                      {React.cloneElement(item.prefix, {
                        style: {
                          color: "white",
                          fontSize: isMobile ? "16px" : "18px",
                        },
                      })}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text
                        strong
                        style={{
                          color: "#1a1a1a",
                          fontSize: isMobile ? "13px" : "14px",
                          lineHeight: "1.3",
                          display: "block",
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: "#666",
                          fontSize: isMobile ? "10px" : "11px",
                          lineHeight: "1.3",
                          display: "block",
                          marginTop: "1px",
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    </div>
                  </Flex>

                  {/* Angka Utama - Prioritas Tertinggi */}
                  <div style={{ marginTop: "auto" }}>
                    <Flex align="baseline" gap={4}>
                      <Text
                        style={{
                          ...item.valueStyle,
                          fontSize: isMobile ? "24px" : "28px",
                          fontWeight: 800,
                          lineHeight: "1.1",
                        }}
                      >
                        {item.value?.toLocaleString() || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          color: "#666",
                          fontWeight: 500,
                        }}
                      >
                        indikator
                      </Text>
                    </Flex>
                    {/* Deskripsi Tambahan */}
                    <Text
                      style={{
                        fontSize: isMobile ? "9px" : "10px",
                        color: "#888",
                        lineHeight: "1.2",
                        display: "block",
                        marginTop: "2px",
                        fontStyle: "italic",
                      }}
                    >
                      {item.description}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Detail Indikator - Navigasi Mudah */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "2px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          background: "#ffffff",
        }}
        bodyStyle={{
          padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
        }}
      >
        <Space
          direction="vertical"
          size={isMobile ? 16 : 20}
          style={{ width: "100%" }}
        >
          {/* Header dengan Hierarki Visual */}
          <Flex align="center" gap={isMobile ? 10 : 12} wrap>
            <div
              style={{
                width: isMobile ? "36px" : "40px",
                height: isMobile ? "36px" : "40px",
                borderRadius: "10px",
                backgroundColor: "#FF4500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(255, 69, 0, 0.2)",
              }}
            >
              <ClockCircleOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "16px" : "18px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={isMobile ? 5 : 4}
                style={{
                  margin: 0,
                  color: "#1a1a1a",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: 700,
                }}
              >
                ⏰ Detail Setiap Indikator
              </Title>
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#666",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                Analisis mendalam untuk setiap parameter ketepatan waktu data
              </Text>
            </div>
            <Badge
              count={data?.length || 0}
              style={{
                backgroundColor: "#FF4500",
                fontSize: isMobile ? "11px" : "12px",
                fontWeight: 600,
              }}
            />
          </Flex>

          {/* Informasi Penting - Bahasa Sehari-hari */}
          <Alert
            title="💡 Tips Membaca Data"
            color="orange"
            icon={<InfoCircleOutlined />}
            style={{
              borderRadius: "8px",
              backgroundColor: "#fff7e6",
              border: "1px solid #FFD591",
            }}
          >
            <Text
              style={{ fontSize: isMobile ? "12px" : "13px", color: "#1a1a1a" }}
            >
              Semakin tepat waktu penyampaian data, semakin baik kualitas
              layanan kepegawaian. Klik &quot;Detail&quot; untuk melihat data
              spesifik yang perlu dipercepat.
            </Text>
          </Alert>

          {/* Daftar Indikator - Tampilan Card yang Mudah Dibaca */}
          <div style={{ marginTop: isMobile ? "12px" : "16px" }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Text
                  style={{
                    color: "#666",
                    fontSize: isMobile ? "14px" : "16px",
                  }}
                >
                  Memuat data indikator...
                </Text>
              </div>
            ) : !data || data.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text
                        style={{
                          color: "#666",
                          fontSize: isMobile ? "14px" : "16px",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Belum ada data indikator
                      </Text>
                      <Text
                        style={{
                          color: "#999",
                          fontSize: isMobile ? "12px" : "13px",
                        }}
                      >
                        Data akan muncul setelah proses evaluasi selesai
                      </Text>
                    </div>
                  }
                />
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
                  gap: isMobile ? "12px" : isTablet ? "16px" : "20px",
                  marginTop: isMobile ? "12px" : "16px",
                }}
              >
                {data.map((item, index) => (
                  <Card
                    key={item.id}
                    hoverable
                    style={{
                      borderRadius: "12px",
                      border:
                        item.value !== item.siasn
                          ? "2px solid #dc2626"
                          : "2px solid #22C55E",
                      backgroundColor:
                        item.value !== item.siasn ? "#fef2f2" : "#f0fdf4",
                      transition: "all 0.3s ease",
                      boxShadow:
                        item.value !== item.siasn
                          ? "0 2px 8px rgba(220, 38, 38, 0.1)"
                          : "0 2px 8px rgba(34, 197, 94, 0.1)",
                    }}
                    bodyStyle={{
                      padding: isMobile ? "16px" : "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = isMobile
                        ? "translateY(-2px)"
                        : "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        item.value !== item.siasn
                          ? "0 8px 24px rgba(220, 38, 38, 0.2)"
                          : "0 8px 24px rgba(34, 197, 94, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        item.value !== item.siasn
                          ? "0 2px 8px rgba(220, 38, 38, 0.1)"
                          : "0 2px 8px rgba(34, 197, 94, 0.1)";
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={isMobile ? 12 : 14}
                      style={{ width: "100%" }}
                    >
                      {/* Header Card */}
                      <Flex align="flex-start" gap={isMobile ? 10 : 12}>
                        <div
                          style={{
                            width: isMobile ? "36px" : "40px",
                            height: isMobile ? "36px" : "40px",
                            borderRadius: "10px",
                            backgroundColor:
                              item.value !== item.siasn ? "#dc2626" : "#22C55E",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow:
                              item.value !== item.siasn
                                ? "0 3px 10px rgba(220, 38, 38, 0.3)"
                                : "0 3px 10px rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          {item.value !== item.siasn ? (
                            <ExclamationCircleOutlined
                              style={{
                                color: "white",
                                fontSize: isMobile ? "16px" : "18px",
                              }}
                            />
                          ) : (
                            <CheckCircleOutlined
                              style={{
                                color: "white",
                                fontSize: isMobile ? "16px" : "18px",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text
                            strong
                            style={{
                              color: "#1a1a1a",
                              fontSize: isMobile ? "14px" : "16px",
                              lineHeight: "1.3",
                              display: "block",
                              fontWeight: 600,
                              marginBottom: "4px",
                            }}
                          >
                            {item.label}
                          </Text>
                          {/* Deskripsi Indikator - Penjelasan yang Mudah Dipahami */}
                          {item.description && (
                            <Text
                              style={{
                                color: "#666",
                                fontSize: isMobile ? "11px" : "12px",
                                lineHeight: "1.4",
                                display: "block",
                                marginBottom: "6px",
                                fontStyle: "italic",
                              }}
                            >
                              {item.description}
                            </Text>
                          )}
                          <Tag
                            style={{
                              marginTop: "2px",
                              fontSize: isMobile ? "10px" : "11px",
                              fontWeight: 600,
                              borderRadius: "12px",
                              backgroundColor: "#FF4500",
                              color: "white",
                              border: "none",
                            }}
                          >
                            Bobot: {item.bobot}%
                          </Tag>
                        </div>
                      </Flex>

                      {/* Perbandingan Data SIMASTER vs SIASN */}
                      <div
                        style={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: isMobile ? "12px" : "14px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%" }}
                        >
                          <Text
                            style={{
                              fontSize: isMobile ? "12px" : "13px",
                              color: "#666",
                              display: "block",
                              fontWeight: 500,
                            }}
                          >
                            📊 Perbandingan Data
                          </Text>

                          {/* Data SIMASTER */}
                          <Flex align="center" justify="space-between">
                            <Flex align="center" gap={8}>
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: "#FF4500",
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: isMobile ? "11px" : "12px",
                                  color: "#666",
                                }}
                              >
                                SIMASTER
                              </Text>
                            </Flex>
                            <Text
                              style={{
                                fontSize: isMobile ? "14px" : "16px",
                                fontWeight: 600,
                                color: "#FF4500",
                              }}
                            >
                              {item.value?.toLocaleString() || 0}
                            </Text>
                          </Flex>

                          {/* Data SIASN */}
                          <Flex align="center" justify="space-between">
                            <Flex align="center" gap={8}>
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: "#22C55E",
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: isMobile ? "11px" : "12px",
                                  color: "#666",
                                }}
                              >
                                SIASN
                              </Text>
                            </Flex>
                            <Text
                              style={{
                                fontSize: isMobile ? "14px" : "16px",
                                fontWeight: 600,
                                color: "#22C55E",
                              }}
                            >
                              {item.siasn?.toLocaleString() || 0}
                            </Text>
                          </Flex>

                          {/* Status Perbedaan */}
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px",
                              borderRadius: "6px",
                              backgroundColor:
                                item.value !== item.siasn
                                  ? "#fef2f2"
                                  : "#f0fdf4",
                              border: `1px solid ${
                                item.value !== item.siasn
                                  ? "#fecaca"
                                  : "#bbf7d0"
                              }`,
                            }}
                          >
                            <Flex align="center" justify="space-between">
                              <Text
                                style={{
                                  fontSize: isMobile ? "11px" : "12px",
                                  color:
                                    item.value !== item.siasn
                                      ? "#dc2626"
                                      : "#22C55E",
                                  fontWeight: 500,
                                }}
                              >
                                {item.value !== item.siasn
                                  ? "⚠️ Ada Perbedaan"
                                  : "✅ Data Sama"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: isMobile ? "11px" : "12px",
                                  color:
                                    item.value !== item.siasn
                                      ? "#dc2626"
                                      : "#22C55E",
                                  fontWeight: 600,
                                }}
                              >
                                {item.value !== item.siasn
                                  ? `Selisih: ${Math.abs(
                                      item.value - item.siasn
                                    )}`
                                  : "Konsisten"}
                              </Text>
                            </Flex>
                          </div>
                        </Space>
                      </div>

                      {/* Tombol Aksi */}
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleClick(item.id)}
                        block
                        style={{
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: isMobile ? "13px" : "14px",
                          height: isMobile ? "36px" : "40px",
                          backgroundColor: "#FF4500",
                          borderColor: "#FF4500",
                          marginTop: "8px",
                        }}
                      >
                        Lihat Detail & Perbaikan
                      </Button>
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default DashboardDimensiTimeliness;
