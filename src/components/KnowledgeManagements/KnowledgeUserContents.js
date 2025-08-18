import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { getKnowledgeContents } from "@/services/knowledge-management.services";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDebouncedValue } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Input,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const KnowledgeUserContents = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(
    ["fetch-knowledge-user-contents", debouncedSearch],
    ({ pageParam = 1 }) =>
      getKnowledgeContents({
        page: pageParam,
        limit: 10,
        search: debouncedSearch,
      }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = allPages.length;
        const totalPages = Math.ceil(lastPage.total / 10);
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Flatten all pages data
  const allContents = data?.pages?.flatMap((page) => page.data) || [];

  const renderContentCard = (content) => (
    <Card
      key={content.id}
      style={{
        marginBottom: isMobile ? "12px" : "16px",
        borderRadius: isMobile ? "8px" : "12px",
        border: "1px solid #EDEFF1",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      hoverable
      onClick={() => {
        router.push(`/asn-connect/asn-knowledge/${content.id}`);
      }}
    >
      <Space direction="vertical" size={0} style={{ width: "100%" }}>
        {/* Title */}
        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: 0,
            marginBottom: isMobile ? "8px" : "18px",
            fontWeight: 600,
            color: "#1A1A1B",
            lineHeight: "1.4",
            fontWeight: 600,
            display: "-webkit-box",
            "-webkit-line-clamp": isMobile ? 2 : 3,
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={content.title}
        >
          {content.title}
        </Title>

        {/* Author Info */}
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: isMobile ? "12px" : "16px" }}
        >
          <Flex align="center" gap="small">
            <div style={{ position: "relative" }}>
              <Avatar
                size={isMobile ? 32 : 40}
                src={content.author?.image}
                icon={<UserOutlined />}
                style={{
                  border: "2px solid #f0f0f0",
                }}
              />
              {content.author?.is_online && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0px",
                    right: "0px",
                    width: isMobile ? "8px" : "10px",
                    height: isMobile ? "8px" : "10px",
                    backgroundColor: "#52c41a",
                    border: "2px solid white",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                strong
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: "#1A1A1B",
                  display: "block",
                  lineHeight: "1.2",
                  marginBottom: "2px",
                }}
              >
                {content.author?.username}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#8c8c8c",
                  display: "block",
                  lineHeight: "1.2",
                }}
                title={dayjs(content.created_at).format("DD-MM-YYYY HH:mm")}
              >
                {dayjs(content.created_at).fromNow()}
              </Text>
            </div>
          </Flex>

          {/* Category Tags */}
          <Flex gap="small" wrap="wrap">
            {content.category && (
              <Tag
                color="#FF4500"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  fontWeight: 500,
                }}
              >
                {content.category.name}
              </Tag>
            )}
          </Flex>
        </Flex>
      </Space>

      {/* Content preview */}
      {content?.content && (
        <div
          style={{
            marginTop: isMobile ? "12px" : "16px",
            marginBottom: isMobile ? "16px" : "20px",
            padding: isMobile ? "12px" : "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.6",
              color: "#262626",
              display: "-webkit-box",
              "-webkit-line-clamp": 4,
              "-webkit-box-orient": "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            <ReactMarkdownCustom withCustom={false}>
              {content?.content?.substring(0, 300)}
            </ReactMarkdownCustom>
          </div>
          {content?.content?.length > 300 && (
            <Text
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#8c8c8c",
                marginTop: "8px",
                fontStyle: "italic",
              }}
            >
              Baca selengkapnya...
            </Text>
          )}
        </div>
      )}

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
          <Flex gap="small" wrap="wrap">
            {content.tags?.slice(0, 3).map((tag, index) => (
              <Tag
                key={index}
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e8e8e8",
                  color: "#595959",
                  margin: 0,
                }}
              >
                {tag}
              </Tag>
            ))}
            {content.tags?.length > 3 && (
              <Tag
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #d9d9d9",
                  color: "#8c8c8c",
                  margin: 0,
                }}
              >
                +{content.tags.length - 3}
              </Tag>
            )}
          </Flex>
        </div>
      )}

      {/* Bottom Actions */}
      <div
        style={{
          paddingTop: isMobile ? "8px" : "12px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Flex justify="space-between" align="center">
          <Space size={isMobile ? "middle" : "large"}>
            <Flex align="center" gap="small">
              <EyeOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.views_count || 0}
              </Text>
            </Flex>
            <Flex align="center" gap="small">
              <LikeOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.likes_count || 0}
              </Text>
            </Flex>
            <Flex align="center" gap="small">
              <MessageOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.comments_count || 0}
              </Text>
            </Flex>
          </Space>

          <Text
            style={{
              fontSize: isMobile ? "11px" : "12px",
              color: "#52c41a",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {content.status}
          </Text>
        </Flex>
      </div>
    </Card>
  );

  if (isError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Gagal memuat konten knowledge" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "12px" : "16px" }}>
      {/* Header with Search */}
      <Card
        style={{
          marginBottom: isMobile ? "16px" : "24px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #EDEFF1",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
      >
        <Flex
          justify="space-between"
          align={isMobile ? "flex-start" : "center"}
          vertical={isMobile}
          gap="middle"
        >
          <div>
            <Title
              level={isMobile ? 4 : 3}
              style={{
                margin: 0,
                color: "#1A1A1B",
                marginBottom: "4px",
              }}
            >
              📚 Manajemen Pengetahuan
            </Title>
            <Text
              style={{
                color: "#787C7E",
                fontSize: isMobile ? "13px" : "14px",
              }}
            >
              Jelajahi dan temukan pengetahuan dari komunitas
            </Text>
          </div>

          <Search
            placeholder="Cari konten knowledge..."
            allowClear
            enterButton={<SearchOutlined />}
            size={isMobile ? "middle" : "large"}
            style={{
              width: isMobile ? "100%" : "400px",
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(value) => setSearchQuery(value)}
          />
        </Flex>
      </Card>

      {/* Content List */}
      <Row gutter={[0, 0]}>
        <Col span={24}>
          {isLoading && allContents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : allContents.length === 0 ? (
            <Empty
              description={
                searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : "Belum ada konten knowledge"
              }
              style={{ padding: "40px" }}
            />
          ) : (
            <>
              {allContents.map(renderContentCard)}

              {/* Load More / Loading */}
              {hasNextPage && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  {isFetchingNextPage ? (
                    <Spin />
                  ) : (
                    <Button
                      type="default"
                      onClick={() => fetchNextPage()}
                      style={{
                        borderColor: "#FF4500",
                        color: "#FF4500",
                      }}
                    >
                      Muat Lebih Banyak
                    </Button>
                  )}
                </div>
              )}

              {/* Search Loading Indicator */}
              {isLoading && allContents.length > 0 && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 12px rgba(255, 69, 0, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        .ant-input-search .ant-input:focus,
        .ant-input-search .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn:hover {
          border-color: #ff4500 !important;
          color: #ff4500 !important;
        }

        .ant-avatar {
          border: 2px solid #f0f0f0;
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgeUserContents;
