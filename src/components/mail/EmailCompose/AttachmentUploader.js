// src/components/mail/EmailCompose/AttachmentUploader.js
import React, { useState, useRef } from "react";
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
  Card,
  Divider,
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
  UploadOutlined,
  PlusOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useDeleteAttachment } from "@/hooks/useEmails";
import {
  formatFileSize,
  getFileIcon,
  isImageFile,
  uploadSingleFile,
  uploadMultipleFiles,
  validateFileSize,
  validateFileType,
  DEFAULT_ALLOWED_TYPES,
} from "@/services/rasn-mail.services";
import { debugUploadState } from "@/utils/debugUpload";

const { Text, Title } = Typography;
const { Dragger } = Upload;

// Modern file icon mapping with better colors
const FileIcons = {
  image: <FileImageOutlined style={{ color: "#52c41a", fontSize: "20px" }} />,
  pdf: <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: "20px" }} />,
  word: <FileWordOutlined style={{ color: "#1890ff", fontSize: "20px" }} />,
  excel: <FileExcelOutlined style={{ color: "#52c41a", fontSize: "20px" }} />,
  powerpoint: (
    <FileExcelOutlined style={{ color: "#fa8c16", fontSize: "20px" }} />
  ),
  text: <FileTextOutlined style={{ color: "#722ed1", fontSize: "20px" }} />,
  archive: (
    <FileUnknownOutlined style={{ color: "#722ed1", fontSize: "20px" }} />
  ),
  file: <FileUnknownOutlined style={{ color: "#8c8c8c", fontSize: "20px" }} />,
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ FIXED: Use hidden file input instead of Antd Upload
  const fileInputRef = useRef(null);

  // Hooks
  const deleteAttachment = useDeleteAttachment();

  // ✅ FIXED: Direct file input handler - no Antd Upload conflicts
  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ FIXED: Upload handler yang benar
  const handleFileUpload = async (fileList) => {
    if (uploading) return;

    debugUploadState.logFileUpload("UPLOAD_START", {
      fileCount: fileList.length,
      currentAttachments: attachments.length,
      files: fileList.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    });

    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // ✅ FIXED: Validasi semua file dulu
      const validFiles = [];
      const errors = [];

      fileList.forEach((file) => {
        if (!validateFileSize(file, maxSize)) {
          errors.push(`${file.name}: File terlalu besar (max ${maxSize}MB)`);
        } else if (!validateFileType(file, DEFAULT_ALLOWED_TYPES)) {
          errors.push(`${file.name}: Tipe file tidak didukung`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        debugUploadState.logFileUpload("VALIDATION_ERROR", { errors });
        setUploadError(errors.join("\n"));
        return;
      }

      if (validFiles.length === 0) {
        debugUploadState.logFileUpload("NO_VALID_FILES", {});
        setUploadError("Tidak ada file valid untuk di-upload");
        return;
      }

      // ✅ FIXED: Check total files limit
      if (attachments.length + validFiles.length > maxFiles) {
        const errorMsg = `Maksimal ${maxFiles} file. Saat ini: ${attachments.length}, akan ditambah: ${validFiles.length}`;
        debugUploadState.logFileUpload("FILE_LIMIT_ERROR", { errorMsg });
        setUploadError(errorMsg);
        return;
      }

      let uploadedFiles = [];

      // ✅ FIXED: Handle single vs multiple upload
      if (validFiles.length === 1) {
        debugUploadState.logFileUpload("SINGLE_UPLOAD_START", {
          file: validFiles[0].name,
          fileSize: validFiles[0].size,
          fileType: validFiles[0].type,
        });

        try {
          console.log("🚀 Calling uploadSingleFile with:", {
            fileName: validFiles[0].name,
            fileSize: validFiles[0].size,
            fileType: validFiles[0].type,
            file: validFiles[0],
          });

          // Single file upload
          const result = await uploadSingleFile(validFiles[0], (progress) => {
            console.log("📊 Upload progress:", progress);
            setUploadProgress(progress);
          });

          console.log("✅ uploadSingleFile response:", result);

          uploadedFiles = [result.data];
          debugUploadState.logFileUpload("SINGLE_UPLOAD_SUCCESS", {
            result: result.data,
          });
        } catch (uploadError) {
          console.error("💥 uploadSingleFile error details:", {
            error: uploadError,
            message: uploadError.message,
            response: uploadError.response,
            status: uploadError.response?.status,
            statusText: uploadError.response?.statusText,
            data: uploadError.response?.data,
            stack: uploadError.stack,
          });
          throw uploadError;
        }
      } else {
        debugUploadState.logFileUpload("MULTIPLE_UPLOAD_START", {
          fileCount: validFiles.length,
        });
        // Multiple files upload
        const result = await uploadMultipleFiles(validFiles, setUploadProgress);
        uploadedFiles = result.data?.uploaded || [];
        debugUploadState.logFileUpload("MULTIPLE_UPLOAD_SUCCESS", {
          uploadedCount: uploadedFiles.length,
          result: result.data,
        });
      }

      // ✅ FIXED: Append ke existing attachments dengan validation
      debugUploadState.logAttachmentChange("BEFORE_ONCHANGE", attachments, {
        action: "upload",
        adding: uploadedFiles.length,
      });

      const newAttachments = [...attachments, ...uploadedFiles];
      onChange(newAttachments);

      debugUploadState.logAttachmentChange("AFTER_ONCHANGE", newAttachments, {
        action: "upload",
        added: uploadedFiles.length,
      });

      message.success(`${uploadedFiles.length} file berhasil diunggah`);
    } catch (error) {
      console.error("Upload error:", error);
      debugUploadState.logFileUpload("UPLOAD_ERROR", {
        error: error.message,
        fullError: error,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengunggah file";
      setUploadError(errorMessage);
      message.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ✅ FIXED: Remove attachment handler dengan logging
  const handleRemoveAttachment = async (attachment, index) => {
    const attachmentId = attachment.id || `temp-${index}`;

    debugUploadState.logAttachmentChange("BEFORE_DELETE", attachments, {
      action: "delete",
      targetIndex: index,
      targetId: attachmentId,
    });

    try {
      setDeletingIds((prev) => new Set([...prev, attachmentId]));

      // Delete from server if it has an ID
      if (attachment.id) {
        await deleteAttachment.mutateAsync(attachment.id);
      }

      // ✅ FIXED: Remove dari array dengan benar
      const newAttachments = attachments.filter((_, i) => i !== index);

      debugUploadState.logAttachmentChange(
        "BEFORE_ONCHANGE_DELETE",
        attachments,
        {
          action: "delete",
          newLength: newAttachments.length,
        }
      );

      onChange(newAttachments);

      debugUploadState.logAttachmentChange(
        "AFTER_ONCHANGE_DELETE",
        newAttachments,
        {
          action: "delete",
          deletedIndex: index,
        }
      );

      message.success("File berhasil dihapus");
    } catch (error) {
      console.error("Delete error:", error);
      debugUploadState.logFileUpload("DELETE_ERROR", {
        error: error.message,
        attachmentId,
        index,
      });
      message.error("Gagal menghapus file");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
    }
  };

  // ✅ FIXED: Click handler untuk trigger file input
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ✅ FIXED: Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
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
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      if (fileName) {
        link.download = fileName;
      }
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
      attachment?.mimetype || attachment?.mime_type,
      attachment?.filename || attachment?.file_name
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
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={DEFAULT_ALLOWED_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
        disabled={disabled || isMaxFiles || uploading}
      />

      {/* Modern Upload Area */}
      <div
        style={{
          marginBottom: showFileList && attachments.length > 0 ? "24px" : "0",
        }}
      >
        <div
          style={{
            border: uploadError ? "2px dashed #ff7875" : "2px dashed #e8e8e8",
            borderRadius: "12px",
            padding: "32px 24px",
            textAlign: "center",
            backgroundColor: isMaxFiles ? "#fafafa" : "#fbfbfb",
            cursor:
              disabled || isMaxFiles || uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={
            !disabled && !isMaxFiles && !uploading
              ? handleUploadClick
              : undefined
          }
          onDragOver={handleDragOver}
          onDrop={
            !disabled && !isMaxFiles && !uploading ? handleDrop : undefined
          }
          onMouseEnter={(e) => {
            if (!disabled && !isMaxFiles && !uploading) {
              e.target.style.borderColor = "#1677ff";
              e.target.style.backgroundColor = "#f6f9ff";
              e.target.style.boxShadow = "0 2px 8px rgba(22, 119, 255, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isMaxFiles && !uploading) {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.backgroundColor = "#fbfbfb";
              e.target.style.boxShadow = "none";
            }
          }}
        >
          {/* Icon */}
          <div style={{ marginBottom: "16px" }}>
            {uploading ? (
              <LoadingOutlined
                style={{
                  fontSize: "32px",
                  color: "#1677ff",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <CloudUploadOutlined
                style={{
                  fontSize: "32px",
                  color: isMaxFiles ? "#bfbfbf" : "#1677ff",
                  transition: "color 0.2s",
                }}
              />
            )}
          </div>

          {/* Main Text */}
          <div style={{ marginBottom: "8px" }}>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: isMaxFiles ? "#8c8c8c" : "#262626",
                lineHeight: 1.5,
              }}
            >
              {isMaxFiles
                ? "Maksimal file tercapai"
                : uploading
                ? "Sedang mengunggah..."
                : "Tarik & lepas file di sini"}
            </Text>
          </div>

          {/* Secondary Text */}
          {!isMaxFiles && !uploading && (
            <div style={{ marginBottom: "20px" }}>
              <Text
                type="secondary"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.4,
                }}
              >
                atau klik untuk memilih file
              </Text>
            </div>
          )}

          {/* File Limits Info */}
          <div style={{ marginBottom: uploading ? "0" : "16px" }}>
            <Space
              split={<span style={{ color: "#d9d9d9" }}>•</span>}
              size="small"
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {isMaxFiles
                  ? "Tidak bisa menambah lagi"
                  : `Sisa ${remainingFiles} file`}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Maks {maxSize}MB per file
              </Text>
            </Space>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginTop: "20px" }}>
              <Progress
                percent={uploadProgress}
                size="small"
                strokeColor={{
                  "0%": "#1677ff",
                  "100%": "#52c41a",
                }}
                trailColor="#f0f0f0"
                strokeWidth={6}
                style={{ marginBottom: "12px" }}
              />
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {uploadProgress}% selesai
              </Text>
            </div>
          )}

          {/* Alternative Button */}
          {!uploading && (
            <div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
                disabled={disabled || isMaxFiles}
                style={{
                  borderRadius: "8px",
                  height: "36px",
                  paddingInline: "20px",
                  fontWeight: 500,
                }}
              >
                {isMaxFiles ? "Penuh" : "Pilih File"}
              </Button>
            </div>
          )}
        </div>

        {/* Upload Error */}
        {uploadError && (
          <Alert
            message="Gagal Upload"
            description={uploadError}
            type="error"
            showIcon
            closable
            onClose={() => setUploadError(null)}
            style={{
              marginTop: "16px",
              borderRadius: "8px",
              border: "1px solid #ffccc7",
            }}
          />
        )}
      </div>

      {/* Modern File List */}
      {showFileList && attachments.length > 0 && (
        <Card
          size="small"
          style={{
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Space align="center">
              <PaperClipOutlined style={{ color: "#1677ff" }} />
              <Text strong style={{ fontSize: "14px" }}>
                File Terlampir
              </Text>
              <Tag
                color="blue"
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {attachments.length}/{maxFiles}
              </Tag>
            </Space>
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

          {/* File Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {attachments.map((attachment, index) => (
              <div
                key={attachment.id || `file-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#fafafa",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f0f8ff";
                  e.target.style.borderColor = "#d6e4ff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fafafa";
                  e.target.style.borderColor = "#f0f0f0";
                }}
              >
                {/* File Icon */}
                <div
                  style={{
                    marginRight: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getIconForFile(attachment)}
                </div>

                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: "14px",
                        color: "#262626",
                        marginRight: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "200px",
                      }}
                    >
                      {attachment.filename ||
                        attachment.file_name ||
                        `File ${index + 1}`}
                    </Text>
                    <Tag
                      size="small"
                      style={{
                        fontSize: "10px",
                        borderRadius: "4px",
                        fontWeight: 500,
                        backgroundColor: "#f6f9ff",
                        color: "#1677ff",
                        border: "1px solid #d6e4ff",
                      }}
                    >
                      {(attachment.mimetype || attachment.mime_type || "")
                        .split("/")[1]
                        ?.toUpperCase() || "FILE"}
                    </Tag>
                  </div>

                  <Space
                    split={<span style={{ color: "#d9d9d9" }}>•</span>}
                    size="small"
                  >
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {formatFileSize(
                        attachment.size || attachment.file_size || 0
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
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "4px", marginLeft: "12px" }}
                >
                  {canPreview(attachment) && (
                    <Tooltip title="Preview">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(attachment)}
                        style={{
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="Download">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                      style={{
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveAttachment(attachment, index)}
                      loading={deletingIds.has(
                        attachment.id || `temp-${index}`
                      )}
                      danger
                      style={{
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modern Empty State */}
      {showFileList && attachments.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "#fafafa",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <PaperClipOutlined style={{ fontSize: "32px", color: "#d9d9d9" }} />
          </div>
          <Text
            style={{
              fontSize: "14px",
              color: "#8c8c8c",
              fontWeight: 500,
              marginBottom: "8px",
              display: "block",
            }}
          >
            Belum ada file yang dilampirkan
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Tarik file ke area di atas atau klik untuk memilih
          </Text>
        </div>
      )}

      {/* Modern Preview Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {getIconForFile(previewModal.file)}
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                {previewModal.file?.filename || previewModal.file?.file_name}
              </Text>
              <div style={{ marginTop: "4px" }}>
                <Tag
                  color="blue"
                  style={{
                    fontSize: "11px",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {formatFileSize(
                    previewModal.file?.size || previewModal.file?.file_size
                  )}
                </Tag>
              </div>
            </div>
          </div>
        }
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, file: null })}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(previewModal.file)}
            style={{ borderRadius: "8px" }}
          >
            Download
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setPreviewModal({ visible: false, file: null })}
            style={{ borderRadius: "8px" }}
          >
            Tutup
          </Button>,
        ]}
        width={800}
        style={{ borderRadius: "12px" }}
        styles={{
          body: { padding: "24px", textAlign: "center" },
          header: { borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" },
        }}
      >
        {previewModal.file && (
          <div>
            {isImageFile(
              previewModal.file.mimetype || previewModal.file.mime_type
            ) ? (
              <Image
                src={previewModal.file.url || previewModal.file.file_url}
                alt={previewModal.file.filename || previewModal.file.file_name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  borderRadius: "8px",
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4Z+a1qkD4g4gESGhRJWLKHEC3EFJSCXJx0h+AKJNnIgEQUpJnAg3gBtoAiOHnwRJIY0j6i+S4QZMr/iVjafnpbr4LFJ1/z7vnKe73+SkUaGnYHa5AhcRJbMAAAAASUVORK5CYII="
              />
            ) : (
              <div style={{ padding: "60px 40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                  {getIconForFile(previewModal.file)}
                </div>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Preview tidak tersedia
                </Text>
                <Text type="secondary" style={{ fontSize: "14px" }}>
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
