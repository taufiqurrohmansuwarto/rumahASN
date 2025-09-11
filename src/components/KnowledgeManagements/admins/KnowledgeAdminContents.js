import { useAdminContents } from "@/hooks/knowledge-management/useAdminContents";
import { usePendingRevisions } from "@/hooks/knowledge-management/useRevisions";
import { SettingOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Grid,
  Row,
  Spin,
  Typography,
  Tag,
  Affix,
  FloatButton,
} from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ContentCard from "../components/ContentCard";
import KnowledgeFiltersStack from "../components/KnowledgeFiltersStack";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/**
 * Admin Knowledge Contents Management Component
 * Features comprehensive filtering like user system:
 * - Search, Category, Tag, Type, Sort, Status filters  
 * - Left sidebar filter stack
 * - Content list with pagination
 * - Complete statistics and counts
 */
const KnowledgeAdminContents = () => {
  const router = useRouter();
  const { query } = router;
  
  // Responsive breakpoints
  const breakPoint = useBreakpoint();
  const isMobile = breakPoint.xs;

  // Filter states - comprehensive like user system
  const [searchQuery, setSearchQuery] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(query.category || null);
  const [selectedTag, setSelectedTag] = useState(query.tag || null);
  const [selectedSort, setSelectedSort] = useState(query.sort || "created_at:desc");
  const [selectedType, setSelectedType] = useState(query.type || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.status || "pending");
  const [selectedRevisionView, setSelectedRevisionView] = useState(query.revision === "true" || false);

  // Scroll restoration for better UX
  useScrollRestoration("admin-knowledge-scroll", true, false, true);

  // Sync state with URL changes
  useEffect(() => {
    setSearchQuery(query.search || "");
    setSelectedCategory(query.category || null);
    setSelectedTag(query.tag || null);
    setSelectedSort(query.sort || "created_at:desc");
    setSelectedType(query.type || "all");
    setSelectedStatus(query.status || "pending");
    setSelectedRevisionView(query.revision === "true" || false);
  }, [query]);


  // Use different hooks based on revision view
  const adminContentsHook = useAdminContents({
    searchQuery,
    selectedCategory,
    selectedTag,
    selectedSort,
    selectedType,
    selectedStatus,
  });

  // State for revision pagination
  const [revisionCurrentPage, setRevisionCurrentPage] = useState(1);
  
  const pendingRevisionsHook = usePendingRevisions("pending_revision", {
    searchQuery,
    selectedCategory,
    selectedTag,
    selectedSort,
    selectedType,
    selectedStatus,
    currentPage: revisionCurrentPage,
  });

  // Define different status options based on view mode
  const getStatusOptions = () => {
    if (selectedRevisionView) {
      // Revision-specific statuses
      return [
        { key: "all", label: "Semua Status" },
        { key: "published", label: "Dipublikasikan" },
        { key: "pending_revision", label: "Menunggu Review Revisi" },
        { key: "approve_revision", label: "Revisi Disetujui" },
        { key: "reject_revision", label: "Revisi Ditolak" },
      ];
    } else {
      // Regular content statuses
      return [
        { key: "all", label: "Semua Status" },
        { key: "draft", label: "Draft" },
        { key: "pending", label: "Menunggu Review" },
        { key: "published", label: "Dipublikasikan" }, 
        { key: "rejected", label: "Ditolak" },
        { key: "archived", label: "Diarsipkan" },
        { key: "pending_revision", label: "Menunggu Review Revisi" },
        { key: "revision_rejected", label: "Revisi Ditolak" },
      ];
    }
  };

  const statusOptions = getStatusOptions();

  // Select appropriate data based on revision view toggle
  const {
    allContents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    statusCounts,
    typeCounts,
    categoryCounts,
  } = selectedRevisionView ? {
    allContents: pendingRevisionsHook.data || [],
    fetchNextPage: () => setRevisionCurrentPage(prev => prev + 1),
    hasNextPage: revisionCurrentPage < Math.ceil((pendingRevisionsHook.total || 0) / 10),
    isFetchingNextPage: pendingRevisionsHook.isLoading,
    isLoading: pendingRevisionsHook.isLoading,
    isError: pendingRevisionsHook.isError,
    statusCounts: pendingRevisionsHook.statusCounts || {},
    typeCounts: pendingRevisionsHook.typeCounts || {},
    categoryCounts: pendingRevisionsHook.categoryCounts || {},
  } : adminContentsHook;

  // URL update function - keeps all filter states in sync
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.tag && newFilters.tag.length > 0) {
      if (Array.isArray(newFilters.tag)) {
        params.set("tag", newFilters.tag.join(","));
      } else {
        params.set("tag", newFilters.tag);
      }
    }
    if (newFilters.sort && newFilters.sort !== "created_at:desc") params.set("sort", newFilters.sort);
    if (newFilters.type && newFilters.type !== "all") params.set("type", newFilters.type);
    if (newFilters.status && newFilters.status !== "pending") params.set("status", newFilters.status);
    if (newFilters.revision === true) params.set("revision", "true");

    const queryString = params.toString();
    const newUrl = queryString ? `${router.pathname}?${queryString}` : router.pathname;
    
    router.push(newUrl, undefined, { shallow: true });
  };

  // Filter change handlers - each maintains all other filter states
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: value,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
      revision: selectedRevisionView,
    });
  };

  // Direct search handler for immediate search
  const handleSearch = (value) => {
    handleSearchChange(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: value,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
      revision: selectedRevisionView,
    });
  };

  const handleTagChange = (value) => {
    setSelectedTag(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: value,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
      revision: selectedRevisionView,
    });
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: value,
      type: selectedType,
      status: selectedStatus,
      revision: selectedRevisionView,
    });
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: value,
      status: selectedStatus,
      revision: selectedRevisionView,
    });
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: value,
      revision: selectedRevisionView,
    });
  };

  const handleRevisionViewChange = (value) => {
    setSelectedRevisionView(value);
    setRevisionCurrentPage(1); // Reset revision pagination on filter change
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
      revision: value,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSort("created_at:desc");
    setSelectedType("all");
    setSelectedStatus("pending");
    setSelectedRevisionView(false);
    setRevisionCurrentPage(1); // Reset revision pagination on filter clear
    router.push(router.pathname, undefined, { shallow: true });
  };

  // Content card renderer
  const renderContentCard = (content) => (
    <ContentCard
      key={content.id}
      content={content}
      isMobile={isMobile}
      onClick={() => {
        router.push(`/knowledge-managements/contents/${content.id}`);
      }}
      showStatus={true}
      isAdmin={true}
    />
  );

  // Get current status info for display
  const getCurrentStatusInfo = () => {
    return statusOptions.find((opt) => opt.key === selectedStatus) || statusOptions[0];
  };

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
              <SettingOutlined
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
                Admin - Manajemen Konten
              </Text>
            </Flex>
            <Tag color={getCurrentStatusInfo().color}>
              {getCurrentStatusInfo().label}: {statusCounts[selectedStatus] || 0}
            </Tag>
          </Flex>
        </div>
      </Affix>

      <Row gutter={[0, 24]} style={{ marginTop: isMobile ? "8px" : "12px" }}>
        <Col span={24}>
          {/* Header with Search and Filters */}
          <Card
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
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
                  📋 Manajemen Konten ASNPedia
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                >
                  Kelola dan moderasi konten ASNPedia dari pengguna
                </Text>
              </div>

            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Main Layout with Filter Stack - like user system */}
      <FloatButton.BackTop />
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {/* Left Sidebar - Filter Stack */}
        <Col lg={5} xs={0}>
          <div style={{ position: "sticky", top: "80px", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
            <KnowledgeFiltersStack
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              selectedSort={selectedSort}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onCategoryChange={handleCategoryChange}
              onTagChange={handleTagChange}
              onSortChange={handleSortChange}
              onTypeChange={handleTypeChange}
              onStatusChange={handleStatusChange}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              showStatusFilter={true}
              statusOptions={statusOptions}
              statusCounts={statusCounts}
              typeCounts={typeCounts}
              categoryCounts={categoryCounts}
              isLoading={isLoading}
              // Admin-specific props
              isAdmin={true}
              showAdminFilters={true}
              // Revision filter props - similar to bookmark filter
              showRevisionFilter={true}
              selectedRevisionView={selectedRevisionView}
              onRevisionViewChange={handleRevisionViewChange}
            />
          </div>
        </Col>

        {/* Right Content Area */}
        <Col lg={19} xs={24}>
          <Card>
            <div style={{ position: "relative", minHeight: "400px" }}>
              {/* Loading overlay untuk initial load */}
              {isLoading && allContents.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <Spin size="large" />
                </div>
              )}

              {/* Search Loading Indicator - hanya untuk search */}
              {isLoading && allContents.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <Spin />
                </div>
              )}

              {/* Content atau Empty State */}
              {allContents.length === 0 && !isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px",
                  }}
                >
                  <Empty
                    description={
                      isError
                        ? "Gagal memuat konten ASNPedia"
                        : searchQuery
                        ? `Tidak ada hasil untuk "${searchQuery}" dengan status ${getCurrentStatusInfo().label.toLowerCase()}`
                        : `Belum ada konten dengan status ${getCurrentStatusInfo().label.toLowerCase()}`
                    }
                  />
                </div>
              ) : (
                allContents.map(renderContentCard)
              )}

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
            </div>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-input-search .ant-input:focus,
        .ant-input-search .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn:hover {
          border-color: #ff4500 !important;
          color: #ff4500 !important;
        }

        .ant-tabs-tab {
          color: #666 !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff4500 !important;
        }

        .ant-tabs-ink-bar {
          background: #ff4500 !important;
        }

        .ant-avatar {
          border: 2px solid #f0f0f0;
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

export default KnowledgeAdminContents;
