import { Grid, Tabs } from "antd";
import { useRouter } from "next/router";

const RiwayatUsulanLayout = ({
  children,
  active = "all",
  loading,
  title,
  content,
  breadcrumbTitle,
}) => {
  const router = useRouter();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const handleChangeTab = (key) => {
    router.push(key);
  };

  const tabItems = [
    {
      key: "/pemutakhiran-data/usulan-siasn/inbox-usulan",
      label: "📥 Inbox Usulan",
    },
    {
      key: "/pemutakhiran-data/usulan-siasn/kenaikan-pangkat",
      label: "📈 Kenaikan Pangkat",
    },
    {
      key: "/pemutakhiran-data/usulan-siasn/perbaikan-nama",
      label: "✏️ Perbaikan Nama",
    },
    {
      key: "/pemutakhiran-data/usulan-siasn/pemberhentian",
      label: "🚪 Pemberhentian",
    },
    {
      key: "/pemutakhiran-data/usulan-siasn/pencantuman-gelar",
      label: "🎓 Pencantuman Gelar",
    },
    {
      key: "/pemutakhiran-data/usulan-siasn/masa-kerja",
      label: "⏱️ Penyesuaian Masa Kerja",
    },
  ];

  // Find the active key based on the active prop
  const getActiveKey = () => {
    const keyMap = {
      "inbox-usulan": "/pemutakhiran-data/usulan-siasn/inbox-usulan",
      "kenaikan-pangkat": "/pemutakhiran-data/usulan-siasn/kenaikan-pangkat",
      "perbaikan-nama": "/pemutakhiran-data/usulan-siasn/perbaikan-nama",
      pemberhentian: "/pemutakhiran-data/usulan-siasn/pemberhentian",
      "pencantuman-gelar": "/pemutakhiran-data/usulan-siasn/pencantuman-gelar",
      "masa-kerja": "/pemutakhiran-data/usulan-siasn/masa-kerja",
    };
    return keyMap[active] || tabItems[0].key;
  };

  return (
    <div style={{ backgroundColor: "#DAE0E6" }}>
      {/* Navigation Tabs */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EDEFF1",
          padding: screens.xs ? "0 12px" : "0 24px",
        }}
      >
        <Tabs
          activeKey={getActiveKey()}
          onChange={handleChangeTab}
          items={tabItems}
          size="large"
          style={{ marginBottom: 0 }}
          tabBarStyle={{
            marginBottom: 0,
            borderBottom: "none",
          }}
        />
      </div>

      {/* Content Area */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: screens.xs ? "20px 12px" : "24px 20px",
        }}
      >
        {children}
      </div>

      <style jsx global>{`
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

        .ant-tabs-nav::before {
          border-bottom: 1px solid #edeff1 !important;
        }
      `}</style>
    </div>
  );
};

export default RiwayatUsulanLayout;
