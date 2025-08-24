import { Grid, Tabs } from "antd";
import { useRouter } from "next/router";
import ASNConnectHeader from "./ASNConnectHeader";

function LayoutASNConnect({ children, active = "asn-updates" }) {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const handleChangeTab = (key) => {
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
      label: "Pojok Pengetahuan",
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
    <div>
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
          activeKey={active}
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
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        .ant-pro-page-container-children-content {
          background-color: transparent !important;
        }

        .ant-tabs-tab {
          color: #787c7e !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          padding: 12px 0 !important;
          border-radius: 4px 4px 0 0 !important;
          transition: all 0.2s ease !important;
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
          border-radius: 2px !important;
        }

        .ant-tabs-content-holder {
          background-color: transparent !important;
        }

        .ant-tabs-content {
          background-color: transparent !important;
        }

        .ant-pro-page-container {
          background-color: transparent !important;
        }

        .ant-pro-page-container-warp {
          background-color: transparent !important;
        }

        .ant-tabs-nav::before {
          border-bottom: 1px solid #edeff1 !important;
        }

        .ant-pro-page-container-detail .ant-pro-page-container-detail-content {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}

export default LayoutASNConnect;
