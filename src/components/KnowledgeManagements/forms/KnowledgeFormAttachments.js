import {
  uploadKnowledgeContentAttachment,
  uploadMultipleKnowledgeContentAttachments,
} from "@/services/knowledge-management.services";
import {
  QuestionCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  message,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { useEffect, useCallback } from "react";

const { Text } = Typography;

const KnowledgeFormAttachments = ({
  isMobile,
  fileList,
  setFileList,
  contentId = null, // Will be provided when editing existing content
  revisionId = null, // For revision uploads
  uploadMutation = null, // New upload mutation hook
  onGetPendingFiles = null, // Callback to pass pending files to parent
  onDeleteFile = null, // Callback to handle file deletion
  deletingAttachmentIds = new Set(), // Set of attachment IDs being deleted
}) => {
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle file removal
  const handleRemove = async (file) => {
    // Get file ID from various possible sources, prioritizing 'id' over 'uid'
    const fileId = file.response?.data?.id || file.response?.data?.uid || file.uid;
    
    console.log("handleRemove called with file:", {
      file,
      fileId,
      fileUid: file.uid,
      responseData: file.response?.data,
      hasResponse: !!file.response?.data,
      hasDeleteCallback: !!onDeleteFile,
      isTemporary: file.response?.data?.isTemporary
    });
    
    // If file is uploaded (not temporary) and onDeleteFile callback exists and we have a valid fileId
    if (file.response?.data && onDeleteFile && fileId && !file.response.data.isTemporary) {
      // For uploaded files, delegate to parent component
      // Parent will handle loading state and list removal
      await onDeleteFile(fileId);
      return false; // Don't remove from UI here, parent will handle it
    }
    
    // Allow immediate removal for temporary files or when no callback
    return true;
  };

  // Get pending files for batch upload (kept for compatibility)
  const getPendingFiles = useCallback(() => {
    return fileList
      .filter((file) => file.response?.data?.isTemporary)
      .map((file) => file.response.data.file);
  }, [fileList]);

  // Expose pending files to parent component
  useEffect(() => {
    if (onGetPendingFiles) {
      const pendingFiles = getPendingFiles();
      onGetPendingFiles(pendingFiles);
    }
  }, [fileList, onGetPendingFiles, getPendingFiles]);

  const customUpload = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      // Show upload progress immediately
      onProgress({ percent: 10 });

      if (uploadMutation && contentId && revisionId) {
        // Mode revision - upload immediately untuk show individual success
        onProgress({ percent: 50 });

        const formData = new FormData();
        formData.append("files", file);

        const response = await uploadMutation.mutateAsync({
          contentId,
          versionId: revisionId,
          data: formData,
        });

        onProgress({ percent: 100 });

        if (response?.success && response?.data?.attachments?.length > 0) {
          const uploadedFile = response.data.attachments[0];
          onSuccess(
            {
              success: true,
              data: {
                uid: uploadedFile.id,
                id: uploadedFile.id,
                url: uploadedFile.url,
                filename: uploadedFile.name,
                name: uploadedFile.name,
                size: uploadedFile.size,
                mimetype: uploadedFile.mime,
                mime: uploadedFile.mime,
                status: "done",
              },
            },
            file
          );
          message.success(`${file.name} berhasil diupload`);
        } else {
          throw new Error("Upload gagal: Format response tidak valid");
        }
      } else if (contentId) {
        // Mode edit - upload immediately using old service
        onProgress({ percent: 50 });

        const formData = new FormData();
        formData.append("files", file);

        const response = await uploadKnowledgeContentAttachment(
          contentId,
          formData
        );

        onProgress({ percent: 100 });

        if (response?.success && response?.data?.length > 0) {
          const uploadedFile = response.data[0];

          onSuccess(
            {
              success: true,
              data: {
                uid: uploadedFile.id || uploadedFile.uid, // Use id first, then uid as fallback
                id: uploadedFile.id || uploadedFile.uid,  // Add id field for consistency
                url: uploadedFile.url,
                filename: uploadedFile.filename || uploadedFile.name,
                size: uploadedFile.size || uploadedFile.file_size,
                mime: uploadedFile.mimetype || uploadedFile.file_type,
                mimetype: uploadedFile.mimetype || uploadedFile.file_type,
                status: "done",
                isTemporary: false, // Mark as permanent since it's uploaded immediately
              },
            },
            file
          );
          message.success(`${file.name} berhasil diupload`);
        } else {
          throw new Error("Upload gagal: Format response tidak valid");
        }
      } else {
        // Mode create - store file untuk upload nanti saat submit form
        onProgress({ percent: 100 });
        onSuccess(
          {
            data: {
              uid: `temp-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 11)}`,
              file: file,
              url: URL.createObjectURL(file),
              filename: file.name,
              mimetype: file.type,
              size: file.size,
              status: "done",
              isTemporary: true,
            },
          },
          file
        );
      }
    } catch (error) {
      onProgress({ percent: 0 });
      message.error(`Upload gagal: ${error.message}`);
      onError(error);
    }
  };

  // Batch upload semua pending files sekaligus
  const handleBatchUpload = async () => {
    if (!contentId) return;

    const pendingFiles = fileList
      .filter((file) => file.response?.data?.isTemporary)
      .map((file) => file.response.data.file);

    if (pendingFiles.length === 0) return;

    try {
      const response = await uploadMultipleKnowledgeContentAttachments(
        contentId,
        pendingFiles
      );

      if (response?.success && response?.data) {
        // Update fileList dengan uploaded files
        const updatedFileList = fileList.map((file) => {
          if (file.response?.data?.isTemporary) {
            const uploadedFile = response.data.find(
              (uploaded) => uploaded.name === file.response.data.filename
            );
            if (uploadedFile) {
              return {
                ...file,
                response: {
                  success: true,
                  data: {
                    ...uploadedFile,
                    isTemporary: false,
                  },
                },
              };
            }
          }
          return file;
        });

        setFileList(updatedFileList);
      }
    } catch (error) {
      message.error(`Batch upload gagal: ${error.message}`);
    }
  };

  // Custom render for file items with individual loading states
  const customItemRender = (originNode, file) => {
    // Prioritize 'id' field over 'uid' for consistency with handleRemove
    const fileId = file.response?.data?.id || file.response?.data?.uid || file.uid;
    const isDeleting = fileId && deletingAttachmentIds.has(String(fileId));
    const isRemoving = file.status === "removing";

    if (isDeleting || isRemoving) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#fff2e8",
            border: "1px dashed #ff4500",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <LoadingOutlined style={{ color: "#ff4500", marginRight: "8px" }} />
          <Text style={{ color: "#ff4500" }}>Menghapus {file.name}...</Text>
        </div>
      );
    }

    return originNode;
  };

  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text strong style={{ fontSize: isMobile ? "13px" : "14px" }}>
            📎 Lampiran
          </Text>
          <Tooltip
            title="Upload maksimal 5 file pendukung. Setiap file maksimal 10MB."
            placement="top"
          >
            <QuestionCircleOutlined
              style={{
                color: "#FF4500",
                fontSize: "12px",
                cursor: "help",
              }}
            />
          </Tooltip>
        </Flex>
      }
      style={{ marginBottom: isMobile ? "16px" : "20px" }}
    >
      <Upload
        customRequest={customUpload}
        fileList={fileList}
        onChange={handleUploadChange}
        onRemove={handleRemove}
        itemRender={customItemRender}
        multiple={true}
        maxCount={5}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
        beforeUpload={(file) => {
          const isLt10M = file.size / 1024 / 1024 < 10;
          if (!isLt10M) {
            message.error("File harus kurang dari 10MB!");
          }
          return isLt10M;
        }}
      >
        <Button
          icon={<UploadOutlined />}
          style={{
            borderColor: "#FF4500",
            color: "#FF4500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff2e8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Upload Files (Max 5)
        </Button>
      </Upload>

      {/* Show batch upload button for pending files in edit mode */}
      {contentId && fileList.some((f) => f.response?.data?.isTemporary) && (
        <Button
          type="link"
          onClick={handleBatchUpload}
          style={{ color: "#FF4500", marginTop: 8 }}
        >
          Upload Semua File Pending
        </Button>
      )}
    </Form.Item>
  );
};

export default KnowledgeFormAttachments;
