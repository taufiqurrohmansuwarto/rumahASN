import React, { useState, useEffect, useRef, useCallback } from "react";
import { Select, Button, Space, Avatar, Typography } from "antd";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { searchUsers } from "@/services/rasn-mail.services";

const { Text } = Typography;

const RecipientSelector = ({
  recipients,
  onChange,
  showCc = false,
  showBcc = false,
  onToggleCc,
  onToggleBcc,
}) => {
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const debounceRef = useRef(null);

  const debouncedUserSearch = useCallback(async (searchText) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!searchText || searchText.length < 2) {
        setUserSearchResults([]);
        setIsSearchingUsers(false);
        return;
      }

      setIsSearchingUsers(true);
      try {
        const response = await searchUsers(searchText);
        if (response.success) {
          const formattedUsers = response.data.map((user) => ({
            label: user.username,
            value: user.id,
            user: user,
          }));
          setUserSearchResults(formattedUsers);
        }
      } catch (error) {
        console.error("Search users error:", error);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleUserSearch = (searchText) => {
    debouncedUserSearch(searchText);
  };

  const handleRecipientChange = (type, selectedOptions) => {
    onChange({
      ...recipients,
      [type]: selectedOptions || [],
    });
  };

  const renderUserOption = (user) => (
    <div style={{ display: "flex", alignItems: "center", padding: "4px 0" }}>
      <Avatar
        src={user.user?.image}
        size="small"
        icon={<UserOutlined />}
        style={{ marginRight: "8px" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "500" }}>{user.user?.username}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {user.user?.org_id || "No Organization"}
        </div>
      </div>
    </div>
  );

  const selectProps = {
    mode: "multiple",
    onSearch: handleUserSearch,
    loading: isSearchingUsers,
    showSearch: true,
    filterOption: false,
    notFoundContent: isSearchingUsers
      ? "Mencari pengguna..."
      : userSearchResults.length === 0
      ? "Ketik minimal 2 karakter untuk mencari"
      : "Tidak ada pengguna ditemukan",
    style: { width: "100%" },
    optionLabelProp: "label",
    children: userSearchResults.map((user) => (
      <Select.Option
        key={user.value}
        value={user.value}
        label={user.label}
      >
        {renderUserOption(user)}
      </Select.Option>
    )),
  };

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        padding: "16px",
        marginBottom: "16px",
        backgroundColor: "#fafafa",
      }}
    >
      {/* To Field */}
      <div style={{ marginBottom: "12px" }}>
        <Text strong style={{ marginBottom: "8px", display: "block" }}>
          Kepada *
        </Text>
        <Select
          {...selectProps}
          placeholder="Ketik nama pengguna untuk mencari..."
          value={recipients.to}
          onChange={(value, options) =>
            handleRecipientChange("to", options)
          }
          suffixIcon={<UserAddOutlined />}
        />
      </div>

      {/* CC Field */}
      {showCc && (
        <div style={{ marginBottom: "12px" }}>
          <Text strong style={{ marginBottom: "8px", display: "block" }}>
            CC
          </Text>
          <Select
            {...selectProps}
            placeholder="Ketik nama pengguna untuk menambah CC..."
            value={recipients.cc}
            onChange={(value, options) =>
              handleRecipientChange("cc", options)
            }
          />
        </div>
      )}

      {/* BCC Field */}
      {showBcc && (
        <div style={{ marginBottom: "12px" }}>
          <Text strong style={{ marginBottom: "8px", display: "block" }}>
            BCC
          </Text>
          <Select
            {...selectProps}
            placeholder="Ketik nama pengguna untuk menambah BCC..."
            value={recipients.bcc}
            onChange={(value, options) =>
              handleRecipientChange("bcc", options)
            }
          />
        </div>
      )}

      {/* CC/BCC Toggle Buttons */}
      <Space style={{ marginTop: "8px" }}>
        {!showCc && (
          <Button type="link" size="small" onClick={onToggleCc}>
            + CC
          </Button>
        )}
        {!showBcc && (
          <Button type="link" size="small" onClick={onToggleBcc}>
            + BCC
          </Button>
        )}
      </Space>
    </div>
  );
};

export default RecipientSelector;