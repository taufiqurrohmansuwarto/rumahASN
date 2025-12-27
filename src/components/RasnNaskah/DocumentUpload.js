import { useState } from "react";
import {
  Upload,
  Button,
  Card,
  Typography,
  Space,
  Progress,
  message,
  Alert,
  Flex,
  theme,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconUpload,
  IconFileText,
  IconFileTypePdf,
  IconFileTypeDocx,
  IconFileTypeXls,
  IconPhoto,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { uploadDocument } from "@/services/rasn-naskah.services";
import { useRouter } from "next/router";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const fileTypeIcons = {
  pdf: <IconFileTypePdf size={32} color="#ff4d4f" />,
  docx: <IconFileTypeDocx size={32} color="#1890ff" />,
  xlsx: <IconFileTypeXls size={32} color="#52c41a" />,
  image: <IconPhoto size={32} color="#722ed1" />,
  default: <IconFileText size={32} color="#8c8c8c" />,
};

const getFileIcon = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return fileTypeIcons.pdf;
  if (["doc", "docx"].includes(ext)) return fileTypeIcons.docx;
  if (["xls", "xlsx"].includes(ext)) return fileTypeIcons.xlsx;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return fileTypeIcons.image;
  return fileTypeIcons.default;
};

function DocumentUpload({ onSuccess }) {
  const router = useRouter();
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleViewDocument = (data) => {
    if (onSuccess) {
      onSuccess(data);
    } else if (data?.document?.id) {
      router.push(`/rasn-naskah/documents/${data.document.id}`);
    }
  };

  const uploadMutation = useMutation(uploadDocument, {
    onSuccess: (data) => {
      message.success("Dokumen berhasil diupload!");
      queryClient.invalidateQueries(["rasn-naskah-documents"]);
      setUploadedFile(data);
      onSuccess?.(data);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal mengupload dokumen");
      setUploadProgress(0);
    },
  });

  const handleUpload = async ({ file, onProgress }) => {
    setUploadProgress(0);
    setUploadedFile(null);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadProgress(100);
    } finally {
      clearInterval(interval);
    }
  };

  const beforeUpload = (file) => {
    const supportedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    if (!supportedTypes.includes(file.type)) {
      message.error(
        "Format file tidak didukung. Gunakan PDF, DOCX, XLSX, PPTX, atau gambar."
      );
      return Upload.LIST_IGNORE;
    }

    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error("Ukuran file maksimal 100MB!");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleReset = () => {
    setUploadProgress(0);
    setUploadedFile(null);
  };

  if (uploadedFile) {
    return (
      <Card
        style={{
          background: token.colorSuccessBg,
          border: `1px solid ${token.colorSuccessBorder}`,
        }}
      >
        <Flex vertical align="center" gap={16}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: token.colorSuccess,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconCheck size={32} color="#fff" />
          </div>
          <Space direction="vertical" align="center" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              Upload Berhasil!
            </Title>
            <Text>{uploadedFile.document?.title}</Text>
            {uploadedFile.extracted && (
              <Text type="success">
                Teks berhasil diekstrak dari dokumen
              </Text>
            )}
            {!uploadedFile.extracted && (
              <Text type="warning">
                Teks tidak dapat diekstrak dari dokumen ini
              </Text>
            )}
          </Space>
          <Space>
            <Button onClick={handleReset}>Upload Lagi</Button>
            <Button
              type="primary"
              onClick={() => handleViewDocument(uploadedFile)}
            >
              Lihat Dokumen
            </Button>
          </Space>
        </Flex>
      </Card>
    );
  }

  return (
    <div>
      <Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        disabled={uploadMutation.isLoading}
        style={{
          padding: 24,
          background: token.colorBgContainer,
          border: `2px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex vertical align="center" gap={16}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: token.colorPrimaryBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUpload size={40} color={token.colorPrimary} />
          </div>
          <Space direction="vertical" align="center" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              Upload Dokumen
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, textAlign: "center" }}>
              Drag & drop file atau klik untuk memilih
            </Paragraph>
          </Space>
          <Flex gap={8} wrap="wrap" justify="center">
            {Object.entries(fileTypeIcons).map(([type, icon]) => (
              type !== "default" && (
                <div
                  key={type}
                  style={{
                    padding: "8px 12px",
                    background: token.colorFillSecondary,
                    borderRadius: token.borderRadius,
                  }}
                >
                  {icon}
                </div>
              )
            ))}
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            PDF, DOCX, XLSX, PPTX, PNG, JPG (Max 100MB)
          </Text>
        </Flex>
      </Dragger>

      {uploadMutation.isLoading && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex justify="space-between">
              <Text>Mengupload dokumen...</Text>
              <Text type="secondary">{uploadProgress}%</Text>
            </Flex>
            <Progress percent={uploadProgress} status="active" />
          </Space>
        </Card>
      )}

      <Alert
        type="info"
        showIcon
        style={{ marginTop: 16 }}
        message="Tips"
        description="Dokumen yang diupload akan otomatis diekstrak teksnya menggunakan AI. Setelah upload, Anda dapat langsung meminta review AI untuk memeriksa kesesuaian dengan Pergub Tata Naskah Dinas."
      />
    </div>
  );
}

export default DocumentUpload;

