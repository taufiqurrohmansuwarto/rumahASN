import { getKnowledgeCategories } from "@/services/knowledge-management.services";
import {
  FileImageOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Button,
  Flex,
  Select,
  Typography,
  Badge,
  Divider,
  Input,
  Tag,
  Skeleton,
  Spin,
} from "antd";

const { Text } = Typography;
const { Search } = Input;

const KnowledgeFiltersStack = ({
  selectedCategory,
  selectedTag,
  selectedType,
  selectedSort,
  searchQuery,
  onCategoryChange,
  onTagChange,
  onTypeChange,
  onSortChange,
  onSearchChange,
  onClearFilters,
  // Category counts
  categoryCounts = {},
  // Type counts  
  typeCounts = {},
  // Instance filter props (like organization/department)
  showInstanceFilter = false,
  selectedInstance,
  onInstanceChange,
  instanceOptions = [],
  // Status filter props (for user content)
  showStatusFilter = false,
  selectedStatus,
  onStatusChange,
  statusOptions = [],
  statusCounts = {},
  isLoading = false,
}) => {
  // Collapse states
  const [showCategories, setShowCategories] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showInstance, setShowInstance] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

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
    { label: "Terbaru", value: "created_at:desc" },
    { label: "Terlama", value: "created_at:asc" },
    { label: "Paling Disukai", value: "likes_count:desc" },
    { label: "Paling Banyak Komentar", value: "comments_count:desc" },
    { label: "Judul A-Z", value: "title:asc" },
    { label: "Judul Z-A", value: "title:desc" },
  ];

  // Type options with icons and colors
  const typeOptions = [
    {
      label: "Semua Jenis",
      value: "all",
      icon: null,
      color: "#666",
    },
    {
      label: "Teks",
      value: "teks",
      icon: <FileTextOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      label: "Gambar", 
      value: "gambar",
      icon: <FileImageOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      label: "Audio",
      value: "audio", 
      icon: <SoundOutlined style={{ color: "#fa8c16" }} />,
      color: "#fa8c16",
    },
    {
      label: "Video",
      value: "video",
      icon: <PlayCircleOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
  ];

  // Popular tags (static for now, could be fetched from API)
  const popularTags = [
    "Tutorial",
    "Tips",
    "JavaScript",
    "Python",
    "React",
    "Best Practice",
    "ASN",
    "Produktivitas",
    "Teknologi",
    "Panduan",
  ];

  // Check if there are active filters
  const hasActiveFilters = 
    selectedCategory || 
    (selectedTag && selectedTag.length > 0) ||
    selectedType !== "all" || 
    selectedSort !== "created_at:desc" ||
    searchQuery ||
    (showInstanceFilter && selectedInstance) ||
    (showStatusFilter && selectedStatus && selectedStatus !== "all");

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div
      className="knowledge-filters-stack-no-hover"
      style={{
        borderRadius: "6px",
        border: "1px solid #EDEFF1",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        backgroundColor: "white",
        padding: "12px",
        minHeight: "600px",
      }}
    >
      <style jsx global>{`
        .knowledge-filters-stack-no-hover * {
          transition: none !important;
        }
        .knowledge-filters-stack-no-hover .ant-btn,
        .knowledge-filters-stack-no-hover .ant-btn:hover,
        .knowledge-filters-stack-no-hover .ant-btn:focus,
        .knowledge-filters-stack-no-hover .ant-btn:active {
          background-color: transparent !important;
          border-color: transparent !important;
          color: inherit !important;
          box-shadow: none !important;
        }
        .knowledge-filters-stack-no-hover .ant-btn.ant-btn-text,
        .knowledge-filters-stack-no-hover .ant-btn.ant-btn-text:hover,
        .knowledge-filters-stack-no-hover .ant-btn.ant-btn-text:focus,
        .knowledge-filters-stack-no-hover .ant-btn.ant-btn-text:active {
          background-color: transparent !important;
          color: inherit !important;
          box-shadow: none !important;
        }
        .knowledge-filters-stack-no-hover .ant-select:hover .ant-select-selector,
        .knowledge-filters-stack-no-hover .ant-select:focus .ant-select-selector {
          border-color: #d9d9d9 !important;
          box-shadow: none !important;
        }
        .knowledge-filters-stack-no-hover .ant-input:hover,
        .knowledge-filters-stack-no-hover .ant-input:focus {
          border-color: #d9d9d9 !important;
          box-shadow: none !important;
        }
        .knowledge-filters-stack-no-hover .ant-tag:hover:not(.selected-tag) {
          background-color: inherit !important;
        }
        .knowledge-filters-stack-no-hover .selected-filter {
          background-color: #FFF7ED !important;
          border-color: #FF4500 !important;
          color: #FF4500 !important;
        }
        .knowledge-filters-stack-no-hover .selected-filter:hover,
        .knowledge-filters-stack-no-hover .selected-filter:focus,
        .knowledge-filters-stack-no-hover .selected-filter:active {
          background-color: #FFF7ED !important;
          border-color: #FF4500 !important;
          color: #FF4500 !important;
        }
        .knowledge-filters-stack-no-hover .selected-tag {
          background-color: #FF4500 !important;
        }
        .knowledge-filters-stack-no-hover .selected-tag:hover,
        .knowledge-filters-stack-no-hover .selected-tag:focus {
          background-color: #FF4500 !important;
        }
      `}</style>
      <Flex vertical gap="16px">
        
        {/* Search Section */}
        <div>
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            CARI
          </Text>
          
          <Search
            placeholder="Cari konten..."
            allowClear
            size="small"
            style={{ width: "100%" }}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={onSearchChange}
          />
        </div>

        <Divider style={{ margin: "8px 0" }} />

        {/* Sort Section */}
        <div>
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            URUTKAN
          </Text>
          
          <Select
            style={{ width: "100%" }}
            size="small"
            value={selectedSort}
            onChange={onSortChange}
            suffixIcon={<DownOutlined style={{ color: "#9CA3AF", fontSize: "10px" }} />}
            options={sortOptions}
          />
        </div>
        
        <Divider style={{ margin: "8px 0" }} />
        
        {/* Format Section */}
        <div>
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            FORMAT
          </Text>
          
          <Flex vertical gap="4px">
            {isLoading ? (
              // Loading skeleton for type buttons
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton.Button key={index} active size="small" style={{ width: "100%", height: "32px" }} />
              ))
            ) : (
              typeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="text"
                  size="small"
                  className={selectedType === option.value ? "selected-filter" : ""}
                  style={{
                    height: "32px",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    border: selectedType === option.value ? "1px solid #FF4500" : "1px solid transparent",
                    backgroundColor: selectedType === option.value ? "#FFF7ED" : "transparent",
                    color: selectedType === option.value ? "#FF4500" : "#374151",
                    fontWeight: selectedType === option.value ? 600 : 400,
                    fontSize: "13px",
                    padding: "0 8px",
                  }}
                  icon={option.icon ? React.cloneElement(option.icon, { style: { fontSize: "14px" } }) : null}
                  onClick={() => onTypeChange(option.value)}
                >
                  <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                    <span>{option.label}</span>
                    {typeCounts[option.value] !== undefined && (
                      <Badge 
                        count={typeCounts[option.value]} 
                        size="small"
                        style={{ 
                          backgroundColor: selectedType === option.value ? "#FF4500" : "#f0f0f0",
                          color: selectedType === option.value ? "white" : "#666"
                        }} 
                      />
                    )}
                  </Flex>
                </Button>
              ))
            )}
          </Flex>
        </div>

        <Divider style={{ margin: "4px 0" }} />

        {/* Status Section (if enabled) - Collapsible */}
        {showStatusFilter && statusOptions.length > 0 && (
          <div style={{ marginTop: "-2px" }}>
            <Button
              type="text"
              onClick={() => setShowStatus(!showStatus)}
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 0",
                height: "auto",
                marginBottom: "4px",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                STATUS
              </Text>
              {showStatus ? <UpOutlined style={{ fontSize: "10px" }} /> : <DownOutlined style={{ fontSize: "10px" }} />}
            </Button>
            
            {showStatus && (
              <Flex gap="4px" wrap="wrap" style={{ marginBottom: "4px" }}>
                {isLoading ? (
                  // Loading skeleton for status tags
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton.Button key={index} active size="small" style={{ width: "80px", height: "24px" }} />
                  ))
                ) : (
                  statusOptions.map((status) => (
                    <Tag
                      key={status.key}
                      className={selectedStatus === status.key ? "selected-tag" : ""}
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        backgroundColor: selectedStatus === status.key ? "#FF4500" : "#F5F5F5",
                        color: selectedStatus === status.key ? "white" : "#595959",
                        border: selectedStatus === status.key ? "1px solid #FF4500" : "1px solid #E8E8E8",
                        cursor: "pointer",
                        borderRadius: "8px",
                        margin: 0,
                      }}
                      onClick={() => onStatusChange(status.key)}
                    >
                      {status.label}
                      {statusCounts[status.key] !== undefined ? ` (${statusCounts[status.key]})` : ""}
                    </Tag>
                  ))
                )}
              </Flex>
            )}
          </div>
        )}
        {/* Instance Section (if enabled) - Collapsible */}
        {showInstanceFilter && instanceOptions.length > 0 && (
          <div style={{ marginTop: "-4px" }}>
            <Button
              type="text"
              onClick={() => setShowInstance(!showInstance)}
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 0",
                height: "auto",
                marginBottom: "4px",
              }}
            >
              <Text
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                INSTANSI
              </Text>
              {showInstance ? <UpOutlined style={{ fontSize: "10px" }} /> : <DownOutlined style={{ fontSize: "10px" }} />}
            </Button>
            
            {showInstance && (
              <Select
                placeholder="Pilih Instansi"
                style={{ width: "100%", marginBottom: "4px" }}
                size="small"
                value={selectedInstance}
                onChange={onInstanceChange}
                suffixIcon={<DownOutlined style={{ color: "#9CA3AF", fontSize: "10px" }} />}
                options={[
                  { label: "Semua Instansi", value: null },
                  ...instanceOptions.map(option => ({
                    label: option.label,
                    value: option.value
                  }))
                ]}
              />
            )}
          </div>
        )}
        {/* Category Section - Collapsible */}
        <div style={{ marginTop: "-4px" }}>
          <Button
            type="text"
            onClick={() => setShowCategories(!showCategories)}
            style={{
              width: "100%",
              justifyContent: "space-between",
              padding: "4px 0",
              height: "auto",
              marginBottom: "4px",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              KATEGORI
            </Text>
            {showCategories ? <UpOutlined style={{ fontSize: "10px" }} /> : <DownOutlined style={{ fontSize: "10px" }} />}
          </Button>
          
          {showCategories && (
            <Flex gap="4px" wrap="wrap" style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "4px" }}>
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <Tag
                    key={category.id}
                    className={isSelected ? "selected-tag" : ""}
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      backgroundColor: isSelected ? "#FF4500" : "#F5F5F5",
                      color: isSelected ? "white" : "#595959",
                      border: isSelected ? "1px solid #FF4500" : "1px solid #E8E8E8",
                      cursor: "pointer",
                      borderRadius: "8px",
                      margin: 0,
                    }}
                    onClick={() => onCategoryChange(category.id)}
                  >
                    {category.name}
                    {categoryCounts[category.id] !== undefined && (
                      <span style={{ marginLeft: "4px" }}>
                        ({categoryCounts[category.id]})
                      </span>
                    )}
                  </Tag>
                );
              })}
            </Flex>
          )}
        </div>
        {/* Tag Section - Collapsible */}
        <div style={{ marginTop: "-4px" }}>
          <Button
            type="text"
            onClick={() => setShowTags(!showTags)}
            style={{
              width: "100%",
              justifyContent: "space-between",
              padding: "4px 0",
              height: "auto",
              marginBottom: "4px",
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              TAG
            </Text>
            {showTags ? <UpOutlined style={{ fontSize: "10px" }} /> : <DownOutlined style={{ fontSize: "10px" }} />}
          </Button>
          
          {showTags && (
            <Flex gap="4px" wrap="wrap" style={{ marginBottom: "4px" }}>
              {popularTags.map((tag) => {
                const isSelected = selectedTag && selectedTag.includes(tag);
                return (
                  <Tag
                    key={tag}
                    className={isSelected ? "selected-tag" : ""}
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      backgroundColor: isSelected ? "#FF4500" : "#F5F5F5",
                      color: isSelected ? "white" : "#595959",
                      border: isSelected ? "1px solid #FF4500" : "1px solid #E8E8E8",
                      cursor: "pointer",
                      borderRadius: "8px",
                      margin: 0,
                    }}
                    onClick={() => {
                      const currentTags = selectedTag || [];
                      let newTags;
                      if (isSelected) {
                        newTags = currentTags.filter((t) => t !== tag);
                      } else {
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
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <Divider style={{ margin: "8px 0" }} />
            <Button
              type="text"
              size="small"
              style={{
                color: "#FF4500",
                fontWeight: 600,
                height: "32px",
                width: "100%",
                fontSize: "12px",
              }}
              onClick={handleClearFilters}
            >
              Hapus Semua Filter
            </Button>
          </>
        )}
      </Flex>
    </div>
  );
};

export default KnowledgeFiltersStack;