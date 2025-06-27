import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Card, Flex, Grid, Typography } from "antd";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import DashboardKomparasiAdmin from "../DashboardKomparasiAdmin";
import DashboardKompareFasilitator from "../DashboardKompareFasilitator";
import DashboardDimensiAccuracy from "./DashboardDimensiAccuracy";
import DashboardDimensiCompleteness from "./DashboardDimensiCompleteness";
import DashboardDimensiConsistency from "./DashboardDimensiConsistency";
import DashboardDimensiTimeliness from "./DashboardDimensiTimeliness";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const DetailKualitasData = () => {
  useScrollRestoration();
  const { data: session } = useSession();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const admin = session?.user?.current_role === "admin";
  const fasilitator = session?.user?.role === "FASILITATOR";

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState(() => {
    if (admin) return "komparasi-admin";
    if (fasilitator) return "komparasi-fasilitator";
    return "accuracy";
  });

  // Konfigurasi tab items dengan hierarki yang jelas
  const tabItems = [];

  // Tab khusus admin/fasilitator
  if (admin) {
    tabItems.push({
      key: "komparasi-admin",
      label: "🔍 Deteksi Anomali",
      description: "Analisis perbedaan data untuk admin",
      icon: <DatabaseOutlined />,
      children: <DashboardKomparasiAdmin />,
    });
  }

  if (fasilitator) {
    tabItems.push({
      key: "komparasi-fasilitator",
      label: "📊 Dashboard Fasilitator",
      description: "Ringkasan data untuk fasilitator",
      icon: <BarChartOutlined />,
      children: <DashboardKompareFasilitator />,
    });
  }

  // Tab dimensi kualitas data
  tabItems.push(
    {
      key: "accuracy",
      label: "📊 Keakuratan",
      description: "Dimensi Accuracy - tingkat kebenaran data",
      icon: <DatabaseOutlined />,
      children: <DashboardDimensiAccuracy />,
    },
    {
      key: "completeness",
      label: "📋 Kelengkapan",
      description: "Dimensi Completeness - tingkat kelengkapan data",
      icon: <FileTextOutlined />,
      children: <DashboardDimensiCompleteness />,
    },
    {
      key: "consistency",
      label: "🔄 Konsistensi",
      description: "Dimensi Consistency - keseragaman data",
      icon: <SyncOutlined />,
      children: <DashboardDimensiConsistency />,
    },
    {
      key: "timeliness",
      label: "⏰ Ketepatan Waktu",
      description: "Dimensi Timeliness - ketepatan waktu data",
      icon: <ClockCircleOutlined />,
      children: <DashboardDimensiTimeliness />,
    }
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
    // Scroll ke atas saat ganti tab untuk UX yang lebih baik
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTabData = tabItems.find((tab) => tab.key === activeTab);

  return (
    <div>
      {/* Header Tab Navigation - Prioritas Utama */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "8px" : isTablet ? "10px" : "12px",
        }}
        bodyStyle={{
          padding: isMobile ? "12px" : isTablet ? "16px" : "20px",
        }}
      >
        {/* Tab Navigation - Desain Responsif */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "8px" : "4px",
            flexWrap: isMobile ? "nowrap" : "wrap",
            justifyContent: isMobile ? "stretch" : "flex-start",
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          {tabItems.map((tab) => (
            <div
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: isMobile
                  ? "12px 16px"
                  : isTablet
                  ? "10px 16px"
                  : "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor:
                  activeTab === tab.key ? "#FF4500" : "transparent",
                border: `2px solid ${
                  activeTab === tab.key ? "#FF4500" : "#e5e7eb"
                }`,
                color: activeTab === tab.key ? "white" : "#1a1a1a",
                fontWeight: activeTab === tab.key ? 600 : 400,
                fontSize: isMobile ? "13px" : isTablet ? "14px" : "15px",
                textAlign: isMobile ? "center" : "left",
                minWidth: isMobile ? "auto" : "140px",
                boxShadow:
                  activeTab === tab.key
                    ? "0 4px 12px rgba(255, 69, 0, 0.3)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
                transform: activeTab === tab.key ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = "#fff7e6";
                  e.currentTarget.style.borderColor = "#FF4500";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(255, 69, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              <Flex
                align="center"
                gap={isMobile ? 8 : 10}
                justify={isMobile ? "center" : "flex-start"}
                wrap={false}
              >
                {/* Icon dengan styling yang konsisten */}
                <div
                  style={{
                    width: isMobile ? "20px" : "24px",
                    height: isMobile ? "20px" : "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {React.cloneElement(tab.icon, {
                    style: {
                      fontSize: isMobile ? "16px" : "18px",
                      color: activeTab === tab.key ? "white" : "#FF4500",
                    },
                  })}
                </div>

                {/* Label dan Description */}
                <div
                  style={{
                    flex: 1,
                    textAlign: isMobile ? "center" : "left",
                    overflow: "hidden",
                  }}
                >
                  <Text
                    style={{
                      color: activeTab === tab.key ? "white" : "#1a1a1a",
                      fontSize: isMobile ? "13px" : isTablet ? "14px" : "15px",
                      fontWeight: activeTab === tab.key ? 600 : 500,
                      display: "block",
                      lineHeight: "1.2",
                      marginBottom: isMobile || isTablet ? "0" : "2px",
                    }}
                  >
                    {tab.label}
                  </Text>

                  {/* Description hanya muncul di desktop dan untuk tab aktif */}
                  {(isDesktop || activeTab === tab.key) && (
                    <Text
                      style={{
                        color:
                          activeTab === tab.key
                            ? "rgba(255,255,255,0.8)"
                            : "#666",
                        fontSize: isMobile ? "10px" : "11px",
                        display: "block",
                        lineHeight: "1.2",
                        fontStyle: "italic",
                        marginTop: "1px",
                      }}
                    >
                      {tab.description}
                    </Text>
                  )}
                </div>
              </Flex>
            </div>
          ))}
        </div>
      </Card>

      {/* Content Area - Konten Tab Aktif */}
      <div
        style={{
          minHeight: "400px",
          transition: "opacity 0.3s ease",
        }}
      >
        {activeTabData?.children}
      </div>
    </div>
  );
};

export default DetailKualitasData;
