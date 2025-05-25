import React from "react";
import { Typography, Tag, Space, Avatar, Divider } from "antd";
import { UserOutlined, PaperClipOutlined } from "@ant-design/icons";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Text } = Typography;

const EmailPreview = ({
  subject,
  recipients,
  content,
  attachments = [],
  isMarkdown = false,
}) => {
  const renderRecipientTags = (recipientList) => {
    return recipientList.map((r) => (
      <Tag key={r.value} style={{ margin: "2px" }}>
        <Space>
          <Avatar src={r.user?.image} size="small" icon={<UserOutlined />} />
          {r.label}
        </Space>
      </Tag>
    ));
  };

  return (
    <div
      style={{
        minHeight: "400px",
        padding: "24px",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Email Header */}
      <div style={{ marginBottom: "16px" }}>
        <Text strong>Subjek: </Text>
        <Text>{subject || "Belum ada subjek"}</Text>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Text strong>Kepada: </Text>
        {recipients.to.length > 0 ? (
          renderRecipientTags(recipients.to)
        ) : (
          <Text type="secondary">Belum ada penerima</Text>
        )}
      </div>

      {recipients.cc && recipients.cc.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong>CC: </Text>
          {renderRecipientTags(recipients.cc)}
        </div>
      )}

      {recipients.bcc && recipients.bcc.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong>BCC: </Text>
          {renderRecipientTags(recipients.bcc)}
        </div>
      )}

      <Divider />

      {/* Email Content */}
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "4px",
          border: "1px solid #e8e8e8",
          minHeight: "200px",
        }}
      >
        {content ? (
          isMarkdown ? (
            <ReactMarkdownCustom>{content}</ReactMarkdownCustom>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
          )
        ) : (
          <Text type="secondary" style={{ fontStyle: "italic" }}>
            Belum ada konten pesan
          </Text>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Text strong>Lampiran: </Text>
          <div style={{ marginTop: "8px" }}>
            {attachments.map((file, index) => (
              <Tag key={index} icon={<PaperClipOutlined />}>
                {file.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
