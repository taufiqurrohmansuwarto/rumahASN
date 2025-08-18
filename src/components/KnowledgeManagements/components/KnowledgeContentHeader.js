import { Card, Space, Tag, Typography, Affix, Flex, Grid } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  BookOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeContentHeader = ({ data }) => {
  // Responsive breakpoints - sama seperti di form
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  return (
    <>
      {/* Affix Header - Minimalis hanya dengan icon */}
      <Affix offsetTop={0}>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #EDEFF1",
            padding: isMobile ? "8px 16px" : "12px 24px",
            zIndex: 1000,
          }}
        >
          <Flex align="center" gap="small">
            <BookOutlined
              style={{
                color: "#FF4500",
                fontSize: isMobile ? "18px" : "20px",
              }}
            />
            <Text
              strong
              style={{
                color: "#1A1A1B",
                fontSize: isMobile ? "14px" : "16px",
                lineHeight: "1.4",
              }}
            >
              Knowledge Management
            </Text>
          </Flex>
        </div>
      </Affix>

      {/* Main Content Header */}
      <Card
        style={{
          width: "100%",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #EDEFF1",
          marginBottom: isMobile ? "12px" : "16px",
          marginTop: isMobile ? "8px" : "12px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile, sama seperti form */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
              }}
            >
              <BookOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Judul */}
              <div>
                <Title
                  level={isMobile ? 4 : 2}
                  style={{
                    marginBottom: "8px",
                    color: "#1A1A1B",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  {data?.title}
                </Title>
              </div>

              {/* Kategori dan Tags */}
              <Space wrap size="small">
                {data?.category && (
                  <Tag
                    color="#FF4500"
                    style={{
                      fontSize: isMobile ? "12px" : "13px",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {data?.category?.name}
                  </Tag>
                )}

                {data?.tags &&
                  data.tags.length > 0 &&
                  data.tags.map((tag, index) => (
                    <Tag
                      key={index}
                      style={{
                        fontSize: isMobile ? "11px" : "12px",
                        padding: "3px 10px",
                        borderRadius: "14px",
                        backgroundColor: "#f6f6f6",
                        border: "1px solid #d9d9d9",
                        color: "#595959",
                        margin: "2px",
                      }}
                    >
                      #{tag}
                    </Tag>
                  ))}
              </Space>

              {/* Meta informasi dengan icons */}
              <Space
                wrap
                size={isMobile ? "small" : "large"}
                style={{
                  color: "#787C7E",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                <Space size="small">
                  <CalendarOutlined style={{ color: "#FF4500" }} />
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? "12px" : "14px" }}
                  >
                    {dayjs(data?.created_at).format("DD MMMM YYYY")}
                  </Text>
                </Space>

                {data?.updated_at && data?.updated_at !== data?.created_at && (
                  <Space size="small">
                    <EditOutlined style={{ color: "#FF4500" }} />
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? "12px" : "14px" }}
                    >
                      Diperbarui:{" "}
                      {dayjs(data?.updated_at).format("DD MMMM YYYY")}
                    </Text>
                  </Space>
                )}

                <Space size="small">
                  <EyeOutlined style={{ color: "#FF4500" }} />
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? "12px" : "14px" }}
                  >
                    {data?.views_count || 0} views
                  </Text>
                </Space>

                <Space size="small">
                  <LikeOutlined style={{ color: "#FF4500" }} />
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? "12px" : "14px" }}
                  >
                    {data?.likes_count || 0} likes
                  </Text>
                </Space>

                <Space size="small">
                  <MessageOutlined style={{ color: "#FF4500" }} />
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? "12px" : "14px" }}
                  >
                    {data?.comments_count || 0} komentar
                  </Text>
                </Space>
              </Space>
            </Space>
          </div>
        </Flex>
      </Card>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        /* Fix untuk icon section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        /* Fix untuk content section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        .ant-tag {
          transition: all 0.2s ease !important;
        }

        .ant-tag:hover {
          transform: translateY(-1px) !important;
        }

        @media (max-width: 768px) {
          .ant-affix {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </>
  );
};

export default KnowledgeContentHeader;
