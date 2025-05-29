// components/mail/EmailList/EmailListFilters.js
import {
  FilterOutlined,
  MailOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Badge, Input, Select, Space, Typography } from "antd";

const { Text } = Typography;
const { Search } = Input;

const EmailListFilters = ({
  config,
  queryParams,
  onSearch,
  onUnreadFilter,
  onPageSizeChange,
}) => {
  // ✅ SAFETY CHECK untuk availableFilters
  const availableFilters = config?.availableFilters || ["search"];

  const handleSearch = (value) => {
    onSearch?.(value);
  };

  const handleUnreadFilter = (value) => {
    onUnreadFilter?.(value);
  };

  const handlePageSizeChange = (value) => {
    onPageSizeChange?.(value);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "0 24px 16px 24px",
      }}
    >
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Text strong>Cari:</Text>
        <Search
          placeholder="Ketik untuk mencari email..."
          allowClear
          value={queryParams.search}
          onSearch={handleSearch}
          onChange={(e) => !e.target.value && handleSearch("")}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />
      </div>

      {/* Unread Filter - only show if folder supports it */}
      {config.availableFilters.includes("unread") && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text strong>Filter:</Text>
          <Select
            value={queryParams.unreadOnly}
            onChange={handleUnreadFilter}
            style={{ width: 140 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value={false}>
              <Space>
                <MailOutlined />
                Semua Email
              </Space>
            </Select.Option>
            <Select.Option value={true}>
              <Space>
                <Badge dot status="processing" />
                Belum Dibaca
              </Space>
            </Select.Option>
          </Select>
        </div>
      )}

      {/* Page Size */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Text strong>Tampilkan:</Text>
        <Select
          value={queryParams.limit}
          onChange={handlePageSizeChange}
          style={{ width: 120 }}
        >
          <Select.Option value={10}>10 per hal</Select.Option>
          <Select.Option value={25}>25 per hal</Select.Option>
          <Select.Option value={50}>50 per hal</Select.Option>
        </Select>
      </div>
    </div>
  );
};

export default EmailListFilters;
