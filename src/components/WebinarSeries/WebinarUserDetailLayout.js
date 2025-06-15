import { webinarUserDetail } from "@/services/webinar.services";
import { PlaySquareOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Flex, Grid, Skeleton, Space, Tabs, Tag, Typography } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;

const WebinarUserTitle = ({ data }) => {
  return (
    <Space align="center" size="middle">
      <PlaySquareOutlined
        style={{
          fontSize: "20px",
          color: "#FF4500",
          marginRight: "4px",
        }}
      />
      <Typography.Title
        level={3}
        style={{
          margin: 0,
          color: "#1C1C1C",
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "1.3",
        }}
      >
        {data?.title || "Loading..."}
      </Typography.Title>
    </Space>
  );
};

const WebinarUserContent = ({ data }) => {
  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Space wrap size="middle">
        <Tag
          color={data?.is_open ? "success" : "error"}
          style={{
            borderRadius: "6px",
            padding: "4px 12px",
            fontWeight: 500,
            fontSize: "13px",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{data?.is_open ? "✅" : "❌"}</span>
          {data?.is_open ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
        </Tag>

        <Tag
          color={data?.is_allow_download_certificate ? "processing" : "warning"}
          style={{
            borderRadius: "6px",
            padding: "4px 12px",
            fontWeight: 500,
            fontSize: "13px",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{data?.is_allow_download_certificate ? "📜" : "⏳"}</span>
          {data?.is_allow_download_certificate
            ? "Sertifikat Siap Unduh"
            : "Sertifikat Belum Siap"}
        </Tag>
      </Space>
    </Space>
  );
};

function WebinarUserDetailLayout({
  children,
  active = "detail",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const { id } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const { data, isLoading } = useQuery(
    ["webinar-user-detail", id],
    () => webinarUserDetail(id),
    {
      keepPreviousData: true,
    }
  );

  const tabItems = [
    {
      key: "detail",
      label: <Typography.Text>📋 Detail Webinar</Typography.Text>,
      children: <Skeleton loading={isLoading}>{children}</Skeleton>,
    },
    {
      key: "absence",
      label: <Typography.Text>✅ Presensi</Typography.Text>,
      children: <Skeleton loading={isLoading}>{children}</Skeleton>,
    },
    {
      key: "comments",
      label: <Typography.Text>💬 Diskusi</Typography.Text>,
      children: <Skeleton loading={isLoading}>{children}</Skeleton>,
    },
    {
      key: "ratings",
      label: <Typography.Text>⭐ Ulasan</Typography.Text>,
      children: <Skeleton loading={isLoading}>{children}</Skeleton>,
    },
  ];

  const handleTabChange = (activeKey) => {
    const path = `/webinar-series/my-webinar/${id}/${activeKey}`;
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>
          My Webinar - Detail Webinar - {data?.webinar_series?.title}{" "}
        </title>
      </Head>

      <Flex vertical style={{ width: "100%" }}>
        <div
          style={{
            padding: isMobile ? "20px 16px" : "28px 24px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <WebinarUserTitle data={data?.result?.webinar_series} />
          </div>
          <WebinarUserContent data={data?.result?.webinar_series} />
        </div>

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
              <PlaySquareOutlined
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
    </>
  );
}

export default WebinarUserDetailLayout;
