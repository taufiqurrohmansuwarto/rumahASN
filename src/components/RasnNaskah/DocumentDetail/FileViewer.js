import { Stack, Text } from "@mantine/core";
import { IconFile, IconDownload } from "@tabler/icons-react";
import { Button, Empty } from "antd";

/**
 * FileViewer - Supports PDF, DOCX, images
 */
const FileViewer = ({ url, fileType, fileName }) => {
  if (!url) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Empty
          description="Tidak ada file"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Get file extension from URL or fileType
  const getFileExtension = () => {
    if (fileType) {
      if (fileType.includes("pdf")) return "pdf";
      if (fileType.includes("word") || fileType.includes("document"))
        return "docx";
      if (fileType.includes("image")) return "image";
      if (fileType.includes("sheet") || fileType.includes("excel"))
        return "xlsx";
    }
    const ext = url.split(".").pop()?.toLowerCase()?.split("?")[0];
    return ext || "unknown";
  };

  const extension = getFileExtension();

  // PDF - use iframe embed
  if (extension === "pdf") {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 8,
        }}
        title="PDF Preview"
      />
    );
  }

  // Images - display directly
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension) ||
    extension === "image"
  ) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          borderRadius: 8,
          overflow: "auto",
          padding: 16,
        }}
      >
        <img
          src={url}
          alt={fileName || "Document"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 4,
          }}
        />
      </div>
    );
  }

  // DOCX, XLSX, PPTX - use Microsoft Office Online viewer
  if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(extension)) {
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url
    )}`;

    return (
      <Stack gap={0} style={{ height: "100%" }}>
        <iframe
          src={officeViewerUrl}
          style={{
            width: "100%",
            flex: 1,
            border: "none",
            borderRadius: 8,
          }}
          title="Document Preview"
        />
        <div
          style={{
            padding: "8px 12px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text size="xs" c="dimmed">
            Preview menggunakan Microsoft Office Online
          </Text>
          <Button
            size="small"
            type="link"
            icon={<IconDownload size={14} />}
            onClick={() => window.open(url, "_blank")}
          >
            Download
          </Button>
        </div>
      </Stack>
    );
  }

  // Unknown file type - show download option
  return (
    <Stack
      align="center"
      justify="center"
      style={{
        height: "100%",
        background: "#fafafa",
        borderRadius: 8,
        padding: 24,
      }}
    >
      <IconFile size={48} color="#bfbfbf" />
      <Text c="dimmed" mt={12} mb={16}>
        Preview tidak tersedia untuk tipe file ini
      </Text>
      <Button
        icon={<IconDownload size={14} />}
        onClick={() => window.open(url, "_blank")}
      >
        Download File
      </Button>
    </Stack>
  );
};

export default FileViewer;
