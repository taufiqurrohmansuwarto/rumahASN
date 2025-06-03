import PlotUsers from "@/components/Dashboards/PlotUsers";
import { getUnorSimaster } from "@/services/rekon.services";
import { getListMfa } from "@/services/siasn-services";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Skeleton,
  Space,
  Statistic,
  TreeSelect,
  Typography,
} from "antd";
import React, { useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;

function RekonMFA() {
  const [selectedOpd, setSelectedOpd] = useState(null);

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
    const result = await listMfa({
      skpd_id: selectedOpd,
      type: "download",
      aktivasi,
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result);

    XLSX.utils.book_append_sheet(workbook, worksheet, "MFA");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), `mfa_${aktivasi}.xlsx`);
  };

  const totalMFA = mfaData?.reduce((acc, item) => acc + item.value, 0) || 0;

  const getStatusValue = (status) => {
    return mfaData?.find((item) => item.title === status)?.value || 0;
  };

  const calculatePercentage = (status) => {
    if (!mfaData?.length || totalMFA === 0) return "(0%)";

    const value = getStatusValue(status);
    return `(${((value / totalMFA) * 100).toFixed(2)}%)`;
  };

  const statisticItems = [
    {
      title: "Total Pegawai",
      key: "total",
      value: totalMFA,
      prefix: <UserOutlined />,
      valueStyle: { color: "#6366F1" },
      color: "#EEF2FF",
      borderColor: "#C7D2FE",
      iconBg: "#6366F1",
    },
    {
      title: "Sudah MFA",
      value: getStatusValue("SUDAH"),
      key: "SUDAH",
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: "#22C55E" },
      suffix: calculatePercentage("SUDAH"),
      color: "#F0FDF4",
      borderColor: "#BBF7D0",
      iconBg: "#22C55E",
    },
    {
      title: "Belum MFA",
      key: "BELUM",
      value: getStatusValue("BELUM"),
      prefix: <CloseCircleOutlined />,
      valueStyle: { color: "#EF4444" },
      suffix: calculatePercentage("BELUM"),
      color: "#FEF2F2",
      borderColor: "#FECACA",
      iconBg: "#EF4444",
    },
    {
      title: "Tidak Terdata",
      key: "TIDAK TERDATA",
      value: getStatusValue("TIDAK TERDATA"),
      prefix: <QuestionCircleOutlined />,
      valueStyle: { color: "#F59E0B" },
      suffix: calculatePercentage("TIDAK TERDATA"),
      color: "#FFFBEB",
      borderColor: "#FDE68A",
      iconBg: "#F59E0B",
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
        <Title
          level={2}
          style={{ margin: 0, color: "#1F2937", fontWeight: 700 }}
        >
          Multi Factor Authentication
        </Title>
        <Text type="secondary" style={{ fontSize: "16px", lineHeight: "24px" }}>
          Monitoring dan rekapitulasi data aktivasi MFA pegawai
        </Text>
      </div>

      {/* Search Section */}
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
            <SearchOutlined style={{ color: "#6B7280", fontSize: "16px" }} />
            <Text strong style={{ color: "#374151", fontSize: "16px" }}>
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
            size="large"
            allowClear
          />
        </Space>
      </Card>

      {/* Statistics Section */}
      {selectedOpd && (
        <div style={{ marginBottom: "24px" }}>
          {mfaLoading ? (
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4].map((item) => (
                <Col xs={24} sm={12} lg={6} key={item}>
                  <Card style={{ borderRadius: "16px" }}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[24, 24]}>
              {statisticItems.map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card
                    style={{
                      borderRadius: "16px",
                      border: `1px solid ${item.borderColor}`,
                      backgroundColor: item.color,
                      transition: "all 0.3s ease",
                      cursor: "default",
                    }}
                    bodyStyle={{ padding: "24px" }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={16}
                      style={{ width: "100%" }}
                    >
                      {/* Header */}
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={12}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              backgroundColor: item.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {React.cloneElement(item.prefix, {
                              style: { color: "white", fontSize: "18px" },
                            })}
                          </div>
                          <Text
                            strong
                            style={{ color: "#374151", fontSize: "14px" }}
                          >
                            {item.title}
                          </Text>
                        </Flex>

                        {index !== 0 && (
                          <Button
                            type="primary"
                            size="small"
                            loading={listMfaLoading}
                            icon={<CloudDownloadOutlined />}
                            onClick={() => downloadMfa(item.key)}
                            style={{
                              borderRadius: "8px",
                              fontWeight: 500,
                              fontSize: "12px",
                              height: "32px",
                              padding: "0 12px",
                            }}
                          >
                            Download
                          </Button>
                        )}
                      </Flex>

                      {/* Statistic */}
                      <div>
                        <Statistic
                          value={item.value}
                          valueStyle={{
                            ...item.valueStyle,
                            fontSize: "28px",
                            fontWeight: 700,
                            lineHeight: "32px",
                          }}
                          suffix={
                            item.suffix && (
                              <Text
                                style={{
                                  fontSize: "14px",
                                  color: "#6B7280",
                                  fontWeight: 500,
                                }}
                              >
                                {item.suffix}
                              </Text>
                            )
                          }
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* Chart Section */}
      {selectedOpd && (
        <div>
          {mfaLoading ? (
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
          ) : mfaData && mfaData.length > 0 ? (
            <Card
              style={{
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "32px" }}
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
                    Visualisasi Data MFA
                  </Title>
                  <Badge
                    count={totalMFA}
                    style={{ backgroundColor: "#6366F1" }}
                  />
                </Flex>

                <div style={{ padding: "16px 0" }}>
                  <PlotUsers data={mfaData} />
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
              <Empty
                description={
                  <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                    Tidak ada data yang tersedia untuk unit organisasi ini
                  </Text>
                }
              />
            </Card>
          )}
        </div>
      )}

      {/* Initial State */}
      {!selectedOpd && (
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
          bodyStyle={{ padding: "64px 32px" }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={8}>
                <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                  Pilih unit organisasi untuk melihat data MFA
                </Text>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Gunakan kolom pencarian di atas untuk memilih unit organisasi
                </Text>
              </Space>
            }
          />
        </Card>
      )}
    </div>
  );
}

export default RekonMFA;
