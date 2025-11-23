import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Text, Title } from "@mantine/core";
import {
  IconBeach,
  IconPlug,
  IconShield,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { Card, Grid, Tabs } from "antd";
import { useState } from "react";
import MenuProxy from "./Proxy/MenuProxy";
import RekonIPASN from "./RekonIPASN";
import RekonLayananPangkat from "./RekonLayananPangkat";
import RekonLayananPensiun from "./RekonLayananPensiun";
import RekonMFA from "./RekonMFA";

const { useBreakpoint } = Grid;

const RekonDashboardDetail = () => {
  useScrollRestoration();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [activeTab, setActiveTab] = useState("menu");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: "menu",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconPlug
            size={isMobile ? 14 : 16}
            style={{ color: activeTab === "menu" ? "#FF4500" : "#666" }}
          />
          <Text
            size={isMobile ? "xs" : "sm"}
            fw={500}
            style={{
              color: activeTab === "menu" ? "#FF4500" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            Menu Integrasi
          </Text>
        </div>
      ),
      children: <MenuProxy />,
    },
    {
      key: "mfa",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconShield
            size={isMobile ? 14 : 16}
            style={{ color: activeTab === "mfa" ? "#FF4500" : "#666" }}
          />
          <Text
            size={isMobile ? "xs" : "sm"}
            fw={500}
            style={{
              color: activeTab === "mfa" ? "#FF4500" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            Multi Factor Authentication
          </Text>
        </div>
      ),
      children: <RekonMFA />,
    },
    {
      key: "pangkat",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconTrendingUp
            size={isMobile ? 14 : 16}
            style={{ color: activeTab === "pangkat" ? "#FF4500" : "#666" }}
          />
          <Text
            size={isMobile ? "xs" : "sm"}
            fw={500}
            style={{
              color: activeTab === "pangkat" ? "#FF4500" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            Kenaikan Pangkat
          </Text>
        </div>
      ),
      children: <RekonLayananPangkat />,
    },
    {
      key: "pensiun",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconBeach
            size={isMobile ? 14 : 16}
            style={{ color: activeTab === "pensiun" ? "#FF4500" : "#666" }}
          />
          <Text
            size={isMobile ? "xs" : "sm"}
            fw={500}
            style={{
              color: activeTab === "pensiun" ? "#FF4500" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            Layanan Pemberhentian
          </Text>
        </div>
      ),
      children: <RekonLayananPensiun />,
    },
    {
      key: "ipasn",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconUsers
            size={isMobile ? 14 : 16}
            style={{ color: activeTab === "ipasn" ? "#FF4500" : "#666" }}
          />
          <Text
            size={isMobile ? "xs" : "sm"}
            fw={500}
            style={{
              color: activeTab === "ipasn" ? "#FF4500" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            Indeks Profesionalitas ASN
          </Text>
        </div>
      ),
      children: <RekonIPASN />,
    },
  ];

  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: "none",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "#FF4500",
          color: "white",
          padding: isMobile ? "12px" : "14px 16px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
          margin: "-24px -24px 0 -24px",
        }}
      >
        <IconShield
          style={{ fontSize: isMobile ? "18px" : "20px", marginBottom: "4px" }}
        />
        <Title
          level={isMobile ? 5 : 4}
          style={{
            color: "white",
            margin: 0,
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          Dashboard Rekonisiliasi Data
        </Title>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: isMobile ? 11 : 12,
          }}
        >
          Monitoring dan rekonisiliasi data layanan SIASN
        </Text>
      </div>

      {/* Tabs Section */}
      <div style={{ marginTop: "12px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size={isMobile ? "small" : "middle"}
          tabBarGutter={isMobile ? 8 : 16}
          tabPosition="top"
          type="line"
          centered
        />
      </div>
    </Card>
  );
};

export default RekonDashboardDetail;
