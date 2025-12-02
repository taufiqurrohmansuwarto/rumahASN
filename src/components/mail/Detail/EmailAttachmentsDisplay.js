import { ActionIcon, Group, Text } from "@mantine/core";
import {
  IconDownload,
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
} from "@tabler/icons-react";
import { Tag, Tooltip } from "antd";

const EmailAttachmentsDisplay = ({ attachments = [] }) => {
  if (!attachments || attachments.length === 0) return null;

  const getFileIcon = (mimeType, fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return <IconPhoto size={14} style={{ color: "#7950f2" }} />;
    }
    if (mimeType?.includes("pdf") || ext === "pdf") {
      return <IconFileTypePdf size={14} style={{ color: "#fa5252" }} />;
    }
    if (mimeType?.includes("word") || ["doc", "docx"].includes(ext)) {
      return <IconFileText size={14} style={{ color: "#228be6" }} />;
    }
    if (mimeType?.includes("excel") || ["xls", "xlsx"].includes(ext)) {
      return <IconFileSpreadsheet size={14} style={{ color: "#40c057" }} />;
    }
    return <IconFile size={14} style={{ color: "#868e96" }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const handleDownload = (attachment) => {
    if (attachment.file_url) {
      window.open(attachment.file_url, "_blank");
    }
  };

  return (
    <Group gap={6}>
      {attachments.map((attachment, index) => (
        <Tag
          key={attachment.id || index}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          onClick={() => handleDownload(attachment)}
        >
          {getFileIcon(attachment.mime_type, attachment.file_name)}
          <Text size="xs" truncate style={{ maxWidth: 120 }}>
            {attachment.file_name}
          </Text>
          <Text size="xs" c="dimmed">
            {formatFileSize(attachment.file_size)}
          </Text>
          <Tooltip title="Unduh">
            <ActionIcon variant="subtle" size="xs">
              <IconDownload size={12} />
            </ActionIcon>
          </Tooltip>
        </Tag>
      ))}
    </Group>
  );
};

export default EmailAttachmentsDisplay;
