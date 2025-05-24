import React, { useState, useEffect } from "react";
import { Select, Avatar, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useDebouncedCallback } from "@mantine/hooks";
import { searchUsers } from "@/services/rasn-mail.services";

const { Text } = Typography;

const UserSearch = ({
  value = [],
  onChange,
  placeholder = "Search users...",
  mode = "multiple",
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mantine's useDebouncedCallback
  const debouncedSearch = useDebouncedCallback(
    async (searchValue) => {
      if (!searchValue || searchValue.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await searchUsers(searchValue);
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    300 // 300ms delay
  );

  const handleSearch = (searchValue) => {
    debouncedSearch(searchValue);
  };

  const handleChange = (selectedValues) => {
    const selectedUsers = selectedValues.map((val) => {
      if (typeof val === "string") {
        return (
          searchResults.find((user) => user.id === val) || {
            id: val,
            username: val,
          }
        );
      }
      return val;
    });
    onChange(selectedUsers);
  };

  return (
    <Select
      mode={mode}
      placeholder={placeholder}
      value={value.map((user) => user.id)}
      onChange={handleChange}
      onSearch={handleSearch}
      loading={loading}
      showSearch
      filterOption={false}
      notFoundContent={loading ? "Searching..." : "No users found"}
      optionLabelProp="label"
      style={{ width: "100%" }}
    >
      {searchResults.map((user) => (
        <Select.Option key={user.id} value={user.id} label={user.username}>
          <Space>
            <Avatar src={user.image} size="small" icon={<UserOutlined />}>
              {user.username?.charAt(0)}
            </Avatar>
            <div>
              <Text strong>{user.username}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {user.username} • {user.organization_id}
              </Text>
            </div>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
};

export default UserSearch;
