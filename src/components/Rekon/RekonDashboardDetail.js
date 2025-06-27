import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, Flex, FloatButton, Grid, Row, Tabs, Typography } from "antd";
import React, { useState } from "react";
import RekonIPASN from "./RekonIPASN";
import RekonLayananPangkat from "./RekonLayananPangkat";
import RekonLayananPensiun from "./RekonLayananPensiun";
import RekonMFA from "./RekonMFA";
import RekonPG from "./RekonPG";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const RekonDashboardDetail = () => {
  useScrollRestoration();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const [activeTab, setActiveTab] = useState("mfa");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: "mfa",
      label: (
        <Text
          style={{
            fontWeight: 400,
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            color: activeTab === "mfa" ? "#FF4500" : "#666",
            transition: "all 0.3s ease",
          }}
        >
          🔐 Multi Factor Authentication
        </Text>
      ),
      children: <RekonMFA />,
    },
    {
      key: "pangkat",
      label: (
        <Text
          style={{
            fontWeight: 400,
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            color: activeTab === "pangkat" ? "#FF4500" : "#666",
            transition: "all 0.3s ease",
          }}
        >
          📈 Kenaikan Pangkat
        </Text>
      ),
      children: <RekonLayananPangkat />,
    },
    {
      key: "pensiun",
      label: (
        <Text
          style={{
            fontWeight: 400,
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            color: activeTab === "pensiun" ? "#FF4500" : "#666",
            transition: "all 0.3s ease",
          }}
        >
          🏖️ Layanan Pensiun
        </Text>
      ),
      children: <RekonLayananPensiun />,
    },
    {
      key: "ipasn",
      label: (
        <Text
          style={{
            fontWeight: 400,
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            color: activeTab === "ipasn" ? "#FF4500" : "#666",
            transition: "all 0.3s ease",
          }}
        >
          👥 IPASN
        </Text>
      ),
      children: <RekonIPASN />,
    },
    {
      key: "pg",
      label: (
        <Text
          style={{
            fontWeight: 400,
            fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
            color: activeTab === "pg" ? "#FF4500" : "#666",
            transition: "all 0.3s ease",
          }}
        >
          📊 Pencantuman Gelar
        </Text>
      ),
      children: <RekonPG />,
    },
  ];

  return (
    <>
      <Row>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={24}
          style={{
            padding: 0,
          }}
        >
          <FloatButton.BackTop />

          <Flex vertical gap={isMobile ? 8 : 16}>
            {/* Tabs Section */}
            <Row gutter={[0, 0]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  items={tabItems}
                  size={isMobile ? "small" : "middle"}
                  style={{
                    margin: 0,
                    width: "100%",
                  }}
                  tabBarStyle={{
                    margin: 0,
                    padding: isMobile
                      ? "4px 8px 0"
                      : isTablet
                      ? "8px 12px 0"
                      : "12px 20px 0",
                    backgroundColor: "transparent",
                    borderBottom: "1px solid #e8e8e8",
                    overflowX: isMobile ? "auto" : "visible",
                    whiteSpace: isMobile ? "nowrap" : "normal",
                  }}
                  tabBarGutter={isMobile ? 4 : isTablet ? 8 : 16}
                  tabPosition="top"
                  type="line"
                />
              </Col>
            </Row>
          </Flex>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-tabs-tab {
          padding: ${isMobile
            ? "8px 12px"
            : isTablet
            ? "10px 16px"
            : "12px 20px"} !important;
          border-radius: 0 !important;
          margin-bottom: 0 !important;
          border: none !important;
          background: transparent !important;
          transition: all 0.3s ease !important;
        }

        .ant-tabs-tab:hover {
          background-color: transparent !important;
        }

        .ant-tabs-tab-active {
          background-color: transparent !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff4500 !important;
        }

        .ant-tabs-ink-bar {
          background: #ff4500 !important;
          height: 3px !important;
        }

        .ant-tabs-content-holder {
          padding: 0 !important;
        }

        .ant-tabs-tabpane {
          padding: 0 !important;
          margin-top: ${isMobile
            ? "16px"
            : isTablet
            ? "20px"
            : "24px"} !important;
        }

        /* Mobile First - Extra Small devices (phones, 576px and down) */
        @media (max-width: 575.98px) {
          .ant-tabs-tab {
            padding: 4px 6px !important;
            margin-bottom: 0 !important;
            margin-right: 2px !important;
          }

          .ant-tabs-tabpane {
            padding: 0 !important;
            margin-top: 8px !important;
          }

          .ant-tabs-tab .ant-typography {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }

          .ant-tabs-nav {
            margin-bottom: 0 !important;
          }

          .ant-tabs-nav-wrap {
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }

          .ant-tabs-nav-list {
            white-space: nowrap !important;
          }
        }

        /* Small devices (landscape phones, 576px and up) */
        @media (min-width: 576px) and (max-width: 767.98px) {
          .ant-tabs-tab {
            padding: 6px 8px !important;
            margin-bottom: 0 !important;
          }

          .ant-tabs-tabpane {
            padding: 0 !important;
            margin-top: 12px !important;
          }

          .ant-tabs-tab .ant-typography {
            font-size: 11px !important;
          }
        }

        /* Medium devices (tablets, 768px and up) */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .ant-tabs-tab {
            padding: 8px 10px !important;
          }

          .ant-tabs-tabpane {
            padding: 0 !important;
            margin-top: 16px !important;
          }

          .ant-tabs-tab .ant-typography {
            font-size: 12px !important;
          }
        }

        /* Large devices (desktops, 992px and up) */
        @media (min-width: 992px) and (max-width: 1199.98px) {
          .ant-tabs-tab {
            padding: 10px 14px !important;
          }

          .ant-tabs-tabpane {
            padding: 0 !important;
            margin-top: 20px !important;
          }

          .ant-tabs-tab .ant-typography {
            font-size: 13px !important;
          }
        }

        /* Extra large devices (large desktops, 1200px and up) */
        @media (min-width: 1200px) {
          .ant-tabs-tab {
            padding: 12px 20px !important;
          }

          .ant-tabs-tabpane {
            padding: 0 !important;
            margin-top: 24px !important;
          }

          .ant-tabs-tab .ant-typography {
            font-size: 14px !important;
          }
        }

        .ant-tabs {
          color: inherit !important;
        }

        .ant-tabs-tab-btn {
          color: inherit !important;
        }

        .ant-float-btn-back-top {
          right: ${isMobile ? "16px" : "24px"} !important;
          bottom: ${isMobile ? "16px" : "24px"} !important;
        }
      `}</style>
    </>
  );
};

export default RekonDashboardDetail;
