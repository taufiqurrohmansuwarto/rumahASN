import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  bookmarkKnowledgeContent,
  getKnowledgeContents,
  likeKnowledgeContent,
} from "@/services/knowledge-management.services";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button, Col, Empty, Grid, Row, Spin, message } from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ContentCard from "../components/ContentCard";

const { useBreakpoint } = Grid;

const KnowledgeUserContents = ({
  searchQuery: propSearchQuery,
  selectedCategory: propSelectedCategory,
  selectedTag: propSelectedTag,
  selectedSort: propSelectedSort,
  selectedType: propSelectedType,
}) => {
  useScrollRestoration();

  const router = useRouter();
  const queryClient = useQueryClient();

  // Use props if provided, otherwise fallback to URL parameters
  const { query } = router;
  const searchQuery =
    propSearchQuery !== undefined ? propSearchQuery : query.search || "";
  const selectedCategory =
    propSelectedCategory !== undefined
      ? propSelectedCategory
      : query.category || null;
  const selectedTag =
    propSelectedTag !== undefined ? propSelectedTag : query.tag || null;
  const selectedSort =
    propSelectedSort !== undefined
      ? propSelectedSort
      : query.sort || "created_at";
  const selectedType =
    propSelectedType !== undefined ? propSelectedType : query.type || "all";

  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const [likingItems, setLikingItems] = useState(new Set());
  const [bookmarkingItems, setBookmarkingItems] = useState(new Set());

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
    [
      "fetch-knowledge-user-contents",
      debouncedSearch,
      selectedCategory,
      selectedTag,
      selectedSort,
      selectedType,
    ],
    ({ pageParam = 1 }) =>
      getKnowledgeContents({
        page: pageParam,
        limit: 10,
        search: debouncedSearch,
        category_id: selectedCategory,
        tags: selectedTag,
        sort: selectedSort,
        type: selectedType === "all" ? undefined : selectedType,
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

  // Like mutation
  const { mutate: like } = useMutation(
    (contentId) => likeKnowledgeContent(contentId),
    {
      onMutate: async (contentId) => {
        setLikingItems((prev) => new Set([...prev, contentId]));
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["fetch-knowledge-user-contents"]);
      },
      onError: () => {
        message.error("Gagal menyukai konten");
      },
      onSettled: (data, error, contentId) => {
        setLikingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
      },
    }
  );

  // Bookmark mutation
  const { mutate: bookmark } = useMutation(
    (contentId) => bookmarkKnowledgeContent(contentId),
    {
      onMutate: async (contentId) => {
        setBookmarkingItems((prev) => new Set([...prev, contentId]));
      },
      onSuccess: (response) => {
        message.success(
          response?.is_bookmarked
            ? "Konten disimpan"
            : "Konten dihapus dari simpanan"
        );
        queryClient.invalidateQueries(["fetch-knowledge-user-contents"]);
      },
      onError: () => {
        message.error("Gagal menyimpan konten");
      },
      onSettled: (data, error, contentId) => {
        setBookmarkingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
      },
    }
  );

  // Handle like
  const handleLike = (contentId) => {
    if (!likingItems.has(contentId)) {
      like(contentId);
    }
  };

  // Handle bookmark
  const handleBookmark = (contentId) => {
    if (!bookmarkingItems.has(contentId)) {
      bookmark(contentId);
    }
  };

  const renderContentCard = (content) => (
    <ContentCard
      key={content.id}
      content={content}
      isMobile={isMobile}
      isLiked={content.is_liked}
      isBookmarked={content.is_bookmarked}
      isLiking={likingItems.has(content.id)}
      isBookmarking={bookmarkingItems.has(content.id)}
      onLike={handleLike}
      onBookmark={handleBookmark}
      onClick={() => {
        router.push(`/asn-connect/asn-knowledge/${content.id}`);
      }}
    />
  );

  if (isError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Gagal memuat konten ASNPedia" />
      </div>
    );
  }

  return (
    <div>
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
                  : "Belum ada konten ASNPedia"
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
