import React, { memo, useCallback, useMemo } from "react";
import { Button, Input, Select, AutoComplete, Flex, Avatar, Alert, Radio } from "antd";
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
    // If role changes to reviewer, clear signature_pages
    if (field === 'role_type' && value === 'reviewer') {
      onUpdate(signer.id, 'signature_pages', []);
      onUpdate(signer.id, 'tag_coordinate', '!');
    }

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
  const handleUserSelect = useCallback((value, option) => {
    const selectedOption = userOptions.find(opt => opt.value === value);
    if (selectedOption && selectedOption.user) {
      const user = selectedOption.user;
      // Update all user fields in batch
      onUpdate(signer.id, "user_id", user.id);
      onUpdate(signer.id, "username", user.username);
      onUpdate(signer.id, "user_name", user.username);
      onUpdate(signer.id, "nama_jabatan", user.nama_jabatan || "");
      onUpdate(signer.id, "avatar", user.image || user.avatar || "");
    }
  }, [userOptions, onUpdate, signer.id]);

  // Handle search input change
  const handleSearchChange = useCallback((value) => {
    handleSearch(value);
    // Update username field as user types or clears
    onUpdate(signer.id, "username", value || "");
    // Clear user data when input is cleared
    if (!value) {
      onUpdate(signer.id, "user_id", "");
      onUpdate(signer.id, "user_name", "");
      onUpdate(signer.id, "nama_jabatan", "");
      onUpdate(signer.id, "avatar", "");
    }
  }, [handleSearch, onUpdate, signer.id]);

  // Check validation errors
  const hasUserError = !signer.user_id;
  const hasPageError = signer.role_type === 'signer' && (!signer.signature_pages || signer.signature_pages.length === 0);

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
          <Flex gap="middle">
            <AutoComplete
              style={{ flex: 2, borderRadius: 6 }}
              placeholder="Pilih username penandatangan"
              value={signer.username || ""}
              options={userOptions}
              onSelect={handleUserSelect}
              onSearch={handleSearchChange}
              onChange={handleSearchChange}
              onClear={() => {
                onUpdate(signer.id, "username", "");
                onUpdate(signer.id, "user_id", "");
                onUpdate(signer.id, "user_name", "");
                onUpdate(signer.id, "nama_jabatan", "");
                onUpdate(signer.id, "avatar", "");
              }}
              notFoundContent={isSearching ? "Memuat..." : "Tidak ada pengguna ditemukan"}
              allowClear
              showSearch
              filterOption={false}
              status={hasUserError ? "error" : ""}
            />

            <Radio.Group
              value={signer.role_type}
              onChange={(e) => handleUpdate("role_type", e.target.value)}
              size="small"
              buttonStyle="solid"
            >
              <Radio.Button value="reviewer">Reviewer</Radio.Button>
              <Radio.Button value="signer">Signer</Radio.Button>
            </Radio.Group>

            {signer.role_type === 'signer' && (
              <>
                <Select
                  mode="tags"
                  placeholder="Hal. (ex: 1,3,5)"
                  value={signer.signature_pages}
                  onChange={(value) => handleUpdate("signature_pages", value)}
                  style={{ width: 140, borderRadius: 6 }}
                  status={hasPageError ? "error" : ""}
                  allowClear
                  tokenSeparators={[',', ' ']}
                  title="Nomor halaman yang akan ditandatangani"
                  onInputKeyDown={(e) => {
                    // Only allow numbers, backspace, delete, arrow keys, comma, space
                    if (!/[0-9,\s]/.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Select
                  value={signer.tag_coordinate || "!"}
                  onChange={(value) => handleUpdate("tag_coordinate", value)}
                  style={{ width: 90, borderRadius: 6 }}
                  placeholder="Tanda"
                  title="Karakter penanda posisi tanda tangan di PDF"
                >
                  <Option value="!" title="Tanda seru untuk penanda posisi">!</Option>
                  <Option value="@" title="At symbol untuk penanda posisi">@</Option>
                  <Option value="#" title="Hashtag untuk penanda posisi">#</Option>
                  <Option value="$" title="Dollar untuk penanda posisi">$</Option>
                  <Option value="^" title="Caret untuk penanda posisi">^</Option>
                </Select>
              </>
            )}
          </Flex>

          {/* Notes input - shown for all roles */}
          <Input.TextArea
            placeholder="Catatan untuk penandatangan ini (opsional)"
            value={signer.notes || ""}
            onChange={(e) => handleUpdate("notes", e.target.value)}
            rows={2}
            maxLength={200}
            showCount
            style={{
              borderRadius: 6,
              fontSize: 12,
              marginTop: 4
            }}
          />

          {/* Error messages */}
          {hasUserError && (
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
              Silakan lengkapi username/pengguna
            </div>
          )}
          {hasPageError && (
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
              Signer harus memilih minimal 1 halaman untuk ditandatangani
            </div>
          )}
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