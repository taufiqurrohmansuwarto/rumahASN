import { KnowledgeLayout } from "@/components/KnowledgeManagements";
import KnowledgeUserContents from "@/components/KnowledgeManagements/lists/KnowledgeUserContents";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import { Col, Row, Grid, FloatButton } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getKnowledgeContents } from "@/services/knowledge-management.services";
import TopContributors from "@/components/KnowledgeManagements/TopContributors";
import TopContents from "@/components/KnowledgeManagements/TopContents";
import TopCategories from "@/components/KnowledgeManagements/TopCategories";
import TopTags from "@/components/KnowledgeManagements/TopTags";
import KnowledgeFiltersStack from "@/components/KnowledgeManagements/components/KnowledgeFiltersStack";

const { useBreakpoint } = Grid;

const AsnKnowledge = () => {
  const breakPoint = useBreakpoint();
  const router = useRouter();
  const { query } = router;

  const isMobile = breakPoint.xs;

  // Filter states
  const [searchQuery, setSearchQuery] = useState(query.search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    query.category || null
  );
  const [selectedTag, setSelectedTag] = useState(query.tag || null);
  const [selectedSort, setSelectedSort] = useState(
    query.sort || "created_at:desc"
  );
  const [selectedType, setSelectedType] = useState(query.type || "all");

  useScrollRestoration("knowledge-scroll", true, false, true); // Enable smooth restoration

  // Fetch public knowledge stats for counts
  const { data: publicStats, isLoading: statsLoading } = useQuery(
    ["public-knowledge-stats"],
    () => getKnowledgeContents({
      page: 1,
      limit: 1, // Just get stats, not actual content
    }),
    {
      staleTime: 300000, // 5 minutes
    }
  );

  // Extract counts from API response
  const typeCounts = publicStats?.typeCounts || {};
  const categoryCounts = publicStats?.categoryCounts || {};

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
    if (newFilters.sort && newFilters.sort !== "created_at:desc")
      params.set("sort", newFilters.sort);
    if (newFilters.type && newFilters.type !== "all")
      params.set("type", newFilters.type);

    const queryString = params.toString();
    const newUrl = queryString
      ? `${router.pathname}?${queryString}`
      : router.pathname;

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
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedSort("created_at:desc");
    setSelectedType("all");
    router.push(router.pathname, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Manajemen Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <Row gutter={[16, 16]}>
          <Col lg={5} xs={0}>
            <div
              style={{
                position: "sticky",
                top: "80px",
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
              }}
            >
              <KnowledgeFiltersStack
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                selectedSort={selectedSort}
                selectedType={selectedType}
                searchQuery={searchQuery}
                onCategoryChange={handleCategoryChange}
                onTagChange={handleTagChange}
                onSortChange={handleSortChange}
                onTypeChange={handleTypeChange}
                onSearchChange={handleSearchChange}
                onClearFilters={handleClearFilters}
                typeCounts={typeCounts}
                categoryCounts={categoryCounts}
                isLoading={statsLoading}
              />
            </div>
          </Col>
          <Col lg={14} xs={24}>
            <KnowledgeLayout
              currentPath="/asn-connect/asn-knowledge"
              showCreateButton={true}
            >
              <KnowledgeUserContents
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                selectedSort={selectedSort}
                selectedType={selectedType}
              />
            </KnowledgeLayout>
          </Col>
          {!isMobile && (
            <Col lg={5} xs={24}>
              <Row gutter={[4, 4]}>
                <Col lg={24} xs={24}>
                  <TopContributors period="month" limit={10} />
                </Col>
                <Col lg={24} xs={24}>
                  <TopContents period="week" sortBy="engagement" />
                </Col>
                <Col lg={24} xs={24}>
                  <TopCategories period="month" />
                </Col>
                <Col lg={24} xs={24}>
                  <TopTags period="month" limit={10} />
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledge;
