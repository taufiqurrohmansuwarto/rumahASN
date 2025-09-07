import {
  MyKnowledgeContents,
  KnowledgeLayout,
} from "@/components/KnowledgeManagements";
import { getUserOwnContents } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, FloatButton, Row, Grid } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import KnowledgeFiltersStack from "@/components/KnowledgeManagements/components/KnowledgeFiltersStack";

const { useBreakpoint } = Grid;

const AsnKnowledgeMyKnowledge = () => {
  const breakPoint = useBreakpoint();
  const router = useRouter();
  const { query } = router;

  const isMobile = breakPoint.xs;

  // Filter states
  const [searchQuery, setSearchQuery] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(query.category || null);
  const [selectedTag, setSelectedTag] = useState(query.tag || null);
  const [selectedSort, setSelectedSort] = useState(query.sort || "created_at:desc");
  const [selectedType, setSelectedType] = useState(query.type || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.status || "all");

  useScrollRestoration("my-knowledge-scroll", true, false, true);

  // Fetch user stats for counts
  const { data: userStats, isLoading: statsLoading } = useQuery(
    ["user-knowledge-stats"],
    () => getUserOwnContents({
      page: 1,
      limit: 1, // Just get stats, not actual content
    }),
    {
      staleTime: 300000, // 5 minutes
    }
  );

  // Extract counts from API response
  const statusCounts = userStats?.statusCounts || {};
  const typeCounts = userStats?.typeCounts || {};
  const categoryCounts = userStats?.categoryCounts || {};

  // Status options for user content
  const statusOptions = [
    { key: "all", label: "Semua Status" },
    { key: "draft", label: "Draft" },
    { key: "pending", label: "Menunggu Review" },
    { key: "published", label: "Dipublikasikan" },
    { key: "rejected", label: "Ditolak" },
    { key: "archived", label: "Diarsipkan" },
    { key: "pending_revision", label: "Perlu Revisi" },
  ];

  // Update URL when filters change
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
    if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);

    const queryString = params.toString();
    const newUrl = queryString ? `${router.pathname}?${queryString}` : router.pathname;
    
    router.push(newUrl, undefined, { shallow: true });
  };

  // Filter handlers
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    updateURL({
      search: value,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
    });
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    updateURL({
      search: searchQuery,
      category: value,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
    });
  };

  const handleTagChange = (value) => {
    setSelectedTag(value);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: value,
      sort: selectedSort,
      type: selectedType,
      status: selectedStatus,
    });
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: value,
      type: selectedType,
      status: selectedStatus,
    });
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: value,
      status: selectedStatus,
    });
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      tag: selectedTag,
      sort: selectedSort,
      type: selectedType,
      status: value,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSort("created_at:desc");
    setSelectedType("all");
    setSelectedStatus("all");
    router.push(router.pathname, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - ASNPedia - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <Row gutter={[16, 16]}>
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
                onClearFilters={handleClearFilters}
                showStatusFilter={true}
                statusOptions={statusOptions}
                statusCounts={statusCounts}
                typeCounts={typeCounts}
                categoryCounts={categoryCounts}
                isLoading={statsLoading}
              />
            </div>
          </Col>
          <Col lg={14} xs={24}>
            <KnowledgeLayout currentPath="/asn-connect/asn-knowledge/my-knowledge">
              <MyKnowledgeContents
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                selectedSort={selectedSort}
                selectedType={selectedType}
                selectedStatus={selectedStatus}
              />
            </KnowledgeLayout>
          </Col>
        </Row>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledge;
