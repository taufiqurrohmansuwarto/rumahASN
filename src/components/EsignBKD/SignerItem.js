import React, { memo, useCallback, useMemo } from "react";
import { Button, Input, Select, AutoComplete, Flex, Avatar } from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useUserSearch } from "@/hooks/esign-bkd";

const { Option } = Select;

function SignerItem({ signer, index, onUpdate, onRemove, totalPages = 1 }) {
  // Use user search hook with client-side filtering
  const {
    userOptions,
    isLoading: isSearching,
    handleSearch,
    clearSearch
  } = useUserSearch();
  const handleUpdate = useCallback((field, value) => {
    // Validate signature_pages to only contain numbers and within valid range
    if (field === 'signature_pages') {
      const validPages = value
        .filter(page => {
          const num = parseInt(page);
          return !isNaN(num) && num > 0 && num <= totalPages;
        })
        .map(page => parseInt(page));
      onUpdate(signer.id, field, validPages);
    } else {
      onUpdate(signer.id, field, value);
    }
  }, [signer.id, onUpdate, totalPages]);

  const handleRemove = useCallback(() => {
    onRemove(signer.id);
  }, [signer.id, onRemove]);

  // Handle user selection from autocomplete
  const handleUserSelect = useCallback((value) => {
    // If it's a selected option, extract user data
    const selectedOption = userOptions.find(option => option.value === value);
    if (selectedOption && selectedOption.user) {
      const user = selectedOption.user;
      handleUpdate("user_id", user.id); // Store user_id (custom_id)
      handleUpdate("username", user.username); // Store username
      handleUpdate("user_name", user.username); // For display
      handleUpdate("nama_jabatan", user.nama_jabatan || "");
      handleUpdate("avatar", user.image || user.avatar || ""); // Store avatar
    } else {
      // If it's manually typed, clear user data
      handleUpdate("user_id", "");
      handleUpdate("username", value);
      handleUpdate("user_name", "");
      handleUpdate("nama_jabatan", "");
      handleUpdate("avatar", "");
    }
  }, [userOptions, handleUpdate]);

  // Handle search input change (immediate, no debounce needed)
  const handleSearchChange = useCallback((value) => {
    handleSearch(value);
    // Also update the username field as user types
    handleUpdate("username", value);
  }, [handleSearch, handleUpdate]);

  return (
    <div
      style={{ background: "#ffffff", padding: "10px", borderRadius: "6px", border: "1px solid #e8e8e8" }}
    >
      <Flex align="center" gap="middle">
        <Flex
          align="center"
          justify="center"
          style={{
            width: 32,
            height: 32,
            backgroundColor: "#FF4500",
            borderRadius: "50%",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Flex>

        <Flex vertical gap="small" style={{ flex: 1 }}>
          {/* Display selected user info if available */}
          {signer.user_name && (
            <div style={{
              background: "#f6ffed",
              borderRadius: 6,
              padding: "6px 8px",
              border: "1px solid #b7eb8f",
              fontSize: 12
            }}>
              <Flex align="center" gap="small">
                <Avatar
                  size={20}
                  src={signer.avatar}
                  icon={<UserOutlined />}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: "#52c41a",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    ✓ {signer.user_name}
                    {signer.nama_jabatan && (
                      <span style={{ color: "#389e0d", fontWeight: 400 }}>
                        {` - ${signer.nama_jabatan}`}
                      </span>
                    )}
                  </div>
                </div>
              </Flex>
            </div>
          )}

          <Flex gap="middle">
            <AutoComplete
              style={{ flex: 2, borderRadius: 6 }}
              placeholder="Ketik username penandatangan"
              value={signer.username}
              options={userOptions}
              onSelect={handleUserSelect}
              onSearch={handleSearchChange}
              onChange={handleSearchChange}
              notFoundContent={isSearching ? "Memuat..." : "Tidak ada pengguna ditemukan"}
              allowClear
              showSearch
              filterOption={false} // We handle filtering on client side
            >
              <Input
                prefix={<UserOutlined style={{ color: '#aaa' }} />}
                placeholder="Ketik username penandatangan"
              />
            </AutoComplete>

            <Select
              value={signer.role_type}
              onChange={(value) => handleUpdate("role_type", value)}
              style={{ width: 120 }}
            >
              <Option value="reviewer">Reviewer</Option>
              <Option value="signer">Signer</Option>
              <Option value="approver">Approver</Option>
            </Select>

            <Select
              mode="tags"
              placeholder={`1-${totalPages}`}
              value={signer.signature_pages}
              onChange={(value) => handleUpdate("signature_pages", value)}
              style={{ width: 120, borderRadius: 6 }}
              allowClear
              tokenSeparators={[',', ' ']}
              onInputKeyDown={(e) => {
                // Only allow numbers, backspace, delete, arrow keys, comma, space
                if (!/[0-9,\s]/.test(e.key) &&
                    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Flex>

          <Input
            placeholder="Catatan (opsional)"
            value={signer.notes}
            onChange={(e) => handleUpdate("notes", e.target.value)}
            style={{ borderRadius: 6 }}
          />
        </Flex>

        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleRemove}
          danger
        />
      </Flex>
    </div>
  );
}

export default memo(SignerItem);