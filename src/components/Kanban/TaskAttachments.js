import { useState } from "react";
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
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  uploadAttachment,
  addLinkAttachment,
  deleteAttachment,
} from "../../../services/kanban.services";

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

function AttachmentItem({ attachment, baseUrl, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const isLink = attachment.attachment_type === "link";
  const fileUrl = isLink
    ? attachment.file_url
    : `${baseUrl}/public/${attachment.file_path}`;

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
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {getFileIcon(attachment.file_type, isLink)}
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
        <Button
          type="text"
          size="small"
          icon={isLink ? <IconExternalLink size={14} /> : <IconDownload size={14} />}
          href={fileUrl}
          target="_blank"
          style={{ height: 24, width: 24, padding: 0 }}
        />
        <Popconfirm
          title="Hapus lampiran?"
          onConfirm={() => onDelete(attachment.id)}
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
  const queryClient = useQueryClient();

  const { mutate: upload, isLoading: isUploading } = useMutation(
    (file) => uploadAttachment({ taskId, file }),
    {
      onSuccess: () => {
        message.success("File berhasil diupload");
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

  const handleUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      upload(file);
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      addLink({ url: linkUrl.trim(), name: linkName.trim() || null });
    }
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
            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {isUploading ? "Mengupload..." : "Drag file atau klik"}
            </Text>
          </Flex>
        </Upload.Dragger>
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
    <div>
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
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              baseUrl={baseUrl}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskAttachments;
