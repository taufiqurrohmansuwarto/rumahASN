import React from "react";
import { Input, Switch, Space, Typography } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

const EmailEditor = ({
  content,
  onChange,
  isMarkdown = false,
  onToggleMarkdown,
  rows = 8,
}) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <Text strong>Pesan</Text>
        <Space>
          <Text style={{ fontSize: "12px" }}>Mode:</Text>
          <Switch
            checkedChildren="Markdown"
            unCheckedChildren="Plain"
            checked={isMarkdown}
            onChange={onToggleMarkdown}
            size="small"
          />
        </Space>
      </div>

      <TextArea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          isMarkdown
            ? "Tulis pesan Anda dengan format Markdown...\n\n**Tebal**, *Miring*, `kode`\n\n- List item\n- List item\n\n[Link](https://example.com)"
            : "Tulis pesan Anda..."
        }
        rows={rows}
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          fontFamily: isMarkdown
            ? 'Monaco, "Courier New", monospace'
            : "inherit",
          resize: "vertical",
        }}
        autoSize={{ minRows: rows, maxRows: 20 }}
      />
    </div>
  );
};

export default EmailEditor;
