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
    const parts = text.split(/(On .+? wrote:)/);
    const processed = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.match(/On .+? wrote:/)) {
        // This is a quote header
        processed.push({
          type: "quote-header",
          content: part,
        });
      } else if (i > 0 && parts[i - 1]?.match(/On .+? wrote:/)) {
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

  // Custom scrollbar styles
  const scrollbarStyles = {
    scrollbarWidth: "thin",
    scrollbarColor: "#d9d9d9 #f5f5f5",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f5f5f5",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#d9d9d9",
      borderRadius: "4px",
      transition: "background 0.2s ease",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#bfbfbf",
    },
  };

  const renderProcessedContent = (processedParts) => {
    return processedParts.map((part, index) => {
      if (part.type === "quote-header") {
        return (
          <div
            key={index}
            style={{
              color: "#666666",
              fontSize: "13px",
              fontWeight: "500",
              marginTop: index > 0 ? "20px" : "0",
              marginBottom: "8px",
            }}
          >
            {part.content}
          </div>
        );
      } else if (part.type === "quoted") {
        return (
          <div
            key={index}
            style={{
              borderLeft: "3px solid #cccccc",
              paddingLeft: "16px",
              marginLeft: "8px",
              color: "#666666",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: "16px",
            }}
          >
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
              marginBottom: part.content.trim() ? "16px" : "0",
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
          ...(!isExpanded && scrollbarStyles),
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

      {/* CSS untuk custom scrollbar */}
      <style jsx>{`
        .email-content-container::-webkit-scrollbar {
          width: 8px;
        }

        .email-content-container::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
        }

        .email-content-container::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .email-content-container::-webkit-scrollbar-thumb:hover {
          background: #bfbfbf;
        }

        .email-content-container {
          scrollbar-width: thin;
          scrollbar-color: #d9d9d9 #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default EmailContentDisplay;
