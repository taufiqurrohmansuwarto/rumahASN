import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, Avatar, Typography, Space, Spin, Flex } from "antd";
import { IconUser, IconSearch } from "@tabler/icons-react";
import { searchUsers } from "../../../services/users.services";

const { Text } = Typography;

function MemberSelector({
  value,
  onChange,
  placeholder = "Cari user...",
  excludeIds = [],
  mode = "default",
  style = {},
}) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery(
    ["search-users", search],
    () => searchUsers({ search, limit: 20 }),
    { enabled: search.length >= 2 }
  );

  const users = data?.filter((u) => !excludeIds.includes(u.custom_id)) || [];

  const options = users.map((user) => ({
    value: user.custom_id,
    label: (
      <Flex gap={8} align="center">
        <Avatar src={user.image} size={24}>
          {user.username?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div>
          <Text style={{ fontSize: 13, display: "block" }}>{user.username}</Text>
          {user.info?.jabatan?.jabatan && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {user.info.jabatan.jabatan}
            </Text>
          )}
        </div>
      </Flex>
    ),
    user,
  }));

  const handleChange = (val) => {
    onChange?.(val);
    // Reset search after selection
    setSearch("");
  };

  return (
    <Select
      showSearch
      mode={mode === "multiple" ? "multiple" : undefined}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      filterOption={false}
      onSearch={setSearch}
      options={options}
      loading={isLoading}
      suffixIcon={<IconSearch size={14} color="#bfbfbf" />}
      notFoundContent={
        isLoading ? (
          <Flex justify="center" style={{ padding: 12 }}>
            <Spin size="small" />
          </Flex>
        ) : search.length < 2 ? (
          <Flex vertical align="center" style={{ padding: 12 }}>
            <IconUser size={24} color="#d9d9d9" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ketik minimal 2 karakter
            </Text>
          </Flex>
        ) : (
          <Flex vertical align="center" style={{ padding: 12 }}>
            <IconUser size={24} color="#d9d9d9" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tidak ditemukan
            </Text>
          </Flex>
        )
      }
      style={{ width: "100%", ...style }}
    />
  );
}

export default MemberSelector;
