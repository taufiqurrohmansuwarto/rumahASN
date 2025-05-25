import React from "react";
import { Upload, Tag, Typography, message } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AttachmentUploader = ({ attachments, onChange }) => {
  const uploadProps = {
    name: "attachments",
    action: "/api/mail/attachments/upload",
    multiple: true,
    beforeUpload: (file) => {
      const isLt25M = file.size / 1024 / 1024 < 25;
      if (!isLt25M) {
        message.error("File harus lebih kecil dari 25MB!");
      }
      return isLt25M;
    },
    onChange: ({ fileList }) => {
      onChange(fileList);
    },
    fileList: attachments,
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onChange(newAttachments);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Text strong style={{ marginBottom: "8px", display: "block" }}>
        Lampiran
      </Text>

      <Upload.Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <PaperClipOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
        </p>
        <p className="ant-upload-text">
          Klik atau seret file ke area ini untuk upload
        </p>
        <p className="ant-upload-hint">
          Mendukung multiple file. Maksimal 25MB per file.
        </p>
      </Upload.Dragger>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Text strong>File terlampir:</Text>
          <div style={{ marginTop: "8px" }}>
            {attachments.map((file, index) => (
              <Tag
                key={index}
                closable
                style={{ margin: "4px" }}
                onClose={() => handleRemoveAttachment(index)}
              >
                <PaperClipOutlined style={{ marginRight: "4px" }} />
                {file.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
