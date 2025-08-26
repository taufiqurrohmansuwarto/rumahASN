import { Grid, Tabs } from "antd";
import { useRouter } from "next/router";
import ASNConnectHeader from "./ASNConnectHeader";

function LayoutASNConnect({ children, active = "asn-updates" }) {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  // Auto-detect active tab based on current path for knowledge section
  const getActiveTab = () => {
    if (router.pathname.startsWith("/asn-connect/asn-knowledge")) {
      return "asn-knowledge";
    }
    return active;
  };

  const handleChangeTab = (key) => {
    // Don't navigate if already on asn-knowledge and trying to go to asn-knowledge
    if (
      key === "asn-knowledge" &&
      router.pathname.startsWith("/asn-connect/asn-knowledge")
    ) {
      // If we're already in knowledge section, redirect to main knowledge page
      router.push("/asn-connect/asn-knowledge");
      return;
    }

    router.push(`/asn-connect/${key}`);
  };

  const tabItems = [
    {
      key: "asn-updates",
      label: "Beranda",
    },
    // {
    //   key: "asn-helper",
    //   label: "ASN Helper",
    // },
    {
      key: "asn-knowledge",
      label: "ASNPedia",
    },
    {
      key: "asn-discussions",
      label: "Forum",
    },

    // {
    //   key: "asn-communities",
    //   label: "Komunitas",
    // },
    // {
    //   key: "asn-events",
    //   label: "Kegiatan",
    // },
  ];

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* Header Component */}
      <ASNConnectHeader />

      {/* Navigation Tabs */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EDEFF1",
          padding: "0 20px",
        }}
      >
        <Tabs
          activeKey={getActiveTab()}
          onChange={handleChangeTab}
          items={tabItems}
          size="large"
          style={{
            marginBottom: 0,
          }}
          tabBarStyle={{
            marginBottom: 0,
            borderBottom: "none",
          }}
        />
      </div>

      {/* Content Area */}
      <div
        style={{
          // maxWidth: "1200px",
          // margin: "0 auto",
          padding: breakPoint.xs ? "20px 12px" : "24px 20px",
          minHeight: "calc(100vh - 200px)", // Prevent layout shift
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>{children}</div>
      </div>

      <style jsx global>{`
        .ant-tabs-tab {
          color: #787c7e !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          padding: 12px 0 !important;
        }

        .ant-tabs-tab:hover {
          color: #ff4500 !important;
        }

        .ant-tabs-tab-active {
          color: #ff4500 !important;
          font-weight: 600 !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff4500 !important;
        }

        .ant-tabs-ink-bar {
          background: #ff4500 !important;
          height: 3px !important;
        }

        .ant-tabs-nav::before {
          border-bottom: 1px solid #edeff1 !important;
        }
      `}</style>
    </div>
  );
}

export default LayoutASNConnect;
