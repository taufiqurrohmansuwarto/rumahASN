import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FaqQnaActions from "@/components/Ticket/FaqQna/FaqQnaActions";
import { Button, Col, Grid, Input, Row, Select, Space } from "antd";

const { Search } = Input;
const { useBreakpoint } = Grid;

function FaqQnaFilters({
  searchText,
  setSearchText,
  handleSearch,
  is_active,
  handleFilterStatus,
  sub_category_id,
  handleFilterSubCategory,
  show_expired,
  handleFilterExpired,
  dataSubCategories,
  hasActiveFilters,
  clearFilters,
  isRefetching,
  refetch,
  handleOpen,
  isDownloading,
  handleDownload,
}) {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  return (
    <div
      style={{
        padding: "20px 0 16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* Row 1: Search & Filters */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12} md={10}>
          <Search
            placeholder="Cari pertanyaan atau jawaban"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Status"
            allowClear
            value={is_active}
            onChange={handleFilterStatus}
            style={{ width: "100%" }}
            options={[
              { label: "Semua", value: undefined },
              { label: "Aktif", value: "true" },
              { label: "Nonaktif", value: "false" },
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Kategori"
            allowClear
            showSearch
            value={sub_category_id}
            onChange={handleFilterSubCategory}
            style={{ width: "100%" }}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { label: "Semua", value: undefined },
              ...(dataSubCategories?.data || []).map((item) => ({
                label: `${item.name} (${item.category?.name})`,
                value: item.id,
              })),
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Kadaluarsa"
            value={show_expired}
            onChange={handleFilterExpired}
            style={{ width: "100%" }}
            options={[
              { label: "Sembunyikan", value: "false" },
              { label: "Tampilkan", value: "true" },
            ]}
          />
        </Col>
      </Row>

      {/* Row 2: Actions */}
      <Row gutter={[8, 8]} align="middle">
        <Col flex="auto">
          {hasActiveFilters && (
            <Button type="link" onClick={clearFilters} size="small">
              Hapus Filter
            </Button>
          )}
        </Col>
        <Col>
          <Space size="small">
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetching}
              onClick={() => refetch()}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpen()}
            />
            <Button
              icon={<DownloadOutlined />}
              loading={isDownloading}
              onClick={handleDownload}
            />
            <FaqQnaActions />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default FaqQnaFilters;

