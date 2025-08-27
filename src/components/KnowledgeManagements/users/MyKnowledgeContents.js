import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  bookmarkKnowledgeContent,
  getUserOwnContents,
  likeKnowledgeContent,
} from "@/services/knowledge-management.services";
import { useDebouncedValue } from "@mantine/hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Button,
  Col,
  Empty,
  Grid,
  Row,
  Spin,
  message,
  Card,
  Flex,
  Typography,
  Tag,
  Affix,
} from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue as useDebounce } from "@mantine/hooks";
import ContentCard from "../components/ContentCard";
import KnowledgeFilters from "../components/KnowledgeFilters";
import {
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const MyKnowledgeContents = () => {
  useScrollRestoration();

  const router = useRouter();
  const queryClient = useQueryClient();

  // Get URL parameters using useRouter
  const { query: routerQuery, push, pathname } = router;

  // State management with URL sync
  const [searchQuery, setSearchQuery] = useState(routerQuery.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    routerQuery.category || null
  );
  const [selectedTag, setSelectedTag] = useState(
    routerQuery.tag
      ? Array.isArray(routerQuery.tag)
        ? routerQuery.tag
        : [routerQuery.tag]
      : null
  );
  const [selectedSort, setSelectedSort] = useState(
    routerQuery.sort || "created_at"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    routerQuery.status || "all"
  );

  // Debounced search for API calls
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [likingItems, setLikingItems] = useState(new Set());
  const [bookmarkingItems, setBookmarkingItems] = useState(new Set());

  // Sync state with URL parameters when router query changes
  useEffect(() => {
    setSearchQuery(routerQuery.search || "");
    setSelectedCategory(routerQuery.category || null);
    setSelectedTag(
      routerQuery.tag
        ? Array.isArray(routerQuery.tag)
          ? routerQuery.tag
          : [routerQuery.tag]
        : null
    );
    setSelectedSort(routerQuery.sort || "created_at");
    setSelectedStatus(routerQuery.status || "all");
  }, [routerQuery]);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Status options for user content
  const statusOptions = [
    { key: "all", label: "Semua Status", color: "default" },
    { key: "draft", label: "Draft", color: "default" },
    { key: "pending", label: "Menunggu Review", color: "processing" },
    { key: "published", label: "Dipublikasikan", color: "success" },
    { key: "rejected", label: "Ditolak", color: "error" },
    { key: "archived", label: "Diarsipkan", color: "warning" },
  ];

  // Sync URL with current filter state
  const updateURL = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();

      // Only add non-default values to URL
      if (newFilters.search?.trim())
        params.set("search", newFilters.search.trim());
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.tag && newFilters.tag.length > 0) {
        if (Array.isArray(newFilters.tag)) {
          newFilters.tag.forEach((tag) => params.append("tag", tag));
        } else {
          params.set("tag", newFilters.tag);
        }
      }
      if (newFilters.sort && newFilters.sort !== "created_at")
        params.set("sort", newFilters.sort);
      if (newFilters.status && newFilters.status !== "all")
        params.set("status", newFilters.status);

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : pathname;

      // Update URL without triggering full page reload
      push(newUrl, undefined, { shallow: true });
    },
    [push, pathname]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(
    [
      "fetch-my-knowledge-contents",
      debouncedSearch,
      selectedCategory,
      selectedTag,
      selectedSort,
      selectedStatus,
    ],
    ({ pageParam = 1 }) =>
      getUserOwnContents({
        page: pageParam,
        limit: 10,
        search: debouncedSearch,
        category_id: selectedCategory,
        tags:
          selectedTag && selectedTag.length > 0
            ? selectedTag.join(",")
            : undefined,
        sort: selectedSort,
        status: selectedStatus === "all" ? undefined : selectedStatus,
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

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      all: 0,
      draft: 0,
      pending: 0,
      published: 0,
      rejected: 0,
      archived: 0,
    };

    if (data?.pages?.[0]) {
      counts.all = data.pages[0].total || 0;
      // If we have status breakdown from API, use it
      if (data.pages[0].statusCounts) {
        Object.assign(counts, data.pages[0].statusCounts);
      }
    }

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Like mutation
  const { mutate: like } = useMutation(
    (contentId) => likeKnowledgeContent(contentId),
    {
      onMutate: async (contentId) => {
        setLikingItems((prev) => new Set([...prev, contentId]));
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["fetch-my-knowledge-contents"]);
      },
      onError: () => {
        message.error("Gagal menyukai konten");
      },
      onSettled: (_, __, contentId) => {
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
        queryClient.invalidateQueries(["fetch-my-knowledge-contents"]);
      },
      onError: () => {
        message.error("Gagal menyimpan konten");
      },
      onSettled: (_, __, contentId) => {
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
      status: selectedStatus,
    });
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: tag,
      sort: selectedSort,
      status: selectedStatus,
    });
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: sort,
      status: selectedStatus,
    });
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      status: status,
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
      status: selectedStatus,
    });
  };

  const handleClearFilters = useCallback(() => {
    // Reset all filters to default values
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSort("created_at");
    setSelectedStatus("all");

    // Clear URL parameters
    push(pathname, undefined, { shallow: true });
  }, [push, pathname]);

  const getCurrentStatusInfo = () => {
    return (
      statusOptions.find((opt) => opt.key === selectedStatus) ||
      statusOptions[0]
    );
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
        router.push(`/asn-connect/asn-knowledge/my-knowledge/${content.id}`);
      }}
      showStatus={true}
      isOwner={true}
    />
  );

  if (isError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Gagal memuat konten Anda" />
      </div>
    );
  }

  return (
    <>
      {/* Affix Header */}
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
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="small">
              <UserOutlined
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
                Konten ASNPedia Saya
              </Text>
            </Flex>
            <Tag color={getCurrentStatusInfo().color}>
              {getCurrentStatusInfo().label}:{" "}
              {statusCounts[selectedStatus] || 0}
            </Tag>
          </Flex>
        </div>
      </Affix>

      <div
        style={{
          marginTop: isMobile ? "8px" : "12px",
        }}
      >
        {/* Header */}
        <Card
          style={{
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #EDEFF1",
            marginBottom: "16px",
          }}
          styles={{ body: { padding: isMobile ? "16px" : "20px" } }}
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
                📝 Konten ASNPedia Saya
              </Title>
              <Text
                style={{
                  color: "#787C7E",
                  fontSize: isMobile ? "13px" : "14px",
                }}
              >
                Kelola dan lihat semua konten ASNPedia yang Anda buat
              </Text>
            </div>

            <Button
              type="primary"
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
              }}
              onClick={() => router.push("/asn-connect/asn-knowledge/create")}
              icon={<EditOutlined />}
            >
              {isMobile ? "Buat Baru" : "Buat Konten Baru"}
            </Button>
          </Flex>
        </Card>

        {/* Filters with Search and Status */}
        <KnowledgeFilters
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          selectedSort={selectedSort}
          onCategoryChange={handleCategoryChange}
          onTagChange={handleTagChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          showStatusFilter={true}
          selectedStatus={selectedStatus}
          statusOptions={statusOptions}
          onStatusChange={handleStatusChange}
          statusCounts={statusCounts}
          showSearch={true}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />

        {/* Content List */}
        <Row gutter={[0, 0]} style={{ marginTop: "16px" }}>
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
                    : selectedStatus === "all"
                    ? "Anda belum membuat konten ASNPedia"
                    : `Belum ada konten dengan status ${getCurrentStatusInfo().label.toLowerCase()}`
                }
                style={{ padding: "40px" }}
                image={
                  <FileTextOutlined
                    style={{ fontSize: "48px", color: "#d9d9d9" }}
                  />
                }
              >
                {selectedStatus === "all" && !searchQuery && (
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#FF4500",
                      borderColor: "#FF4500",
                      marginTop: "16px",
                    }}
                    onClick={() => router.push("/knowledge-managements/create")}
                    icon={<EditOutlined />}
                  >
                    Buat Konten Pertama
                  </Button>
                )}
              </Empty>
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
      </div>

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

export default MyKnowledgeContents;
