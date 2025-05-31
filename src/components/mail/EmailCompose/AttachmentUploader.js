// src/components/mail/EmailCompose/AttachmentUploader.js
import React, { useState } from "react";
import {
  Upload,
  Button,
  Tag,
  Typography,
  Progress,
  List,
  Space,
  Tooltip,
  Modal,
  Image,
  Empty,
  Alert,
  message,
} from "antd";
import {
  PaperClipOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  InboxOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useAntdUploadProps, useDeleteAttachment } from "@/hooks/useEmails";
import {
  formatFileSize,
  getFileIcon,
  isImageFile,
} from "@/services/rasn-mail.services";

const { Text, Title } = Typography;
const { Dragger } = Upload;

// File icon mapping
const FileIcons = {
  image: <FileImageOutlined style={{ color: "#722ed1" }} />,
  pdf: <FilePdfOutlined style={{ color: "#ff4d4f" }} />,
  word: <FileWordOutlined style={{ color: "#1890ff" }} />,
  excel: <FileExcelOutlined style={{ color: "#52c41a" }} />,
  powerpoint: <FileExcelOutlined style={{ color: "#fa8c16" }} />,
  text: <FileTextOutlined style={{ color: "#8c8c8c" }} />,
  archive: <FileUnknownOutlined style={{ color: "#722ed1" }} />,
  file: <FileUnknownOutlined style={{ color: "#8c8c8c" }} />,
};

const AttachmentUploader = ({
  attachments = [],
  onChange,
  maxFiles = 10,
  maxSize = 25,
  multiple = true,
  showFileList = true,
  disabled = false,
  style = {},
}) => {
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    file: null,
  });
  const [uploadError, setUploadError] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Hooks
  const deleteAttachment = useDeleteAttachment();

  const { uploadProps, uploading, uploadProgress } = useAntdUploadProps({
    multiple,
    maxFiles,
    maxSize,
    disabled,
    onFilesChange: (newFiles) => {
      setUploadError(null);
      // Replace attachments instead of appending to prevent duplicates
      onChange(newFiles);
    },
    onError: (error) => {
      setUploadError(error);
    },
  });

  // Remove attachment
  const handleRemoveAttachment = async (attachment, index) => {
    const attachmentId = attachment.id || `temp-${index}`;

    try {
      // Set loading state for this specific attachment
      setDeletingIds((prev) => new Set([...prev, attachmentId]));

      if (attachment.id) {
        await deleteAttachment.mutateAsync(attachment.id);
      }

      // Remove from attachments array
      const newAttachments = attachments.filter((_, i) => i !== index);
      onChange(newAttachments);
    } catch (error) {
      // Error handled by hook
    } finally {
      // Remove loading state for this attachment
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
    }
  };

  // Preview file
  const handlePreview = (attachment) => {
    setPreviewModal({ visible: true, file: attachment });
  };

  // Download file
  const handleDownload = (attachment) => {
    const fileUrl = attachment.url || attachment.file_url;
    const fileName = attachment.filename || attachment.file_name;

    if (fileUrl) {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank"; // Open in new tab as fallback

      // Set download attribute with filename
      if (fileName) {
        link.download = fileName;
      }

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.error("URL file tidak tersedia");
    }
  };

  // Get file icon
  const getIconForFile = (attachment) => {
    const iconType = getFileIcon(
      attachment.mimetype || attachment.mime_type,
      attachment.filename || attachment.file_name
    );
    return FileIcons[iconType] || FileIcons.file;
  };

  // Check if file can be previewed
  const canPreview = (attachment) => {
    const mimeType = attachment.mimetype || attachment.mime_type;
    return isImageFile(mimeType) || mimeType === "application/pdf";
  };

  // Calculate remaining files
  const remainingFiles = maxFiles - attachments.length;
  const isMaxFiles = attachments.length >= maxFiles;

  return (
    <div style={style}>
      {/* Upload Area */}
      <div
        style={{
          marginBottom: showFileList && attachments.length > 0 ? "16px" : "0",
        }}
      >
        <Dragger
          {...uploadProps}
          disabled={disabled || isMaxFiles || uploading}
          style={{
            backgroundColor: isMaxFiles ? "#f5f5f5" : "#fafafa",
            borderColor: uploadError ? "#ff4d4f" : "#d9d9d9",
          }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              {uploading ? (
                <LoadingOutlined
                  style={{ fontSize: "48px", color: "#1890ff" }}
                />
              ) : (
                <InboxOutlined
                  style={{
                    fontSize: "48px",
                    color: isMaxFiles ? "#d9d9d9" : "#1890ff",
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <Text
                strong
                style={{ color: isMaxFiles ? "#8c8c8c" : "#262626" }}
              >
                {isMaxFiles
                  ? "Maksimal file tercapai"
                  : "Klik atau seret file ke sini untuk upload"}
              </Text>
            </div>

            {!isMaxFiles && (
              <div style={{ marginBottom: "16px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Sisa {remainingFiles} file lagi • Maksimal {maxSize}MB per
                  file
                </Text>
              </div>
            )}

            <div style={{ marginBottom: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Mendukung: PDF, Word, Excel, PowerPoint, Gambar, dan file
                lainnya
              </Text>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div style={{ marginTop: "16px" }}>
                <Progress
                  percent={uploadProgress}
                  size="small"
                  status="active"
                  strokeColor="#1890ff"
                />
                <Text
                  type="secondary"
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  Mengunggah file...
                </Text>
              </div>
            )}
          </div>
        </Dragger>

        {/* Upload Error */}
        {uploadError && (
          <Alert
            message="Error Upload"
            description={uploadError}
            type="error"
            showIcon
            closable
            onClose={() => setUploadError(null)}
            style={{ marginTop: "8px" }}
          />
        )}
      </div>

      {/* File List */}
      {showFileList && attachments.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <Text strong>
              File Terlampir ({attachments.length}/{maxFiles})
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatFileSize(
                attachments.reduce(
                  (total, file) => total + (file.size || file.file_size || 0),
                  0
                )
              )}{" "}
              total
            </Text>
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
                  borderBottom:
                    index === attachments.length - 1
                      ? "none"
                      : "1px solid #f0f0f0",
                }}
                actions={[
                  canPreview(attachment) && (
                    <Tooltip key="preview" title="Preview">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(attachment)}
                      />
                    </Tooltip>
                  ),
                  <Tooltip key="download" title="Download">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                    />
                  </Tooltip>,
                  <Tooltip key="delete" title="Hapus">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveAttachment(attachment, index)}
                      loading={deletingIds.has(
                        attachment.id || `temp-${index}`
                      )}
                      danger
                    />
                  </Tooltip>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getIconForFile(attachment)}
                  title={
                    <Space>
                      <Text strong style={{ fontSize: "14px" }}>
                        {attachment.filename || attachment.file_name}
                      </Text>
                      <Tag size="small" color="blue">
                        {(attachment.mimetype || attachment.mime_type || "")
                          .split("/")[1]
                          ?.toUpperCase() || "FILE"}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space split={<span style={{ color: "#d9d9d9" }}>•</span>}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatFileSize(
                          attachment.size || attachment.file_size
                        )}
                      </Text>
                      {attachment.created_at && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {new Date(attachment.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Empty State */}
      {showFileList && attachments.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Empty
            image={
              <PaperClipOutlined
                style={{ fontSize: "48px", color: "#d9d9d9" }}
              />
            }
            description="Belum ada file yang dilampirkan"
            style={{ margin: 0 }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Seret file ke area di atas atau klik untuk memilih file
            </Text>
          </Empty>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <Text strong>
              {previewModal.file?.filename || previewModal.file?.file_name}
            </Text>
            <Tag color="blue">
              {formatFileSize(
                previewModal.file?.size || previewModal.file?.file_size
              )}
            </Tag>
          </Space>
        }
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, file: null })}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(previewModal.file)}
          >
            Download
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setPreviewModal({ visible: false, file: null })}
          >
            Tutup
          </Button>,
        ]}
        width={800}
        styles={{
          body: { padding: "20px", textAlign: "center" },
        }}
      >
        {previewModal.file && (
          <div>
            {isImageFile(
              previewModal.file.mimetype || previewModal.file.mime_type
            ) ? (
              <Image
                src={previewModal.file.url}
                alt={previewModal.file.filename || previewModal.file.file_name}
                style={{ maxWidth: "100%", maxHeight: "500px" }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4Z+a1qkD4g4gESGhRJWLKHEC3EFJSCXJx0h+AKJNnIgEQUpJnAg3gBtoAiOHnwRJIY0j6i+S4QZMr/iVjafnpbr4LFJ1/z7vnKe73+SkUaGnYHa5AhcRJbMAAAAASUVORK5CYII="
              />
            ) : (
              <div style={{ padding: "40px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                  {getIconForFile(previewModal.file)}
                </div>
                <Text>Preview tidak tersedia untuk tipe file ini</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Klik tombol Download untuk melihat file
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttachmentUploader;
