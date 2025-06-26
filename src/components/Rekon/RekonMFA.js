import PlotUsers from "@/components/Dashboards/PlotUsers";
import { getUnorSimaster } from "@/services/rekon.services";
import { getListMfa } from "@/services/siasn-services";
import {
  IconChartBar,
  IconCircleCheck,
  IconCircleX,
  IconDownload,
  IconQuestionMark,
  IconSearch,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Row,
  Skeleton,
  Space,
  TreeSelect,
  Typography,
} from "antd";
import React, { useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RekonMFA() {
  const [selectedOpd, setSelectedOpd] = useState(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data: unorData, isLoading: unorLoading } = useQuery({
    queryKey: ["rekon-unor-simaster"],
    queryFn: getUnorSimaster,
    refetchOnWindowFocus: false,
  });

  const { data: mfaData, isLoading: mfaLoading } = useQuery({
    queryKey: ["rekon-mfa", selectedOpd],
    queryFn: () => getListMfa({ skpd_id: selectedOpd }),
    refetchOnWindowFocus: false,
    enabled: !!selectedOpd,
  });

  const { mutateAsync: listMfa, isLoading: listMfaLoading } = useMutation({
    mutationFn: (data) => getListMfa(data),
  });

  const downloadMfa = async (aktivasi) => {
    try {
      const result = await listMfa({
        skpd_id: selectedOpd,
        type: "download",
        aktivasi,
      });

      if (!result || result.length === 0) {
        return;
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(result);

      XLSX.utils.book_append_sheet(workbook, worksheet, "MFA");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      saveAs(new Blob([excelBuffer]), `mfa_${aktivasi}.xlsx`);
    } catch (error) {
      console.error("Error downloading MFA data:", error);
    }
  };

  // Perbaiki perhitungan statistik
  const totalMFA = React.useMemo(() => {
    if (!mfaData || !Array.isArray(mfaData)) return 0;
    return mfaData.reduce((acc, item) => {
      const value = parseInt(item.value) || 0;
      return acc + value;
    }, 0);
  }, [mfaData]);

  const getStatusValue = (status) => {
    if (!mfaData || !Array.isArray(mfaData)) return 0;
    const item = mfaData.find((item) => item.title === status);
    return parseInt(item?.value) || 0;
  };

  const calculatePercentage = (status) => {
    if (!mfaData?.length || totalMFA === 0) return "(0%)";

    const value = getStatusValue(status);
    const percentage = ((value / totalMFA) * 100).toFixed(1);
    return `(${percentage}%)`;
  };

  const statisticItems = [
    {
      title: "Total Pegawai",
      key: "total",
      value: totalMFA,
      prefix: <IconUser size={isMobile ? 16 : 18} />,
      valueStyle: { color: "#FF4500" },
      color: "#fff7e6",
      borderColor: "#ffccc7",
      iconBg: "#FF4500",
    },
    {
      title: "Sudah MFA",
      value: getStatusValue("SUDAH"),
      key: "SUDAH",
      prefix: <IconCircleCheck size={isMobile ? 16 : 18} />,
      valueStyle: { color: "#52c41a" },
      suffix: calculatePercentage("SUDAH"),
      color: "#f6ffed",
      borderColor: "#b7eb8f",
      iconBg: "#52c41a",
    },
    {
      title: "Belum MFA",
      key: "BELUM",
      value: getStatusValue("BELUM"),
      prefix: <IconCircleX size={isMobile ? 16 : 18} />,
      valueStyle: { color: "#ff4d4f" },
      suffix: calculatePercentage("BELUM"),
      color: "#fff2f0",
      borderColor: "#ffccc7",
      iconBg: "#ff4d4f",
    },
    {
      title: "Tidak Terdata",
      key: "TIDAK TERDATA",
      value: getStatusValue("TIDAK TERDATA"),
      prefix: <IconQuestionMark size={isMobile ? 16 : 18} />,
      valueStyle: { color: "#faad14" },
      suffix: calculatePercentage("TIDAK TERDATA"),
      color: "#fffbe6",
      borderColor: "#ffe58f",
      iconBg: "#faad14",
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
          justify={isMobile ? "center" : "flex-start"}
        >
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
            <IconShield size={isMobile ? 18 : 20} color="white" />
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
              🔐 Multi Factor Authentication
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "11px" : "13px",
                display: "block",
                marginTop: "2px",
              }}
            >
              Monitoring dan rekapitulasi data aktivasi MFA pegawai
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Search Section */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Flex align="center" gap={6}>
            <IconSearch size={14} color="#FF4500" />
            <Text
              strong
              style={{ color: "#1a1a1a", fontSize: isMobile ? "13px" : "15px" }}
            >
              Pilih Unit Organisasi
            </Text>
          </Flex>
          <TreeSelect
            loading={unorLoading}
            treeData={unorData}
            treeNodeFilterProp="title"
            placeholder="Ketik nama unit organisasi untuk mencari..."
            listHeight={400}
            showSearch
            style={{ width: "100%" }}
            onChange={setSelectedOpd}
            size={isMobile ? "middle" : "large"}
            allowClear
          />
        </Space>
      </Card>

      {/* Statistics Section */}
      {selectedOpd && (
        <Card
          style={{
            marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
            borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          {mfaLoading ? (
            <Row gutter={[isMobile ? 8 : 12, isMobile ? 8 : 12]}>
              {[1, 2, 3, 4].map((item) => (
                <Col xs={12} sm={12} md={6} lg={6} key={item}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[isMobile ? 8 : 12, isMobile ? 8 : 12]}>
              {statisticItems.map((item, index) => (
                <Col xs={12} sm={12} md={6} lg={6} key={index}>
                  <div
                    style={{
                      padding: isMobile
                        ? "10px 6px"
                        : isTablet
                        ? "14px 10px"
                        : "16px 12px",
                      borderRadius: isMobile ? "6px" : "8px",
                      border: `1px solid ${item.borderColor}`,
                      backgroundColor: item.color,
                      transition: "all 0.3s ease",
                      cursor: "default",
                      height: "100%",
                      minHeight: isMobile
                        ? "90px"
                        : isTablet
                        ? "100px"
                        : "110px",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={isMobile ? 4 : isTablet ? 6 : 8}
                      style={{ width: "100%" }}
                    >
                      {/* Header */}
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={6} style={{ flex: 1 }}>
                          <div
                            style={{
                              width: isMobile
                                ? "24px"
                                : isTablet
                                ? "28px"
                                : "32px",
                              height: isMobile
                                ? "24px"
                                : isTablet
                                ? "28px"
                                : "32px",
                              borderRadius: "6px",
                              backgroundColor: item.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {React.cloneElement(item.prefix, {
                              size: isMobile ? 12 : isTablet ? 14 : 16,
                              color: "white",
                            })}
                          </div>
                          <Text
                            strong
                            style={{
                              color: "#1a1a1a",
                              fontSize: isMobile ? "10px" : "12px",
                              lineHeight: "1.2",
                            }}
                          >
                            {item.title}
                          </Text>
                        </Flex>

                        {index !== 0 && (
                          <Button
                            type="primary"
                            size="small"
                            loading={listMfaLoading}
                            icon={<IconDownload size={isMobile ? 10 : 12} />}
                            onClick={() => downloadMfa(item.key)}
                            style={{
                              backgroundColor: "#FF4500",
                              borderColor: "#FF4500",
                              borderRadius: "4px",
                              fontWeight: 500,
                              fontSize: isMobile ? "9px" : "11px",
                              height: isMobile ? "22px" : "24px",
                              padding: isMobile ? "0 4px" : "0 6px",
                              minWidth: isMobile ? "22px" : "24px",
                            }}
                          >
                            {!isMobile && "Excel"}
                          </Button>
                        )}
                      </Flex>

                      {/* Statistic */}
                      <div style={{ marginTop: isMobile ? "4px" : "6px" }}>
                        <Flex align="baseline" gap={4}>
                          <Text
                            style={{
                              ...item.valueStyle,
                              fontSize: isMobile ? "16px" : "20px",
                              fontWeight: 600,
                              lineHeight: "1.2",
                            }}
                          >
                            {item.value?.toLocaleString() || 0}
                          </Text>
                          {item.suffix && (
                            <Text
                              style={{
                                fontSize: isMobile ? "9px" : "10px",
                                color: "#666",
                                fontWeight: 400,
                              }}
                            >
                              {item.suffix}
                            </Text>
                          )}
                        </Flex>
                      </div>
                    </Space>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      )}

      {/* Chart Section */}
      {selectedOpd && (
        <Card
          style={{
            borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
            border: "1px solid #e8e8e8",
            marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          }}
        >
          {mfaLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : mfaData && mfaData.length > 0 ? (
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
                    <IconChartBar size={isMobile ? 16 : 18} color="white" />
                  </div>
                  <Title
                    level={isMobile ? 5 : 4}
                    style={{
                      margin: 0,
                      color: "#1a1a1a",
                      fontSize: isMobile ? "14px" : "18px",
                    }}
                  >
                    📊 Visualisasi Data MFA
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
                  Total: {totalMFA?.toLocaleString() || 0}
                </div>
              </Flex>

              <div
                style={{
                  padding: isMobile ? "4px 0" : "8px 0",
                  overflow: "hidden",
                }}
              >
                <PlotUsers data={mfaData} />
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
              <IconChartBar
                size={isMobile ? 40 : 48}
                color="#d9d9d9"
                style={{ marginBottom: "12px" }}
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
                Tidak ada data yang tersedia untuk unit organisasi ini
              </Text>
            </Flex>
          )}
        </Card>
      )}

      {/* Initial State */}
      {!selectedOpd && (
        <Card
          style={{
            borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
            border: "1px solid #e8e8e8",
            marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          }}
        >
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              padding: isMobile ? "30px 20px" : "40px 20px",
              color: "#999",
            }}
          >
            <IconSearch
              size={isMobile ? 40 : 48}
              color="#d9d9d9"
              style={{ marginBottom: "12px" }}
            />
            <Title
              level={isMobile ? 5 : 4}
              style={{ color: "#999", margin: "0 0 6px 0" }}
            >
              Pilih Unit Organisasi
            </Title>
            <Text
              type="secondary"
              style={{
                textAlign: "center",
                fontSize: isMobile ? "12px" : "14px",
              }}
            >
              Pilih unit organisasi untuk melihat data MFA
              <br />
              Gunakan kolom pencarian di atas untuk memilih unit organisasi
            </Text>
          </Flex>
        </Card>
      )}

      <style jsx global>{`
        .ant-statistic-content {
          display: flex !important;
          align-items: baseline !important;
          gap: 4px !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-tree-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #ff4500 !important;
        }

        .ant-tree-select-focused .ant-select-selector {
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

        .ant-card {
          box-shadow: none !important;
          border: 1px solid #e8e8e8 !important;
        }
      `}</style>
    </div>
  );
}

export default RekonMFA;
