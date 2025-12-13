import { Upload, message, Progress } from "antd";
import { ActionIcon, Text, Group, Paper, Stack } from "@mantine/core";
import { IconPaperclip, IconX, IconFile, IconPhoto, IconVideo, IconMusic } from "@tabler/icons-react";
import { useState } from "react";
import { uploadChatFile, formatFileSize } from "@/services/rasn-chat.services";

const getFileIcon = (type) => {
  if (type?.startsWith("image/")) return <IconPhoto size={16} />;
  if (type?.startsWith("video/")) return <IconVideo size={16} />;
  if (type?.startsWith("audio/")) return <IconMusic size={16} />;
  return <IconFile size={16} />;
};

const FileUploader = ({ onUpload, maxFiles = 5, maxSize = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState([]);

  const beforeUpload = async (file) => {
    // Check file size (MB)
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`File terlalu besar. Maksimal ${maxSize}MB`);
      return Upload.LIST_IGNORE;
    }

    // Check max files
    if (pendingFiles.length >= maxFiles) {
      message.error(`Maksimal ${maxFiles} file`);
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      setProgress(0);

      const result = await uploadChatFile(file, (p) => setProgress(p));

      setPendingFiles((prev) => [
        ...prev,
        {
          id: result.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.url,
        },
      ]);

      onUpload?.(result);
    } catch (error) {
      message.error("Gagal upload file");
    } finally {
      setUploading(false);
      setProgress(0);
    }

    return Upload.LIST_IGNORE;
  };

  const removeFile = (fileId) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        multiple
        disabled={uploading}
      >
        <ActionIcon variant="subtle" loading={uploading} title="Lampirkan file">
          <IconPaperclip size={18} />
        </ActionIcon>
      </Upload>

      {uploading && (
        <Progress percent={progress} size="small" style={{ width: 100, marginTop: 4 }} />
      )}

      {pendingFiles.length > 0 && (
        <Stack gap={4} mt="xs">
          {pendingFiles.map((file) => (
            <Paper key={file.id} withBorder p={4}>
              <Group gap="xs" justify="space-between">
                <Group gap="xs">
                  {getFileIcon(file.type)}
                  <div>
                    <Text size="xs" lineClamp={1}>{file.name}</Text>
                    <Text size="xs" c="dimmed">{formatFileSize(file.size)}</Text>
                  </div>
                </Group>
                <ActionIcon size="xs" variant="subtle" onClick={() => removeFile(file.id)}>
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </div>
  );
};

export default FileUploader;

