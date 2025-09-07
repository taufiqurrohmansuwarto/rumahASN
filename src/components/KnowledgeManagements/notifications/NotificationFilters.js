import React, { useState } from "react";
import { useRouter } from "next/router";
import { 
  Flex, 
  Select, 
  Button, 
  Typography, 
  Tag, 
  Badge,
  Divider,
  Input,
} from "antd";
import { 
  FilterOutlined, 
  ClearOutlined,
  DownOutlined,
  UpOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  UserOutlined,
  FileTextOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Search } = Input;

const NotificationFilters = ({
  selectedType = "all",
  selectedStatus = "all", 
  searchQuery = "",
  // Filter counts
  typeCounts = {},
  totalCount = 0,
  unreadCount = 0,
  isLoading = false,
}) => {
  const router = useRouter();

  // Helper function to build URL query
  const buildURLQuery = (updates = {}) => {
    const query = {};
    
    const type = updates.type !== undefined ? updates.type : selectedType;
    const status = updates.status !== undefined ? updates.status : selectedStatus;
    const search = updates.search !== undefined ? updates.search : searchQuery;
    
    if (type && type !== "all") {
      query.type = type;
    }
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (search) {
      query.search = search;
    }
    
    return query;
  };

  // Override handlers to use router
  const handleTypeChange = (type) => {
    const query = buildURLQuery({ type });
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleStatusChange = (status) => {
    const query = buildURLQuery({ status });
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleSearchChange = (search) => {
    const query = buildURLQuery({ search });
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

  const handleClearFilters = () => {
    router.push({
      pathname: router.pathname,
      query: {},
    }, undefined, { shallow: true });
  };

  // Notification type options dengan icons
  const typeOptions = [
    {
      label: "Semua Jenis",
      value: "all",
      icon: null,
      color: "#666",
      count: totalCount,
    },
    {
      label: "Disukai",
      value: "like",
      icon: <HeartOutlined style={{ color: "#ff6b6b" }} />,
      color: "#ff6b6b",
      count: typeCounts.like || 0,
    },
    {
      label: "Komentar",
      value: "comment",
      icon: <CommentOutlined style={{ color: "#4dabf7" }} />,
      color: "#4dabf7",
      count: typeCounts.comment || 0,
    },
    {
      label: "Dibagikan",
      value: "share", 
      icon: <ShareAltOutlined style={{ color: "#51cf66" }} />,
      color: "#51cf66",
      count: typeCounts.share || 0,
    },
    {
      label: "Disebutkan",
      value: "mention",
      icon: <UserOutlined style={{ color: "#ffd43b" }} />,
      color: "#ffd43b", 
      count: typeCounts.mention || 0,
    },
    {
      label: "Status Konten",
      value: "content_status",
      icon: <FileTextOutlined style={{ color: "#6c757d" }} />,
      color: "#6c757d",
      count: typeCounts.content_status || 0,
    },
    {
      label: "Sistem",
      value: "system",
      icon: <BellOutlined style={{ color: "#dc3545" }} />,
      color: "#dc3545", 
      count: typeCounts.system || 0,
    },
  ];

  // Status options
  const statusOptions = [
    { label: "Semua Status", value: "all" },
    { label: "Belum Dibaca", value: "false" },
    { label: "Sudah Dibaca", value: "true" },
  ];

  // Check if has active filters
  const hasActiveFilters = 
    selectedType !== "all" || 
    selectedStatus !== "all" || 
    searchQuery;

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #EDEFF1",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <style jsx global>{`
        .notification-filters * {
          transition: none !important;
        }
        .notification-filters .ant-btn:hover,
        .notification-filters .ant-btn:focus,
        .notification-filters .ant-btn:active {
          background-color: inherit !important;
          border-color: inherit !important;
          color: inherit !important;
          box-shadow: none !important;
        }
        .notification-filters .ant-select:hover .ant-select-selector,
        .notification-filters .ant-select:focus .ant-select-selector {
          border-color: #d9d9d9 !important;
          box-shadow: none !important;
        }
        .notification-filters .selected-type-tag {
          background-color: #FF4500 !important;
          border-color: #FF4500 !important;
          color: white !important;
        }
      `}</style>

      {/* Filter Header */}
      <div style={{ padding: "12px 16px" }}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="8px">
            <FilterOutlined style={{ color: "#FF4500", fontSize: "14px" }} />
            <Text
              style={{
                color: "#FF4500",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Filter & Cari
            </Text>
            {hasActiveFilters && (
              <Badge 
                count={
                  (selectedType !== "all" ? 1 : 0) + 
                  (selectedStatus !== "all" ? 1 : 0) + 
                  (searchQuery ? 1 : 0)
                } 
                size="small"
                style={{ marginLeft: "4px" }}
              />
            )}
          </Flex>
          
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              style={{
                color: "#8c8c8c",
                fontSize: "12px",
                padding: "4px 8px",
                height: "24px",
              }}
            >
              Hapus Filter
            </Button>
          )}
        </Flex>
      </div>

      {/* Filters Content */}
      <div className="notification-filters">
        <Divider style={{ margin: "0 0 16px 0" }} />
        
        <div style={{ padding: "0 16px 16px" }}>
            <Flex vertical gap="16px">
              
              {/* Search */}
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
                  CARI NOTIFIKASI
                </Text>
                
                <Search
                  placeholder="Cari dalam notifikasi..."
                  allowClear
                  size="small"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onSearch={handleSearchChange}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Status Filter */}
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
                  STATUS BACA
                </Text>
                
                <Select
                  style={{ width: "100%" }}
                  size="small"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  suffixIcon={<DownOutlined style={{ color: "#9CA3AF", fontSize: "10px" }} />}
                  options={statusOptions}
                />
              </div>

              {/* Type Filter dengan Tags */}
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
                  JENIS NOTIFIKASI
                </Text>
                
                <Flex gap="6px" wrap="wrap">
                  {typeOptions.map((option) => {
                    const isSelected = selectedType === option.value;
                    const count = option.count || 0;
                    
                    return (
                      <Tag
                        key={option.value}
                        className={isSelected ? "selected-type-tag" : ""}
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          backgroundColor: isSelected ? "#FF4500" : "#F5F5F5",
                          color: isSelected ? "white" : "#595959",
                          border: isSelected ? "1px solid #FF4500" : "1px solid #E8E8E8",
                          cursor: "pointer",
                          borderRadius: "6px",
                          margin: "2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={() => handleTypeChange(option.value)}
                      >
                        {option.icon && (
                          React.cloneElement(option.icon, {
                            style: {
                              ...option.icon.props.style,
                              color: isSelected ? "white" : option.color,
                              fontSize: "12px",
                            }
                          })
                        )}
                        {option.label}
                        {count > 0 && (
                          <Badge
                            count={count}
                            size="small"
                            style={{
                              backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : option.color,
                              color: isSelected ? "white" : "white",
                              fontSize: "10px",
                              marginLeft: "2px",
                            }}
                          />
                        )}
                      </Tag>
                    );
                  })}
                </Flex>
              </div>

              {/* Quick Stats */}
              {!isLoading && (totalCount > 0 || unreadCount > 0) && (
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
                    RINGKASAN
                  </Text>
                  
                  <Flex gap="12px" align="center">
                    <Text style={{ fontSize: "12px", color: "#595959" }}>
                      Total: <strong>{totalCount}</strong>
                    </Text>
                    <span style={{ color: "#d9d9d9" }}>•</span>
                    <Text style={{ 
                      fontSize: "12px", 
                      color: unreadCount > 0 ? "#FF4500" : "#52c41a",
                      fontWeight: unreadCount > 0 ? 600 : 400,
                    }}>
                      Belum dibaca: <strong>{unreadCount}</strong>
                    </Text>
                  </Flex>
                </div>
              )}
              
            </Flex>
          </div>
        </div>
      </div>
  );
};

export default NotificationFilters;