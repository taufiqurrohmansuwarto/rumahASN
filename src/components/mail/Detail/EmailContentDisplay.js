import React, { useState } from "react";
import { Typography, Button, Divider } from "antd";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { message } from "antd";

const { Text } = Typography;

const EmailContentDisplay = ({ content, isMarkdown = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  if (!content) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#8c8c8c",
          fontStyle: "italic",
        }}
      >
        Email ini tidak memiliki konten
      </div>
    );
  }

  const handleCopyContent = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        message.success("Konten email berhasil disalin");
      })
      .catch(() => {
        message.error("Gagal menyalin konten");
      });
  };

  // Simple markdown to HTML converter (basic)
  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">$1</code>'
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Content Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Text strong>Isi Pesan</Text>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopyContent}
            title="Salin konten"
          />

          {isMarkdown && (
            <Button
              type="text"
              size="small"
              onClick={() => setShowRaw(!showRaw)}
              title={showRaw ? "Tampilkan formatted" : "Tampilkan raw"}
            >
              {showRaw ? "Formatted" : "Raw"}
            </Button>
          )}

          <Button
            type="text"
            size="small"
            icon={
              isExpanded ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Mode normal" : "Mode layar penuh"}
          />
        </div>
      </div>

      {/* Content Body */}
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#ffffff",
          padding: isExpanded ? "32px" : "20px",
          minHeight: isExpanded ? "60vh" : "200px",
          maxHeight: isExpanded ? "none" : "500px",
          overflowY: isExpanded ? "visible" : "auto",
          fontSize: "14px",
          lineHeight: "1.6",
          position: isExpanded ? "fixed" : "relative",
          top: isExpanded ? "50px" : "auto",
          left: isExpanded ? "50px" : "auto",
          right: isExpanded ? "50px" : "auto",
          bottom: isExpanded ? "50px" : "auto",
          zIndex: isExpanded ? 1000 : "auto",
          boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {isMarkdown && !showRaw ? (
          <div
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content),
            }}
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
        ) : (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: showRaw
                ? 'Monaco, "Courier New", monospace'
                : "inherit",
              fontSize: showRaw ? "13px" : "14px",
            }}
          >
            {content}
          </div>
        )}
      </div>

      {/* Overlay for expanded mode */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default EmailContentDisplay;
