import { useDeleteAttachment } from "@/hooks/useEmails";
import {
  DEFAULT_ALLOWED_TYPES,
  formatFileSize,
  uploadMultipleFiles,
  uploadSingleFile,
  validateFileSize,
  validateFileType,
} from "@/services/rasn-mail.services";
import { Group, Progress, Stack, Text } from "@mantine/core";
import {
  IconCloudUpload,
  IconPaperclip,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Button, Tag, Tooltip, message } from "antd";
import { useRef, useState } from "react";

const AttachmentUploader = ({
  attachments = [],
  onChange,
  maxFiles = 10,
  maxSize = 25,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const deleteAttachment = useDeleteAttachment();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleUpload(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (files) => {
    if (uploading) return;

    const validFiles = files.filter(
      (f) => validateFileSize(f, maxSize) && validateFileType(f, DEFAULT_ALLOWED_TYPES)
    );

      if (validFiles.length === 0) {
      message.error("File tidak valid");
        return;
      }

      if (attachments.length + validFiles.length > maxFiles) {
      message.error(`Max ${maxFiles} file`);
        return;
      }

    try {
      setUploading(true);
      setProgress(0);

      let uploaded = [];
      if (validFiles.length === 1) {
        const res = await uploadSingleFile(validFiles[0], setProgress);
        uploaded = [res.data];
      } else {
        const res = await uploadMultipleFiles(validFiles, setProgress);
        uploaded = res.data?.uploaded || [];
      }

      onChange([...attachments, ...uploaded]);
      message.success(`${uploaded.length} file terunggah`);
    } catch {
      message.error("Gagal upload");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = async (att, idx) => {
    try {
      if (att.id) await deleteAttachment.mutateAsync(att.id);
      onChange(attachments.filter((_, i) => i !== idx));
    } catch {
      message.error("Gagal hapus");
    }
  };

  const isMax = attachments.length >= maxFiles;

  return (
    <Stack gap={6}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={DEFAULT_ALLOWED_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled || isMax || uploading}
      />

      <Group gap="xs">
              <Button
          size="small"
          icon={<IconCloudUpload size={14} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isMax}
          loading={uploading}
        >
          {isMax ? "Penuh" : "Lampiran"}
        </Button>
        <Text size="xs" c="dimmed">
          {attachments.length}/{maxFiles} • Max {maxSize}MB
              </Text>
      </Group>

      {uploading && <Progress value={progress} size="xs" />}

      {attachments.length > 0 && (
        <Group gap={4}>
          {attachments.map((att, idx) => (
            <Tag
              key={att.id || idx}
              closable
              onClose={() => handleRemove(att, idx)}
            >
              <IconPaperclip size={10} style={{ marginRight: 4 }} />
              {att.filename || att.file_name} ({formatFileSize(att.size || att.file_size)})
            </Tag>
          ))}
        </Group>
      )}
    </Stack>
  );
};

export default AttachmentUploader;
