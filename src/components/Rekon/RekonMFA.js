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
import { Badge, Text, Title } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Row,
  Skeleton,
  Space,
  TreeSelect,
} from "antd";
import React, { useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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
      icon: <IconUser size={16} />,
      color: "orange",
    },
    {
      title: "Sudah MFA",
      value: getStatusValue("SUDAH"),
      key: "SUDAH",
      icon: <IconCircleCheck size={16} />,
      color: "green",
      suffix: calculatePercentage("SUDAH"),
    },
    {
      title: "Belum MFA",
      key: "BELUM",
      value: getStatusValue("BELUM"),
      icon: <IconCircleX size={16} />,
      color: "red",
      suffix: calculatePercentage("BELUM"),
    },
    {
      title: "Tidak Terdata",
      key: "TIDAK TERDATA",
      value: getStatusValue("TIDAK TERDATA"),
      icon: <IconQuestionMark size={16} />,
      color: "yellow",
      suffix: calculatePercentage("TIDAK TERDATA"),
    },
  ];

  return (
    <div>
      {/* Search Section */}
      <div style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
        <Row gutter={[16, 8]} align="middle">
          <Col span={24}>
            <Space size="small" align="center" style={{ marginBottom: 8 }}>
              <IconSearch size={16} style={{ color: "#FF4500" }} />
              <Text size="sm" fw={500}>
                Pilih Unit Organisasi
              </Text>
            </Space>
            <TreeSelect
              loading={unorLoading}
              treeData={unorData}
              treeNodeFilterProp="title"
              placeholder="Ketik nama unit organisasi untuk mencari..."
              listHeight={400}
              showSearch
              style={{ width: "100%" }}
              onChange={setSelectedOpd}
              allowClear
            />
          </Col>
        </Row>
      </div>

      {/* Statistics Section */}
      {selectedOpd && (
        <div style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
          {mfaLoading ? (
            <Row gutter={[12, 12]}>
              {[1, 2, 3, 4].map((item) => (
                <Col xs={12} sm={6} md={6} lg={6} key={item}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[12, 12]}>
              {statisticItems.map((item, index) => (
                <Col xs={12} sm={6} md={6} lg={6} key={index}>
                  <div
                    style={{
                      padding: "12px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Space size="small" align="center" style={{ width: "100%", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Badge
                            leftSection={item.icon}
                            color={item.color}
                            variant="light"
                            size="sm"
                            styles={{
                              root: {
                                border: "none",
                              },
                              section: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            }}
                          >
                            <Text size="xs" fw={500}>
                              {item.title}
                            </Text>
                          </Badge>
                        </div>
                      </div>
                      {index !== 0 && (
                        <Button
                          type="primary"
                          size="small"
                          loading={listMfaLoading}
                          icon={<IconDownload size={12} />}
                          onClick={() => downloadMfa(item.key)}
                          style={{
                            backgroundColor: "#FF4500",
                            borderColor: "#FF4500",
                            fontSize: "11px",
                            height: "24px",
                            padding: "0 8px",
                          }}
                        />
                      )}
                    </Space>
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <Text size="lg" fw={700}>
                        {item.value?.toLocaleString('id-ID') || 0}
                      </Text>
                      {item.suffix && (
                        <Text size="xs" c="dimmed">
                          {item.suffix}
                        </Text>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* Chart Section */}
      {selectedOpd && (
        <div style={{ padding: "16px 0" }}>
          {mfaLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : mfaData && mfaData.length > 0 ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Space size="small" align="center">
                  <IconChartBar size={16} style={{ color: "#FF4500" }} />
                  <Text size="sm" fw={500}>
                    Visualisasi Data MFA
                  </Text>
                </Space>
                <Badge color="orange" variant="filled" size="sm">
                  Total: {totalMFA?.toLocaleString('id-ID') || 0}
                </Badge>
              </div>
              <div style={{ overflow: "hidden" }}>
                <PlotUsers data={mfaData} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
              <IconChartBar size={48} color="#d9d9d9" style={{ marginBottom: "12px" }} />
              <Title level={4} style={{ color: "#999", margin: "0 0 6px 0" }}>
                Tidak ada data tersedia
              </Title>
              <Text c="dimmed" size="sm">
                Tidak ada data yang tersedia untuk unit organisasi ini
              </Text>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!selectedOpd && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
          <IconSearch size={48} color="#d9d9d9" style={{ marginBottom: "12px" }} />
          <Title level={4} style={{ color: "#999", margin: "0 0 6px 0" }}>
            Pilih Unit Organisasi
          </Title>
          <Text c="dimmed" size="sm">
            Pilih unit organisasi untuk melihat data MFA
            <br />
            Gunakan kolom pencarian di atas untuk memilih unit organisasi
          </Text>
        </div>
      )}
    </div>
  );
}

export default RekonMFA;
