import React from "react";
import { Card, Typography, Spin, List, Flex, Grid } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useRelatedContent } from "@/hooks/knowledge-management/useRelatedContent";
import { useRouter } from "next/router";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const RelatedContent = ({ contentId }) => {
  const { data, isLoading, error } = useRelatedContent(contentId);
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Flex>
      {/* Icon Section */}

      {/* Content Section */}
      <div style={{ flex: 1, padding: "16px", marginTop: 32 }}>
        {/* Header */}
        <div
          style={{
            marginBottom: isMobile ? 16 : 20,
            borderBottom: "2px solid #f5f5f5",
            paddingBottom: isMobile ? 12 : 16,
          }}
        >
          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              color: "#262626",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📑 Konten Terkait
          </Title>
          <Text
            type="secondary"
            italic
            style={{
              fontSize: isMobile ? 12 : 13,
              marginTop: 4,
              display: "block",
            }}
          >
            Konten serupa yang mungkin relevan
          </Text>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <Spin tip="Memuat konten terkait..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "24px 16px" : "32px 24px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              ⚠️ Gagal memuat konten terkait
            </Text>
          </div>
        )}

        {/* Content List */}
        {!isLoading &&
          !error &&
          data?.relatedContent &&
          data.relatedContent.length > 0 && (
            <List
              dataSource={data.relatedContent}
              rowKey={(row) => row?.id}
              split={false}
              renderItem={(content, index) => (
                <List.Item
                  style={{
                    padding: isMobile ? "12px 0" : "16px 0",
                    borderBottom:
                      index === data.relatedContent.length - 1
                        ? "none"
                        : "1px solid #f5f5f5",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                      e.currentTarget.style.borderRadius = "6px";
                      e.currentTarget.style.padding = "16px 12px";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderRadius = "0";
                      e.currentTarget.style.padding = "16px 0";
                    }
                  }}
                  onClick={() =>
                    router.push(`/knowledge-management/contents/${content.id}`)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: isMobile ? 8 : 12,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? 6 : 8,
                        height: isMobile ? 6 : 8,
                        borderRadius: "50%",
                        backgroundColor: "#FF4500",
                        flexShrink: 0,
                        marginTop: isMobile ? 6 : 8,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Typography.Link
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          lineHeight: isMobile ? 1.4 : 1.5,
                          color: "#262626",
                          fontWeight: 500,
                          display: "block",
                          transition: "color 0.2s ease",
                          marginBottom: content.summary ? 4 : 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#FF4500";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#262626";
                        }}
                      >
                        {content.title}
                      </Typography.Link>

                      {content.summary && (
                        <Text
                          italic
                          type="secondary"
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "#8c8c8c",
                          }}
                        >
                          {content.summary}
                        </Text>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          (!data?.relatedContent || data.relatedContent.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: isMobile ? "24px 16px" : "32px 24px",
                backgroundColor: "#f9f9f9",
                borderRadius: "6px",
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                📝 Belum ada konten terkait yang ditemukan
              </Text>
            </div>
          )}
      </div>
    </Flex>
  );
};

export default RelatedContent;
