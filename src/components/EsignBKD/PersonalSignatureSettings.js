import React, { memo, useCallback } from "react";
import { Select, Flex } from "antd";
import { Text as MantineText } from "@mantine/core";

const { Option } = Select;

function PersonalSignatureSettings({ currentUserPages, onChange, totalPages = 1 }) {
  // Validate pages to only contain numbers and within valid range
  const handlePagesChange = useCallback((value) => {
    const validPages = value
      .filter(page => {
        const num = parseInt(page);
        return !isNaN(num) && num > 0 && num <= totalPages;
      })
      .map(page => parseInt(page));

    onChange(validPages);
  }, [onChange, totalPages]);

  return (
    <div>
      <MantineText style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
        Pengaturan Tanda Tangan Anda
      </MantineText>
      <div style={{ padding: "16px", background: "#f0f5ff", borderRadius: "8px", border: "1px solid #adc6ff" }}>
        <Flex vertical gap="middle">
          <Flex gap="middle" align="center">
            <MantineText fw={500} size="sm" c="#6b7280">Halaman yang akan ditandatangani:</MantineText>
            <Select
              mode="tags"
              placeholder={`Ketik nomor halaman (1-${totalPages})`}
              value={currentUserPages}
              onChange={handlePagesChange}
              style={{ minWidth: 200, borderRadius: 6 }}
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
          <MantineText style={{ fontSize: 12, color: "#9ca3af" }}>
            Ketik nomor halaman yang akan ditandatangani (1-{totalPages}). Contoh: 1, 3, 5 (pisahkan dengan koma)
          </MantineText>
        </Flex>
      </div>
    </div>
  );
}

export default memo(PersonalSignatureSettings);