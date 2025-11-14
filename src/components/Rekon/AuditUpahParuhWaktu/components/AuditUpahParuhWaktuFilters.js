import { Text } from "@mantine/core";
import { Button, Col, Input, Row, Grid } from "antd";
import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useCallback, useRef } from "react";
import { debounce } from "lodash";

const { useBreakpoint } = Grid;
const { Search } = Input;

const AuditUpahParuhWaktuFilters = ({
  nama_operator,
  nama_pegawai,
  hasFilters,
  isLoading,
  isRefetching,
  isMutating,
  onSearch,
  onClearFilters,
  onRefresh,
  onDownload,
}) => {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  // Create debounced search function
  const debouncedSearchRef = useRef(
    debounce((field, value) => {
      onSearch(field, value);
    }, 500)
  ).current;

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (field, value) => {
      debouncedSearchRef(field, value);
    },
    [debouncedSearchRef]
  );

  return (
    <div
      style={{
        padding: "20px 0 16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={8}>
          <div
            style={{
              display: "flex",
              flexDirection: isXs ? "column" : "row",
              alignItems: isXs ? "stretch" : "center",
              gap: 6,
            }}
          >
            <Text fw={600} size="sm" c="dimmed" style={{ minWidth: 100 }}>
              Nama Operator:
            </Text>
            <Search
              placeholder="Cari nama operator"
              allowClear
              defaultValue={nama_operator}
              onChange={(e) => handleSearchChange("nama_operator", e.target.value)}
              onSearch={(value) => onSearch("nama_operator", value)}
              style={{ width: isXs ? "100%" : 200 }}
              size="small"
            />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div
            style={{
              display: "flex",
              flexDirection: isXs ? "column" : "row",
              alignItems: isXs ? "stretch" : "center",
              gap: 6,
            }}
          >
            <Text fw={600} size="sm" c="dimmed" style={{ minWidth: 100 }}>
              Nama Pegawai:
            </Text>
            <Search
              placeholder="Cari nama pegawai"
              allowClear
              defaultValue={nama_pegawai}
              onChange={(e) => handleSearchChange("nama_pegawai", e.target.value)}
              onSearch={(value) => onSearch("nama_pegawai", value)}
              style={{ width: isXs ? "100%" : 200 }}
              size="small"
            />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div
            style={{
              display: "flex",
              justifyContent: isXs ? "flex-start" : "flex-end",
              gap: 8,
            }}
          >
            {hasFilters && (
              <Button
                type="text"
                onClick={onClearFilters}
                style={{
                  color: "#FF4500",
                  fontWeight: 500,
                  padding: "4px 8px",
                }}
              >
                Clear Filter
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              loading={isLoading || isRefetching}
              onClick={onRefresh}
              style={{ borderRadius: 6, fontWeight: 500 }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={isMutating}
              onClick={onDownload}
              style={{
                background: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              Unduh Data
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AuditUpahParuhWaktuFilters;

