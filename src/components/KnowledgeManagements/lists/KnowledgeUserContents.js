import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getKnowledgeContents } from "@/services/knowledge-management.services";
import { SearchOutlined } from "@ant-design/icons";
import { useDebouncedValue } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Input,
  Row,
  Spin,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ContentCard from "../components/ContentCard";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const KnowledgeUserContents = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  useScrollRestoration();

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
    <ContentCard
      key={content.id}
      content={content}
      isMobile={isMobile}
      onClick={() => {
        router.push(`/asn-connect/asn-knowledge/${content.id}`);
      }}
    />
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
