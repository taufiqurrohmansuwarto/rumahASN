import { VideoCameraOutlined } from "@ant-design/icons";
import { Flex, Grid, Tabs, Typography } from "antd";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;

function WebinarUserLayout({ children, active = "all" }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const tabItems = [
    {
      key: "all",
      label: <Typography.Text>📺 Semua Webinar</Typography.Text>,
      children: children,
    },
    {
      key: "my-webinar",
      label: <Typography.Text>👤 Webinar Saya</Typography.Text>,
      children: children,
    },
  ];

  const handleTabChange = (activeKey) => {
    router.push(`/webinar-series/${activeKey}`);
  };

  return (
    <Flex vertical style={{ width: "100%" }}>
      <Flex>
        {/* Icon Section - Hide on mobile */}
        {!isMobile && (
          <div
            style={{
              width: iconSectionWidth,
              backgroundColor: "#F8F9FA",
              borderRight: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
            }}
          >
            <VideoCameraOutlined
              style={{ color: "#FF4500", fontSize: "18px" }}
            />
          </div>
        )}

        {/* Content Section */}
        <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <Tabs
            activeKey={active}
            onChange={handleTabChange}
            items={tabItems}
            size={isMobile ? "small" : "default"}
            tabBarStyle={{
              margin: 0,
              paddingLeft: isMobile ? "16px" : "20px",
              paddingRight: isMobile ? "16px" : "20px",
            }}
          />
        </div>
      </Flex>

      <style jsx global>{`
        .ant-tabs-tab {
          color: #787c7e !important;
          font-weight: 400 !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          border-radius: 4px 4px 0 0 !important;
          transition: all 0.2s ease !important;
        }

        .ant-tabs-tab:hover {
          color: #ff4500 !important;
        }

        .ant-tabs-tab-active {
          color: #ff4500 !important;
          font-weight: 400 !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff4500 !important;
        }

        .ant-tabs-ink-bar {
          background: #ff4500 !important;
          height: 3px !important;
          border-radius: 2px !important;
        }

        .ant-tabs-nav::before {
          border-bottom: 1px solid #edeff1 !important;
        }

        .ant-tabs-content-holder {
          background-color: transparent !important;
        }

        .ant-tabs-content {
          background-color: transparent !important;
        }

        /* Responsive styles for children container */
        @media (max-width: 1200px) {
          .webinar-children-container {
            padding: 16px !important;
          }
        }

        /* Tablet responsive */
        @media (max-width: 1024px) {
          .ant-tabs-tab {
            font-size: 13px !important;
            padding: 10px 12px !important;
          }
          .webinar-children-container {
            padding: 14px !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .ant-tabs-tab {
            font-size: 12px !important;
            padding: 8px 8px !important;
          }
          .webinar-children-container {
            padding: 12px !important;
          }
        }

        /* Small mobile responsive */
        @media (max-width: 480px) {
          .ant-tabs-tab {
            font-size: 11px !important;
            padding: 6px 6px !important;
          }
          .webinar-children-container {
            padding: 8px !important;
          }
        }
      `}</style>
    </Flex>
  );
}

export default WebinarUserLayout;
