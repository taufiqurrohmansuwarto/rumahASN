import {
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Button, List, Space, Tag, Typography } from "antd";

const { Text, Title } = Typography;

const EmailAttachmentsDisplay = ({ attachments = [] }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Get file icon based on mime type or extension
  const getFileIcon = (mimeType, fileName) => {
    if (!mimeType && fileName) {
      const ext = fileName.split(".").pop().toLowerCase();
      switch (ext) {
        case "pdf":
          return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
        case "doc":
        case "docx":
          return <FileWordOutlined style={{ color: "#1890ff" }} />;
        case "xls":
        case "xlsx":
          return <FileExcelOutlined style={{ color: "#52c41a" }} />;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          return <FileImageOutlined style={{ color: "#722ed1" }} />;
        case "txt":
          return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
        default:
          return <FileUnknownOutlined style={{ color: "#8c8c8c" }} />;
      }
    }

    if (mimeType) {
      if (mimeType.startsWith("image/"))
        return <FileImageOutlined style={{ color: "#722ed1" }} />;
      if (mimeType.includes("pdf"))
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
      if (mimeType.includes("word"))
        return <FileWordOutlined style={{ color: "#1890ff" }} />;
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
        return <FileExcelOutlined style={{ color: "#52c41a" }} />;
      if (mimeType.includes("text"))
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }

    return <FileUnknownOutlined style={{ color: "#8c8c8c" }} />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (attachment) => {
    if (attachment.file_url) {
      window.open(attachment.file_url, "_blank");
    }
  };

  const handlePreview = (attachment) => {
    // Basic preview - open in new tab
    if (attachment.file_url) {
      window.open(attachment.file_url, "_blank");
    }
  };

  const isPreviewable = (mimeType) => {
    if (!mimeType) return false;
    return (
      mimeType.startsWith("image/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("text/")
    );
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <PaperClipOutlined style={{ marginRight: "8px", fontSize: "16px" }} />
        <Text strong>Lampiran ({attachments.length})</Text>
      </div>

      <List
        size="small"
        bordered
        dataSource={attachments}
        renderItem={(attachment, index) => (
          <List.Item
            key={attachment.id || index}
            style={{
              padding: "12px 16px",
              backgroundColor: "#fafafa",
            }}
            actions={[
              isPreviewable(attachment.mime_type) && (
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(attachment)}
                  title="Preview"
                />
              ),
              <Button
                key={attachment.id || index}
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(attachment)}
                title="Download"
              />,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getFileIcon(attachment.mime_type, attachment.file_name)}
              title={
                <Space>
                  <Text strong style={{ fontSize: "14px" }}>
                    {attachment.file_name}
                  </Text>
                  {attachment.mime_type && (
                    <Tag size="small" color="blue">
                      {attachment.mime_type.split("/")[1]?.toUpperCase()}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {formatFileSize(attachment.file_size)}
                  {attachment.created_at && (
                    <span style={{ marginLeft: "12px" }}>
                      Dilampirkan{" "}
                      {new Date(attachment.created_at).toLocaleDateString()}
                    </span>
                  )}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default EmailAttachmentsDisplay;
