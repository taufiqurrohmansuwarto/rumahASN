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
import KnowledgeHeader from "../components/KnowledgeHeader";
import KnowledgeFilters from "../components/KnowledgeFilters";

const { useBreakpoint } = Grid;

const KnowledgeUserContents = () => {
  useScrollRestoration();

  const router = useRouter();
  const queryClient = useQueryClient();

  // Get URL parameters
  const { query } = router;

  // State management
  const [searchQuery, setSearchQuery] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    query.category || null
  );
  const [selectedTag, setSelectedTag] = useState(query.tag || null);
  const [selectedSort, setSelectedSort] = useState(query.sort || "created_at");
  const [selectedType, setSelectedType] = useState(query.type || "all");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const [likingItems, setLikingItems] = useState(new Set());
  const [bookmarkingItems, setBookmarkingItems] = useState(new Set());

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.tag) params.set("tag", newFilters.tag);
    if (newFilters.sort && newFilters.sort !== "created_at")
      params.set("sort", newFilters.sort);
    if (newFilters.type && newFilters.type !== "all")
      params.set("type", newFilters.type);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : router.pathname;

    router.push(newUrl, undefined, { shallow: true });
  };

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

  // Filter handlers
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateURL({
      search: searchQuery,
      category: categoryId,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
    });
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: tag,
      sort: selectedSort,
      type: selectedType,
    });
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: sort,
      type: selectedType,
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    updateURL({
      search: value,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
    });
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: type,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSort("created_at");
    setSelectedType("all");
    setSearchQuery("");
    router.push(router.pathname, undefined, { shallow: true });
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
      {/* Header with Search */}
      <KnowledgeHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
      />

      {/* Filters */}
      <KnowledgeFilters
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        selectedSort={selectedSort}
        onCategoryChange={handleCategoryChange}
        onTagChange={handleTagChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        showTypeFilter={true}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        typeCounts={{}} // Empty object for public content
      />

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
