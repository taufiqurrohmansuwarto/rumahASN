import React, { memo, useCallback } from "react";
import { Select, Flex } from "antd";
import { Text as MantineText } from "@mantine/core";

const { Option } = Select;

function PersonalSignatureSettings({ currentUserPages, tagCoordinate = "!", onChange, totalPages = 1 }) {
  // Validate pages to only contain numbers and within valid range
  const handlePagesChange = useCallback((value) => {
    const validPages = value
      .filter(page => {
        const num = parseInt(page);
        return !isNaN(num) && num > 0 && num <= totalPages;
      })
      .map(page => parseInt(page));

    onChange({ pages: validPages, tagCoordinate });
  }, [onChange, totalPages, tagCoordinate]);

  const handleTagChange = useCallback((value) => {
    onChange({ pages: currentUserPages, tagCoordinate: value });
  }, [onChange, currentUserPages]);

  return (
    <div>
      <MantineText style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
        Pengaturan Tanda Tangan Anda
      </MantineText>
      <div style={{ padding: "16px", background: "#f0f5ff", borderRadius: "8px", border: "1px solid #adc6ff" }}>
        <Flex vertical gap="middle">
          <Flex gap="middle" align="center" wrap="wrap">
            <div style={{ flex: 1, minWidth: 200 }}>
              <MantineText fw={500} size="sm" c="#6b7280" style={{ marginBottom: 4 }}>
                Halaman yang akan ditandatangani:
              </MantineText>
              <Select
                mode="tags"
                placeholder={`Ketik nomor halaman (1-${totalPages})`}
                value={currentUserPages}
                onChange={handlePagesChange}
                style={{ width: "100%", borderRadius: 6 }}
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
            </div>
            <div style={{ minWidth: 150 }}>
              <MantineText fw={500} size="sm" c="#6b7280" style={{ marginBottom: 4 }}>
                Tag Koordinat:
              </MantineText>
              <Select
                value={tagCoordinate}
                onChange={handleTagChange}
                style={{ width: "100%", borderRadius: 6 }}
              >
                <Option value="!">! (Tanda Seru)</Option>
                <Option value="@">@ (At)</Option>
                <Option value="#"># (Hashtag)</Option>
                <Option value="$">$ (Dollar)</Option>
                <Option value="^">^ (Caret)</Option>
              </Select>
            </div>
          </Flex>
          <MantineText style={{ fontSize: 12, color: "#9ca3af" }}>
            Pilih halaman yang akan ditandatangani (1-{totalPages}) dan tag koordinat untuk penempatan tanda tangan. Contoh halaman: 1, 3, 5
          </MantineText>
        </Flex>
      </div>
    </div>
  );
}

export default memo(PersonalSignatureSettings);