import {
  CopyOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { Button, Flex, message } from "antd";
import { useState } from "react";

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

  // Process content to separate quoted content
  const processContent = (text) => {
    // Split content by Gmail-style quote markers
    const parts = text.split(/(Pada .+? menulis:|On .+? wrote:)/);
    const processed = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.match(/Pada .+? menulis:|On .+? wrote:/)) {
        // This is a quote header
        processed.push({
          type: "quote-header",
          content: part,
        });
      } else if (
        i > 0 &&
        parts[i - 1]?.match(/Pada .+? menulis:|On .+? wrote:/)
      ) {
        // This is quoted content (comes after quote header)
        processed.push({
          type: "quoted",
          content: part,
        });
      } else {
        // This is regular content
        processed.push({
          type: "regular",
          content: part,
        });
      }
    }

    return processed;
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

  const renderProcessedContent = (processedParts) => {
    return processedParts.map((part, index) => {
      if (part.type === "quote-header") {
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#8c8c8c",
              fontSize: "12px",
              fontWeight: "500",
              marginTop: index > 0 ? "16px" : "0",
              marginBottom: "8px",
              paddingBottom: "4px",
              borderBottom: "1px solid #f0f0f0",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: "#d9d9d9",
              }}
            />
            <span style={{ fontStyle: "italic" }}>{part.content}</span>
          </div>
        );
      } else if (part.type === "quoted") {
        return (
          <div
            key={index}
            style={{
              position: "relative",
              marginLeft: "8px",
              marginBottom: "12px",
              paddingLeft: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingRight: "12px",
              backgroundColor: "#fafafa",
              borderRadius: "6px",
              border: "1px solid #f0f0f0",
              fontSize: "13px",
              lineHeight: "1.4",
              color: "#666666",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
              e.target.style.borderColor = "#e6e6e6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fafafa";
              e.target.style.borderColor = "#f0f0f0";
            }}
          >
            {/* Quote indicator line */}
            <div
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                bottom: "0",
                width: "2px",
                backgroundColor: "#1890ff",
                borderRadius: "0 1px 1px 0",
                opacity: "0.6",
              }}
            />

            {/* Quote icon */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "8px",
                fontSize: "14px",
                color: "#d9d9d9",
                fontFamily: "serif",
                fontWeight: "bold",
              }}
            >
              &ldquo;
            </div>

            {part.content}
          </div>
        );
      } else {
        return (
          <div
            key={index}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: part.content.trim() ? "12px" : "0",
              lineHeight: "1.6",
              fontSize: "14px",
              color: "#262626",
            }}
          >
            {part.content}
          </div>
        );
      }
    });
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Content Header */}
      <Flex align="flex-end" justify="flex-end">
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
      </Flex>

      {/* Content Body */}
      <div
        className="email-content-container"
        style={{
          // border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#ffffff",
          padding: isExpanded ? "32px" : "20px",
          minHeight: isExpanded ? "60vh" : "200px",
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
        ) : showRaw ? (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: 'Monaco, "Courier New", monospace',
              fontSize: "13px",
            }}
          >
            {content}
          </div>
        ) : (
          <div>{renderProcessedContent(processContent(content))}</div>
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
