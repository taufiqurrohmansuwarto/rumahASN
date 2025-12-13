import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Button,
  Typography,
  message,
  Popconfirm,
  Empty,
  Flex,
  Input,
  Tabs,
  Modal,
  Image,
} from "antd";
import {
  IconUpload,
  IconTrash,
  IconFile,
  IconPhoto,
  IconFileText,
  IconDownload,
  IconPaperclip,
  IconLink,
  IconPlus,
  IconExternalLink,
  IconEye,
  IconClipboard,
  IconFileZip,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  uploadAttachment,
  addLinkAttachment,
  deleteAttachment,
} from "../../../services/kanban.services";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const { Text } = Typography;

const getFileIcon = (fileType, isLink) => {
  if (isLink) return <IconLink size={18} color="#722ed1" />;
  if (fileType?.startsWith("image/"))
    return <IconPhoto size={18} color="#1890ff" />;
  if (fileType?.includes("pdf"))
    return <IconFileText size={18} color="#ff4d4f" />;
  return <IconFile size={18} color="#8c8c8c" />;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return null;
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Check if file is an image
const isImageFile = (fileType, filename) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  return (
    fileType?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)
  );
};

// Check if file is PDF
const isPdfFile = (fileType, filename) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  return fileType?.includes("pdf") || ext === "pdf";
};

function AttachmentItem({ attachment, baseUrl, onDelete, onPreview }) {
  const [showActions, setShowActions] = useState(false);
  const isLink = attachment.attachment_type === "link";
  const fileUrl = isLink
    ? attachment.file_url
    : `${baseUrl}/public/${attachment.file_path}`;

  const isImage = isImageFile(attachment.file_type, attachment.filename);
  const isPdf = isPdfFile(attachment.file_type, attachment.filename);

  const handleClick = () => {
    if (isLink) {
      window.open(fileUrl, "_blank");
    } else if (isImage) {
      onPreview?.({ type: "image", url: fileUrl, title: attachment.filename });
    } else if (isPdf) {
      onPreview?.({ type: "pdf", url: fileUrl, title: attachment.filename });
    } else {
      // Download for other files
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = attachment.filename || "download";
      link.click();
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = attachment.filename || "download";
    link.target = "_blank";
    link.click();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        backgroundColor: isLink ? "#f9f0ff" : "#fafafa",
        borderRadius: 8,
        marginBottom: 6,
        border: isLink ? "1px solid #d3adf7" : "1px solid #f0f0f0",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail for images */}
      {isImage && !isLink ? (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={fileUrl}
            alt={attachment.filename}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ) : (
        getFileIcon(attachment.file_type, isLink)
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ fontSize: 13, display: "block" }}
          ellipsis={{ tooltip: attachment.filename || attachment.file_url }}
        >
          {attachment.filename || attachment.file_url}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {isLink ? "Link" : formatFileSize(attachment.file_size)}
          {" • "}
          {dayjs(attachment.created_at).format("DD MMM YYYY")}
        </Text>
      </div>

      <div
        style={{
          opacity: showActions ? 1 : 0,
          transition: "opacity 0.2s",
          display: "flex",
          gap: 4,
        }}
      >
        {/* Preview button for images/PDF */}
        {(isImage || isPdf) && !isLink && (
          <Button
            type="text"
            size="small"
            icon={<IconEye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            style={{ height: 24, width: 24, padding: 0 }}
            title="Lihat"
          />
        )}

        {/* Download/Open button */}
        <Button
          type="text"
          size="small"
          icon={
            isLink ? <IconExternalLink size={14} /> : <IconDownload size={14} />
          }
          onClick={handleDownload}
          style={{ height: 24, width: 24, padding: 0 }}
          title={isLink ? "Buka link" : "Download"}
        />

        {/* Delete button */}
        <Popconfirm
          title="Hapus lampiran?"
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(attachment.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Hapus"
          cancelText="Batal"
          okButtonProps={{ danger: true, size: "small" }}
          cancelButtonProps={{ size: "small" }}
          placement="left"
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<IconTrash size={14} />}
            onClick={(e) => e.stopPropagation()}
            style={{ height: 24, width: 24, padding: 0 }}
          />
        </Popconfirm>
      </div>
    </div>
  );
}

function TaskAttachments({ taskId, attachments }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [activeTab, setActiveTab] = useState("file");
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    type: null,
    url: null,
    title: null,
  });
  const [pastedImage, setPastedImage] = useState(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  // Download all attachments as ZIP (frontend)
  const handleDownloadAll = async () => {
    const fileAttachments = attachments.filter((a) => a.attachment_type !== "link");
    if (fileAttachments.length === 0) {
      message.warning("Tidak ada file untuk didownload");
      return;
    }

    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      let successCount = 0;

      // Download and add each file to zip
      for (const attachment of fileAttachments) {
        try {
          const fileUrl = `${baseUrl}/public/${attachment.file_path}`;
          const response = await fetch(fileUrl);
          
          if (response.ok) {
            const blob = await response.blob();
            zip.file(attachment.filename || `file_${attachment.id}`, blob);
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to fetch ${attachment.filename}:`, err);
        }
      }

      if (successCount === 0) {
        throw new Error("Tidak ada file yang berhasil didownload");
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFilename = `lampiran_${taskId}_${dayjs().format("YYYYMMDD")}.zip`;
      saveAs(zipBlob, zipFilename);
      
      message.success(`${successCount} file berhasil didownload`);
    } catch (error) {
      console.error("Download error:", error);
      message.error(error.message || "Gagal mendownload lampiran");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const { mutate: upload, isLoading: isUploading } = useMutation(
    (file) => uploadAttachment({ taskId, file }),
    {
      onSuccess: () => {
        message.success("File berhasil diupload");
        setPastedImage(null);
        queryClient.invalidateQueries(["kanban-task", taskId]);
      },
      onError: (error) => {
        console.error("Upload error:", error);
        message.error("Gagal mengupload file");
      },
    }
  );

  const { mutate: addLink, isLoading: isAddingLink } = useMutation(
    ({ url, name }) => addLinkAttachment({ taskId, url, name }),
    {
      onSuccess: () => {
        message.success("Link berhasil ditambahkan");
        setLinkUrl("");
        setLinkName("");
        queryClient.invalidateQueries(["kanban-task", taskId]);
      },
      onError: (error) => {
        console.error("Add link error:", error);
        message.error("Gagal menambahkan link");
      },
    }
  );

  const { mutate: remove } = useMutation(
    (attachmentId) => deleteAttachment({ taskId, attachmentId }),
    {
      onSuccess: () => {
        message.success("Lampiran berhasil dihapus");
        queryClient.invalidateQueries(["kanban-task", taskId]);
      },
      onError: () => message.error("Gagal menghapus lampiran"),
    }
  );

  // Handle paste event for images - only when drawer/modal is open
  useEffect(() => {
    const handlePaste = (e) => {
      // Only process if container exists (component is mounted and visible)
      if (!containerRef.current) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            // Generate filename with timestamp
            const ext = file.type.split("/")[1] || "png";
            const timestamp = dayjs().format("YYYYMMDD_HHmmss");
            const newFile = new File([file], `pasted_image_${timestamp}.${ext}`, {
              type: file.type,
            });

            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
              setPastedImage({
                file: newFile,
                preview: event.target.result,
              });
            };
            reader.readAsDataURL(file);

            message.info("Gambar dari clipboard terdeteksi");
            e.preventDefault();
            e.stopPropagation();
            break;
          }
        }
      }
    };

    // Only use document listener
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      upload(file);
    }
  };

  const handleUploadPastedImage = () => {
    if (pastedImage?.file) {
      upload(pastedImage.file);
    }
  };

  const handleCancelPaste = () => {
    setPastedImage(null);
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      addLink({ url: linkUrl.trim(), name: linkName.trim() || null });
    }
  };

  const handlePreview = ({ type, url, title }) => {
    setPreviewModal({ visible: true, type, url, title });
  };

  const closePreview = () => {
    setPreviewModal({ visible: false, type: null, url: null, title: null });
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_MINIO_URL ||
    "https://siasn.bkd.jatimprov.go.id:9000";

  const tabItems = [
    {
      key: "file",
      label: (
        <Flex align="center" gap={4}>
          <IconUpload size={14} />
          <span>Upload File</span>
        </Flex>
      ),
      children: (
        <div>
          {/* Pasted image preview */}
          {pastedImage && (
            <div
              style={{
                marginBottom: 12,
                padding: 12,
                border: "2px dashed #fa541c",
                borderRadius: 8,
                backgroundColor: "#fff7e6",
              }}
            >
              <Flex align="center" gap={12}>
                <img
                  src={pastedImage.preview}
                  alt="Pasted"
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: "block", fontSize: 13 }}>
                    {pastedImage.file.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatFileSize(pastedImage.file.size)} • Dari Clipboard
                  </Text>
                </div>
                <Flex gap={8}>
                  <Button size="small" onClick={handleCancelPaste}>
                    Batal
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleUploadPastedImage}
                    loading={isUploading}
                    style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
                  >
                    Upload
                  </Button>
                </Flex>
              </Flex>
            </div>
          )}

          <Upload.Dragger
            beforeUpload={() => false}
            onChange={handleUpload}
            showUploadList={false}
            disabled={isUploading}
            multiple={false}
            style={{
              border: "1px dashed #d9d9d9",
              backgroundColor: "#fafafa",
              borderRadius: 8,
            }}
          >
            <Flex vertical align="center" gap={4} style={{ padding: "8px 0" }}>
              <IconUpload size={24} color={isUploading ? "#bfbfbf" : "#8c8c8c"} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isUploading ? "Mengupload..." : "Drag file atau klik"}
              </Text>
              <Flex align="center" gap={4}>
                <IconClipboard size={12} color="#bfbfbf" />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  atau Ctrl+V untuk paste gambar
                </Text>
              </Flex>
            </Flex>
          </Upload.Dragger>
        </div>
      ),
    },
    {
      key: "link",
      label: (
        <Flex align="center" gap={4}>
          <IconLink size={14} />
          <span>Tambah Link</span>
        </Flex>
      ),
      children: (
        <Flex vertical gap={8}>
          <Input
            placeholder="URL link (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            prefix={<IconLink size={14} color="#bfbfbf" />}
            size="small"
          />
          <Input
            placeholder="Nama link (opsional)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            size="small"
          />
          <Button
            type="primary"
            size="small"
            icon={<IconPlus size={14} />}
            onClick={handleAddLink}
            loading={isAddingLink}
            disabled={!linkUrl.trim()}
            block
          >
            Tambah Link
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <div ref={containerRef} style={{ padding: "12px 16px 24px 16px" }}>
      {/* Upload/Link Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        style={{ marginBottom: 12 }}
      />

      {/* Attachment List */}
      {attachments.length === 0 ? (
        <Empty
          image={<IconPaperclip size={32} color="#d9d9d9" />}
          imageStyle={{ height: 32 }}
          description={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Belum ada lampiran
            </Text>
          }
          style={{ margin: "16px 0" }}
        />
      ) : (
        <div>
          {/* Download All Button */}
          {attachments.filter((a) => a.attachment_type !== "link").length > 1 && (
            <Flex justify="flex-end" style={{ marginBottom: 8 }}>
              <Button
                type="default"
                size="small"
                icon={<IconFileZip size={14} />}
                onClick={handleDownloadAll}
                loading={isDownloadingAll}
              >
                {isDownloadingAll ? "Mengunduh..." : "Download Semua (.zip)"}
              </Button>
            </Flex>
          )}

          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              baseUrl={baseUrl}
              onDelete={remove}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal
        open={previewModal.visible && previewModal.type === "image"}
        title={previewModal.title || "Preview Gambar"}
        footer={null}
        onCancel={closePreview}
        width={800}
        centered
        styles={{ body: { padding: 0 } }}
      >
        {previewModal.url && (
          <Image
            alt={previewModal.title}
            src={previewModal.url}
            style={{ width: "100%" }}
            preview={false}
          />
        )}
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        open={previewModal.visible && previewModal.type === "pdf"}
        title={previewModal.title || "Preview PDF"}
        footer={
          <Button
            type="primary"
            icon={<IconDownload size={14} />}
            href={previewModal.url}
            download
            style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
          >
            Download PDF
          </Button>
        }
        onCancel={closePreview}
        width={900}
        centered
        styles={{ body: { padding: 0, height: "70vh" } }}
      >
        {previewModal.url && (
          <iframe
            src={previewModal.url}
            style={{
              width: "100%",
              height: "70vh",
              border: "none",
            }}
            title={previewModal.title}
          />
        )}
      </Modal>
    </div>
  );
}

export default TaskAttachments;
