import { Stack, Text } from "@mantine/core";
import { Button, Modal } from "antd";
import { isImage, isPdf } from "./utils";

const FilePreviewModal = ({ open, file, onClose }) => {
  if (!file?.url) return null;

  const renderContent = () => {
    if (file.url.startsWith("data:application/pdf")) {
      return (
        <iframe
          src={file.url}
          style={{ width: "100%", height: "70vh", border: "none" }}
          title={file.label}
        />
      );
    }

    if (isImage(file.url)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.url}
          alt={file.label}
          style={{ maxWidth: "100%", maxHeight: "70vh" }}
        />
      );
    }

    if (isPdf(file.url)) {
      return (
        <iframe
          src={file.url}
          style={{ width: "100%", height: "70vh", border: "none" }}
          title={file.label}
        />
      );
    }

    return (
      <Stack align="center" gap="sm">
        <Text size="sm" c="dimmed">
          Preview tidak tersedia
        </Text>
        <Button type="primary" href={file.url} target="_blank">
          Buka File
        </Button>
      </Stack>
    );
  };

  return (
    <Modal
      title={file?.label}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      <div style={{ textAlign: "center" }}>{renderContent()}</div>
    </Modal>
  );
};

export default FilePreviewModal;

