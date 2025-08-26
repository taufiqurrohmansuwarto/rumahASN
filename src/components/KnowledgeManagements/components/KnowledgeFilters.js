import { getKnowledgeCategories } from "@/services/knowledge-management.services";
import { FilterOutlined, SortAscendingOutlined, ClearOutlined, SearchOutlined, DownOutlined, UpOutlined, TagsOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Grid,
  Input,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;
const { Panel } = Collapse;

const KnowledgeFilters = ({
  selectedCategory,
  selectedTag,
  selectedSort,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearFilters,
  // Status filter props (optional)
  showStatusFilter = false,
  selectedStatus,
  statusOptions = [],
  onStatusChange,
  statusCounts = {},
  // Search props (optional)
  showSearch = false,
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery(
    ["knowledge-categories"],
    getKnowledgeCategories,
    {
      staleTime: 300000, // 5 minutes
    }
  );

  // Sort options
  const sortOptions = [
    { label: "Terbaru", value: "created_at" },
    { label: "Terlama", value: "created_at_asc" },
    { label: "Paling Disukai", value: "likes_count" },
    { label: "Paling Banyak Komentar", value: "comments_count" },
    { label: "Judul A-Z", value: "title_asc" },
    { label: "Judul Z-A", value: "title_desc" },
  ];

  // Popular tags (static for now, could be fetched from API)
  const popularTags = [
    "Tutorial", "Tips", "JavaScript", "Python", "React",
    "Best Practice", "ASN", "Produktivitas", "Teknologi", "Panduan"
  ];

  const hasActiveFilters = selectedCategory || (selectedTag && selectedTag.length > 0) || selectedSort !== "created_at" || (showStatusFilter && selectedStatus && selectedStatus !== "all") || (showSearch && searchQuery);

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Basic Search */}
      {showSearch && (
        <Card
          style={{
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #EDEFF1",
          }}
          styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
        >
          <Flex vertical gap="small">
            <Text strong style={{ fontSize: "14px", color: "#1A1A1B" }}>
              🔍 Cari Berdasarkan Judul
            </Text>
            <Search
              placeholder="Masukkan kata kunci untuk mencari konten..."
              allowClear
              enterButton="Cari"
              size="large"
              style={{ width: "100%" }}
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearch}
            />
          </Flex>
        </Card>
      )}

      {/* Advanced Filters */}
      <Card
        style={{
          borderRadius: "8px",
          border: "1px solid #EDEFF1",
        }}
        styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
      >
        {/* Advanced Filter Header */}
        <Flex justify="space-between" align="center" style={{ marginBottom: showAdvancedFilters ? "16px" : "0" }}>
          <Flex align="center" gap={8}>
            <Button
              type="text"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{
                padding: "4px 8px",
                height: "auto",
                color: "#FF4500",
                fontWeight: 500,
              }}
              icon={showAdvancedFilters ? <UpOutlined /> : <DownOutlined />}
            >
              <FilterOutlined style={{ marginRight: "4px" }} />
              Filter Lanjutan
            </Button>
            {hasActiveFilters && (
              <Tag
                style={{
                  backgroundColor: "#FFF2E6",
                  color: "#FF4500",
                  border: "1px solid #FFD4A3",
                  fontSize: "11px",
                }}
              >
                {Object.values({
                  category: selectedCategory,
                  tag: selectedTag && selectedTag.length > 0,
                  sort: selectedSort !== "created_at",
                  status: showStatusFilter && selectedStatus && selectedStatus !== "all",
                  search: showSearch && searchQuery,
                }).filter(Boolean).length} Aktif
              </Tag>
            )}
          </Flex>
          
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={onClearFilters}
              style={{
                color: "#FF4500",
                fontSize: "12px",
                height: "28px",
                padding: "0 8px",
              }}
            >
              Reset
            </Button>
          )}
        </Flex>

        {/* Advanced Filters Content */}
        {showAdvancedFilters && (
          <div>
            {/* Status Filter */}
            {showStatusFilter && (
              <div style={{ marginBottom: "20px" }}>
                <Text strong style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                  Status Konten
                </Text>
                <Flex gap="6px" wrap="wrap">
                  {statusOptions.map((status) => (
                    <Tag
                      key={status.key}
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        backgroundColor: selectedStatus === status.key ? "#FF4500" : "#F5F5F5",
                        color: selectedStatus === status.key ? "white" : "#595959",
                        border: selectedStatus === status.key ? "1px solid #FF4500" : "1px solid #E8E8E8",
                        cursor: "pointer",
                        borderRadius: "16px",
                        transition: "all 0.2s ease",
                        height: "32px",
                        lineHeight: "20px",
                      }}
                      onClick={() => onStatusChange(status.key)}
                    >
                      {status.label} ({statusCounts[status.key] || 0})
                    </Tag>
                  ))}
                </Flex>
              </div>
            )}

            <Row gutter={[16, 16]}>
              {/* Category Filter */}
              <Col xs={24} sm={12} md={8}>
                <Text strong style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                  Kategori
                </Text>
                <Select
                  placeholder="Pilih kategori..."
                  allowClear
                  style={{ width: "100%" }}
                  value={selectedCategory || undefined}
                  onChange={onCategoryChange}
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </Col>

              {/* Sort Filter */}
              <Col xs={24} sm={12} md={8}>
                <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
                  <SortAscendingOutlined style={{ fontSize: "12px", color: "#6B7280" }} />
                  <Text strong style={{ fontSize: "13px", color: "#374151" }}>
                    Urutkan
                  </Text>
                </Flex>
                <Select
                  style={{ width: "100%" }}
                  value={selectedSort}
                  onChange={onSortChange}
                  options={sortOptions}
                />
              </Col>

              {/* Tag Filter */}
              <Col xs={24} sm={12} md={8}>
                <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
                  <TagsOutlined style={{ fontSize: "12px", color: "#6B7280" }} />
                  <Text strong style={{ fontSize: "13px", color: "#374151" }}>
                    Tag
                  </Text>
                </Flex>
                <Select
                  mode="multiple"
                  placeholder="Pilih tag..."
                  allowClear
                  style={{ width: "100%" }}
                  value={selectedTag || []}
                  onChange={onTagChange}
                  options={popularTags.map((tag) => ({
                    label: tag,
                    value: tag,
                  }))}
                  maxTagCount="responsive"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Col>
            </Row>

            {/* Popular Tags */}
            {!isMobile && (
              <div style={{ marginTop: "20px" }}>
                <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
                  <TagsOutlined style={{ fontSize: "12px", color: "#6B7280" }} />
                  <Text strong style={{ fontSize: "13px", color: "#374151" }}>
                    Tag Populer
                  </Text>
                </Flex>
                <Flex gap="6px" wrap="wrap">
                  {popularTags.slice(0, 10).map((tag) => {
                    const isSelected = selectedTag && selectedTag.includes(tag);
                    return (
                      <Tag
                        key={tag}
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          backgroundColor: isSelected ? "#FF4500" : "#F5F5F5",
                          color: isSelected ? "white" : "#595959",
                          border: isSelected ? "1px solid #FF4500" : "1px solid #E8E8E8",
                          cursor: "pointer",
                          borderRadius: "12px",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => {
                          const currentTags = selectedTag || [];
                          let newTags;
                          if (isSelected) {
                            // Remove tag if already selected
                            newTags = currentTags.filter(t => t !== tag);
                          } else {
                            // Add tag if not selected
                            newTags = [...currentTags, tag];
                          }
                          onTagChange(newTags.length > 0 ? newTags : null);
                        }}
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </Flex>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeFilters;