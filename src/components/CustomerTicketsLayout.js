import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PullRequestOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Card, Flex, Grid, Tabs, Typography } from "antd";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;
const { Title } = Typography;

const CustomerTicketsLayout = ({ children, activeKey }) => {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const tabItems = [
    {
      key: "semua",
      label: <span>📋 Semua</span>,
      children: children,
    },
    {
      key: "diajukan",
      label: (
        <span>
          <SendOutlined /> Diajukan
        </span>
      ),
      children: children,
    },
    {
      key: "dikerjakan",
      label: (
        <span>
          <ClockCircleOutlined /> Dikerjakan
        </span>
      ),
      children: children,
    },
    {
      key: "selesai",
      label: (
        <span>
          <CheckCircleOutlined /> Selesai
        </span>
      ),
      children: children,
    },
  ];

  const handleTabChange = (activeKey) => {
    router.push(`/tickets/${activeKey}`);
  };

  const getTabItems = () => {
    return tabItems.map((item) => ({
      ...item,
      children: children,
    }));
  };

  return (
    <>
      <Flex>
        {/* Icon Section - Hide on mobile */}

        {/* Content Section */}
        <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={getTabItems()}
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
          font-weight: 500 !important;
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

          .ant-tabs-nav-wrap {
            padding: 0 12px !important;
          }
        }

        /* Small mobile responsive */
        @media (max-width: 480px) {
          .ant-tabs-tab {
            font-size: 11px !important;
            padding: 6px 6px !important;
            margin-right: 4px !important;
          }

          .ant-tabs-nav-wrap {
            padding: 0 8px !important;
            overflow-x: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          .ant-tabs-nav-wrap::-webkit-scrollbar {
            display: none !important;
          }

          .ant-tabs-nav-list {
            display: flex !important;
            white-space: nowrap !important;
          }

          .ant-tabs-tab {
            flex-shrink: 0 !important;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .ant-tabs-tab {
            font-size: 10px !important;
            padding: 6px 4px !important;
            margin-right: 2px !important;
          }

          .ant-tabs-nav-wrap {
            padding: 0 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerTicketsLayout;
