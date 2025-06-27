import useScrollRestoration from "@/hooks/useScrollRestoration";
import { comparePegawaiAdmin } from "@/services/admin.services";
import {
  BarChartOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Flex,
  Grid,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import React from "react";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const GrafikAnomali = ({ data }) => {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const gotoDetailEmployee = (nip) => {
    const url = `/apps-managements/integrasi/siasn/${nip}`;
    router.push(url);
  };

  const downloadData = (type, data) => {
    const hasil = data?.map((d) => ({
      nama: d.nama_master,
      nip: d.nip_master,
    }));
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, "data.xlsx");
  };

  const statisticItems = [
    {
      title: "Pegawai di SIASN",
      subtitle: "Sistem Informasi Aparatur Sipil Negara",
      value: data?.totalPegawaiSIASN || 0,
      prefix: <UserOutlined />,
      valueStyle: { color: "#FF4500" },
      color: "#fff7e6",
      borderColor: "#FF4500",
      iconBg: "#FF4500",
      description: "Jumlah pegawai yang terdaftar di sistem SIASN",
    },
    {
      title: "Pegawai di SIMASTER",
      subtitle: "Sistem Informasi Manajemen ASN Terintegrasi",
      value: data?.totalPegawaiSimaster || 0,
      prefix: <DatabaseOutlined />,
      valueStyle: { color: "#22C55E" },
      color: "#F0FDF4",
      borderColor: "#22C55E",
      iconBg: "#22C55E",
      description: "Jumlah pegawai yang terdaftar di sistem SIMASTER",
    },
  ];

  return (
    <div>
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
          📋 Ringkasan Data
        </Title>
        <Row
          gutter={[
            isMobile ? 10 : isTablet ? 12 : 16,
            isMobile ? 10 : isTablet ? 12 : 16,
          ]}
        >
          {statisticItems.map((item, index) => (
            <Col xs={24} sm={12} md={12} lg={12} xl={12} key={index}>
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
                        orang
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

      {/* Detail Perbedaan Data - Bagian Utama */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : isTablet ? "10px" : "12px",
          border: "1px solid #e8e8e8",
          marginBottom: isMobile ? "12px" : isTablet ? "16px" : "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Space
          direction="vertical"
          size={isMobile ? 16 : 20}
          style={{ width: "100%" }}
        >
          {/* Header dengan Navigasi Jelas */}
          <Flex align="center" gap={12} wrap={isMobile} justify="space-between">
            <Flex align="center" gap={12}>
              <div
                style={{
                  width: isMobile ? "40px" : "48px",
                  height: isMobile ? "40px" : "48px",
                  borderRadius: "10px",
                  backgroundColor: "#FF4500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(255, 69, 0, 0.2)",
                }}
              >
                <BarChartOutlined
                  style={{
                    color: "white",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              </div>
              <div>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1a1a1a",
                    fontSize: isMobile ? "16px" : "20px",
                    fontWeight: 700,
                  }}
                >
                  🔍 Detail Perbedaan Data
                </Title>
                <Text
                  style={{
                    color: "#666",
                    fontSize: isMobile ? "12px" : "14px",
                    display: "block",
                    marginTop: "2px",
                  }}
                >
                  Lihat dan unduh data yang berbeda antara kedua sistem
                </Text>
              </div>
            </Flex>

            <div
              style={{
                backgroundColor: "#FF4500",
                color: "white",
                padding: isMobile ? "6px 12px" : "8px 16px",
                borderRadius: "20px",
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: 600,
                minWidth: "fit-content",
                boxShadow: "0 2px 8px rgba(255, 69, 0, 0.2)",
              }}
            >
              {data?.grafik?.length || 0} jenis perbedaan
            </div>
          </Flex>

          {/* Informasi Penting - Bahasa Sehari-hari */}
          <Alert
            title="💡 Informasi Penting"
            color="blue"
            icon={<InfoCircleOutlined />}
            style={{
              marginBottom: "12px",
              borderRadius: isMobile ? "8px" : "10px",
              fontSize: isMobile ? "13px" : "14px",
              border: "1px solid #1890ff",
              backgroundColor: "#f6ffed",
            }}
          >
            <div style={{ lineHeight: "1.5" }}>
              <Text style={{ fontSize: isMobile ? "13px" : "14px" }}>
                Data ini menunjukkan perbedaan antara sistem SIASN dan SIMASTER.
                <br />
                📅 <strong>Diperbarui otomatis</strong> setiap hari oleh tim BKD
                Jawa Timur
                <br />
                ⏱️ Perubahan data memerlukan waktu untuk sinkronisasi
              </Text>
            </div>
          </Alert>

          {/* Daftar Perbedaan - Layout Bersih */}
          <div style={{ padding: isMobile ? "8px 0" : "12px 0" }}>
            <Title
              level={5}
              style={{
                margin: "0 0 20px 0",
                color: "#1a1a1a",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: 600,
              }}
            >
              📝 Daftar Perbedaan Data
            </Title>

            {/* Grid Layout yang Tidak Tumpang Tindih */}
            <div
              className="grid-container"
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                  ? "repeat(2, 1fr)"
                  : "repeat(3, 1fr)",
                gap: isMobile ? "16px" : isTablet ? "20px" : "24px",
                width: "100%",
              }}
            >
              {data?.grafik?.map((item, index) => (
                <div key={index}>
                  <Card
                    style={{
                      borderRadius: isMobile
                        ? "10px"
                        : isTablet
                        ? "12px"
                        : "14px",
                      border: "2px solid #e8e8e8",
                      height: "100%",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      minHeight: isMobile
                        ? "200px"
                        : isTablet
                        ? "220px"
                        : "240px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      width: "100%",
                    }}
                    hoverable
                    bodyStyle={{
                      padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#FF4500";
                      e.currentTarget.style.transform = isMobile
                        ? "translateY(-2px)"
                        : "translateY(-4px)";
                      e.currentTarget.style.boxShadow = isMobile
                        ? "0 4px 16px rgba(255, 69, 0, 0.15)"
                        : "0 8px 24px rgba(255, 69, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8e8e8";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={isMobile ? 12 : isTablet ? 16 : 20}
                      style={{ width: "100%", flex: 1 }}
                    >
                      {/* Header */}
                      <Flex
                        align="center"
                        justify="space-between"
                        wrap="wrap"
                        gap={4}
                      >
                        <Flex align="center" gap={isMobile ? 6 : 8}>
                          <div
                            style={{
                              width: isMobile
                                ? "20px"
                                : isTablet
                                ? "22px"
                                : "24px",
                              height: isMobile
                                ? "20px"
                                : isTablet
                                ? "22px"
                                : "24px",
                              borderRadius: isMobile ? "4px" : "6px",
                              backgroundColor: "#FF4500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: isMobile ? "10px" : "12px",
                                fontWeight: 600,
                                lineHeight: 1,
                              }}
                            >
                              {index + 1}
                            </Text>
                          </div>
                          {!isMobile && (
                            <Tooltip title={item?.description} color="#FF4500">
                              <QuestionCircleOutlined
                                style={{
                                  color: "#FF4500",
                                  fontSize: isTablet ? "13px" : "14px",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Flex>

                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #FF4500 0%, #E63946 100%)",
                            color: "white",
                            padding: isMobile
                              ? "3px 8px"
                              : isTablet
                              ? "4px 9px"
                              : "4px 10px",
                            borderRadius: isMobile ? "10px" : "12px",
                            fontSize: isMobile
                              ? "11px"
                              : isTablet
                              ? "12px"
                              : "13px",
                            fontWeight: 600,
                            minWidth: isMobile ? "32px" : "40px",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.value}
                        </div>
                      </Flex>

                      {/* Jenis Perbedaan - Bahasa Mudah */}
                      <div style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#1a1a1a",
                            fontSize: isMobile
                              ? "14px"
                              : isTablet
                              ? "15px"
                              : "16px",
                            fontWeight: 700,
                            lineHeight: "1.4",
                            display: "block",
                          }}
                        >
                          {/* Simplify technical terms */}
                          {item.type
                            ?.replace(/SIASN/g, "SIASN")
                            ?.replace(/SIMASTER/g, "SIMASTER")
                            ?.replace(/Data/g, "Data")
                            ?.replace(/Pegawai/g, "Pegawai")}
                        </Text>
                        {item?.description && (
                          <Text
                            style={{
                              color: "#666",
                              fontSize: isMobile ? "12px" : "13px",
                              lineHeight: "1.5",
                              display: "block",
                              marginTop: "6px",
                            }}
                          >
                            {/* Simplify description for better understanding */}
                            {isMobile
                              ? item.description.length > 45
                                ? `${item.description.substring(0, 45)}...`
                                : item.description
                              : isTablet
                              ? item.description.length > 55
                                ? `${item.description.substring(0, 55)}...`
                                : item.description
                              : item.description.length > 70
                              ? `${item.description.substring(0, 70)}...`
                              : item.description}
                          </Text>
                        )}
                        {/* Mobile tooltip alternative - Clearer language */}
                        {isMobile &&
                          item?.description &&
                          item.description.length > 45 && (
                            <Text
                              style={{
                                color: "#FF4500",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                marginTop: "4px",
                                display: "block",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                alert(`Detail: ${item.description}`);
                              }}
                            >
                              👆 Ketuk untuk detail lengkap
                            </Text>
                          )}
                      </div>

                      {/* Aksi Unduh - Langkah Minimal */}
                      {item.detail && item.detail.length > 0 && (
                        <div
                          style={{
                            borderTop: "2px solid #f0f0f0",
                            marginTop: "auto",
                            backgroundColor: "#fafafa",
                            borderRadius: "0 0 10px 10px",
                            margin: isMobile
                              ? "-16px -16px 0"
                              : isTablet
                              ? "-20px -20px 0"
                              : "-24px -24px 0",
                            padding: isMobile
                              ? "16px"
                              : isTablet
                              ? "20px"
                              : "24px",
                          }}
                        >
                          <Flex
                            gap={isMobile ? 8 : 12}
                            wrap
                            align="center"
                            justify="space-between"
                          >
                            <div style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: "#1a1a1a",
                                  fontSize: isMobile ? "12px" : "13px",
                                  fontWeight: 600,
                                  display: "block",
                                }}
                              >
                                📊 {item.detail.length} data pegawai berbeda
                              </Text>
                              <Text
                                style={{
                                  color: "#666",
                                  fontSize: isMobile ? "11px" : "12px",
                                  display: "block",
                                  marginTop: "2px",
                                }}
                              >
                                Klik tombol untuk unduh file Excel
                              </Text>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadData(item?.type, item?.detail);
                              }}
                              style={{
                                backgroundColor: "#FF4500",
                                color: "white",
                                fontSize: isMobile ? "12px" : "14px",
                                fontWeight: 600,
                                textDecoration: "none",
                                padding: isMobile ? "8px 16px" : "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(255, 69, 0, 0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#E63946";
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow =
                                  "0 4px 12px rgba(255, 69, 0, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#FF4500";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow =
                                  "0 2px 8px rgba(255, 69, 0, 0.2)";
                              }}
                            >
                              📥 Unduh Data
                            </button>
                          </Flex>
                        </div>
                      )}

                      {/* State Tidak Ada Data - Bahasa Jelas */}
                      {(!item.detail || item.detail.length === 0) && (
                        <div
                          style={{
                            borderTop: "2px solid #f0f0f0",
                            marginTop: "auto",
                            textAlign: "center",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "0 0 10px 10px",
                            margin: isMobile
                              ? "-16px -16px 0"
                              : isTablet
                              ? "-20px -20px 0"
                              : "-24px -24px 0",
                            padding: isMobile
                              ? "20px 16px"
                              : isTablet
                              ? "24px 20px"
                              : "28px 24px",
                          }}
                        >
                          <Text
                            style={{
                              color: "#999",
                              fontSize: isMobile ? "12px" : "13px",
                              fontWeight: 500,
                            }}
                          >
                            ✅ Tidak ada perbedaan data
                          </Text>
                          <Text
                            style={{
                              color: "#666",
                              fontSize: isMobile ? "11px" : "12px",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            Data sudah sinkron antara kedua sistem
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

function DashboardKomparasiAdmin() {
  useScrollRestoration();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data, isLoading } = useQuery(
    ["dashboard-compare-siasn-admin"],
    () => comparePegawaiAdmin(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      {/* Content */}
      {isLoading ? (
        <Card style={{ borderRadius: isMobile ? "6px" : "12px" }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : data ? (
        <GrafikAnomali data={data} />
      ) : (
        <Card
          style={{
            borderRadius: isMobile ? "8px" : isTablet ? "10px" : "12px",
            border: "2px solid #ffa940",
            textAlign: "center",
            backgroundColor: "#fff7e6",
          }}
          bodyStyle={{ padding: isMobile ? "40px 20px" : "50px 30px" }}
        >
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ color: "#666" }}
          >
            <div
              style={{
                width: isMobile ? "80px" : "96px",
                height: isMobile ? "80px" : "96px",
                borderRadius: "50%",
                backgroundColor: "#ffa940",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                boxShadow: "0 4px 16px rgba(255, 169, 64, 0.2)",
              }}
            >
              <BarChartOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "36px" : "48px",
                }}
              />
            </div>
            <Title
              level={isMobile ? 4 : 3}
              style={{
                color: "#1a1a1a",
                margin: "0 0 12px 0",
                fontWeight: 700,
              }}
            >
              📊 Belum Ada Data Perbandingan
            </Title>
            <Text
              style={{
                textAlign: "center",
                fontSize: isMobile ? "14px" : "16px",
                color: "#666",
                lineHeight: "1.6",
                maxWidth: "400px",
              }}
            >
              Data perbandingan antara SIASN dan SIMASTER sedang diproses.
              <br />
              <br />
              <strong>Apa yang bisa Anda lakukan:</strong>
              <br />
              • Tunggu beberapa saat dan refresh halaman
              <br />• Hubungi tim IT jika masalah berlanjut
            </Text>
            <div
              style={{
                marginTop: "24px",
                padding: "12px 20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ffa940",
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                💡 <strong>Tips:</strong> Data biasanya tersedia setelah proses
                sinkronisasi harian selesai
              </Text>
            </div>
          </Flex>
        </Card>
      )}

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          box-shadow: none !important;
          border: 1px solid #e8e8e8 !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-table-thead > tr > th {
          background: #fafafa !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fff7e6 !important;
        }

        .ant-table-expanded-row > td {
          background: #fafbfc !important;
        }

        .ant-tooltip-inner {
          background-color: #ff4500 !important;
        }

        .ant-tooltip-arrow::before {
          background-color: #ff4500 !important;
        }

        @media (max-width: 576px) {
          .ant-col {
            margin-bottom: 2px !important;
          }

          .ant-card-body {
            padding: 12px !important;
          }

          .ant-space-vertical {
            gap: 6px !important;
          }

          .ant-card {
            margin-bottom: 8px !important;
            min-height: 100px !important;
          }

          .ant-table-pagination {
            margin-top: 8px !important;
          }

          .ant-alert {
            padding: 6px 10px !important;
          }

          /* Grid Layout untuk Mobile */
          .grid-container {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 4px !important;
          }

          .ant-card-body {
            padding: 16px !important;
          }

          .ant-card {
            margin-bottom: 12px !important;
            min-height: 110px !important;
          }

          /* Grid Layout untuk Tablet */
          .grid-container {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1199px) {
          .ant-card-body {
            padding: 20px !important;
          }

          .ant-card {
            margin-bottom: 16px !important;
            min-height: 120px !important;
          }

          /* Grid Layout untuk Desktop Medium */
          .grid-container {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }

        @media (min-width: 1200px) {
          .ant-card-body {
            padding: 20px !important;
          }

          .ant-card {
            margin-bottom: 16px !important;
            min-height: 120px !important;
          }

          /* Grid Layout untuk Desktop Large */
          .grid-container {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }

        /* Fallback untuk Browser Lama */
        .grid-container {
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -ms-flex-wrap: wrap;
          flex-wrap: wrap;
        }

        .grid-container > div {
          -webkit-box-flex: 1;
          -ms-flex: 1 1 300px;
          flex: 1 1 300px;
          max-width: 100%;
        }

        .ant-skeleton-content .ant-skeleton-paragraph > li {
          height: 10px !important;
        }
      `}</style>
    </div>
  );
}

export default DashboardKomparasiAdmin;
