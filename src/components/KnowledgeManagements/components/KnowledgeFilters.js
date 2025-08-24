import { getKnowledgeCategories } from "@/services/knowledge-management.services";
import { FilterOutlined, SortAscendingOutlined, ClearOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeFilters = ({
  selectedCategory,
  selectedTag,
  selectedSort,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearFilters,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const hasActiveFilters = selectedCategory || selectedTag || selectedSort !== "created_at";

  return (
    <Card
      style={{
        marginBottom: "16px",
        borderRadius: "8px",
        border: "1px solid #EDEFF1",
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Filter Header */}
        <Col span={24}>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              <Text strong style={{ color: "#1A1A1B", fontSize: "16px" }}>
                Filter & Urutkan
              </Text>
              {hasActiveFilters && (
                <Tag
                  style={{
                    backgroundColor: "#FFF2E6",
                    color: "#FF4500",
                    border: "1px solid #FFD4A3",
                    fontSize: "11px",
                  }}
                >
                  Aktif
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
                  height: "24px",
                  padding: "0 8px",
                }}
              >
                Reset Filter
              </Button>
            )}
          </Flex>
        </Col>

        {/* Filters */}
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: "8px" }}>
            <Text strong style={{ fontSize: "13px", color: "#374151" }}>
              Kategori
            </Text>
          </div>
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

        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: "8px" }}>
            <Flex align="center" gap={6}>
              <SortAscendingOutlined style={{ fontSize: "12px", color: "#6B7280" }} />
              <Text strong style={{ fontSize: "13px", color: "#374151" }}>
                Urutkan
              </Text>
            </Flex>
          </div>
          <Select
            style={{ width: "100%" }}
            value={selectedSort}
            onChange={onSortChange}
            options={sortOptions}
          />
        </Col>

        <Col xs={24} md={8}>
          <div style={{ marginBottom: "8px" }}>
            <Text strong style={{ fontSize: "13px", color: "#374151" }}>
              Tag
            </Text>
          </div>
          <Select
            placeholder="Pilih tag..."
            allowClear
            style={{ width: "100%" }}
            value={selectedTag || undefined}
            onChange={onTagChange}
            options={popularTags.map((tag) => ({
              label: tag,
              value: tag,
            }))}
          />
        </Col>

        {/* Popular Tags */}
        {!isMobile && (
          <Col span={24}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ fontSize: "13px", color: "#374151" }}>
                Tag Populer
              </Text>
            </div>
            <Flex gap="4px" wrap="wrap">
              {popularTags.slice(0, 8).map((tag) => (
                <Tag
                  key={tag}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    backgroundColor: selectedTag === tag ? "#FF4500" : "#F5F5F5",
                    color: selectedTag === tag ? "white" : "#595959",
                    border: selectedTag === tag ? "1px solid #FF4500" : "1px solid #E8E8E8",
                    cursor: "pointer",
                    borderRadius: "12px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => onTagChange(selectedTag === tag ? null : tag)}
                  onMouseEnter={(e) => {
                    if (selectedTag !== tag) {
                      e.currentTarget.style.borderColor = "#FF4500";
                      e.currentTarget.style.color = "#FF4500";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTag !== tag) {
                      e.currentTarget.style.borderColor = "#E8E8E8";
                      e.currentTarget.style.color = "#595959";
                    }
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
          </Col>
        )}

        {/* Reset Button - Prominent */}
        {hasActiveFilters && (
          <Col span={24}>
            <Flex justify="center" style={{ paddingTop: "8px", borderTop: "1px solid #F0F0F0" }}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={onClearFilters}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF4500";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#FF4500";
                }}
              >
                Reset Semua Filter
              </Button>
            </Flex>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default KnowledgeFilters;