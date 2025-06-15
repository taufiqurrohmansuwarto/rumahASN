import { useRouter } from "next/router";
import { Breadcrumb, Flex, Grid, Tabs, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import Link from "next/link";

const { useBreakpoint } = Grid;

function LayoutParticipant({
  children,
  active = "all",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const tabItems = [
    {
      key: "all",
      label: <Typography.Text>🎯 Coaching & Mentoring</Typography.Text>,
      children: children,
    },
    {
      key: "my-coaching-clinic",
      label: <Typography.Text>📋 Daftar Mentoring Saya</Typography.Text>,
      children: children,
    },
  ];

  const handleTabChange = (activeKey) => {
    if (activeKey === "all") {
      router.push("/coaching-clinic/all");
    } else {
      router.push(`/coaching-clinic/${activeKey}`);
    }
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
            <TeamOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
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

        /* Tablet responsive */
        @media (max-width: 1024px) {
          .ant-tabs-tab {
            font-size: 13px !important;
            padding: 10px 12px !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .ant-tabs-tab {
            font-size: 12px !important;
            padding: 8px 8px !important;
          }
        }

        /* Small mobile responsive */
        @media (max-width: 480px) {
          .ant-tabs-tab {
            font-size: 11px !important;
            padding: 6px 6px !important;
          }
        }
      `}</style>
    </Flex>
  );
}

export default LayoutParticipant;
