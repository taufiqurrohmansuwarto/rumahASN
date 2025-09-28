import { useState, useEffect, useCallback } from "react";
import {
  useDocument,
  useDocumentHistory,
  useDownloadDocument,
  usePreviewDocument,
} from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";
import dynamic from "next/dynamic";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Dynamic import PdfViewer untuk menghindari SSR issues
const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="sm" c="dimmed">
              Memuat PDF Viewer...
            </Text>
          </Stack>
        </div>
      </Card.Section>
    </Card>
  ),
});
import {
  ClockCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { Button, Col, Grid, Row } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";

dayjs.locale("id");

const { useBreakpoint } = Grid;

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: "gray", text: "Draft" },
    pending: { color: "blue", text: "Pending" },
    in_review: { color: "orange", text: "Review" },
    signed: { color: "green", text: "Ditandatangani" },
    completed: { color: "green", text: "Selesai" },
    rejected: { color: "red", text: "Ditolak" },
    cancelled: { color: "gray", text: "Dibatalkan" },
  };

  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge color={config.color} variant="filled">
      {config.text}
    </Badge>
  );
};

const WorkflowTimeline = ({ data }) => {
  const timelineItems = data?.map((item) => ({
    bullet:
      item.status === "completed" ? <ClockCircleOutlined /> : <UserOutlined />,
    title: item.action,
    children: (
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {item.user_name} •{" "}
          {dayjs(item.created_at).format("DD MMM YYYY HH:mm")}
        </Text>
        {item.notes && (
          <Text size="sm" fs="italic" c="dimmed">
            &ldquo;{item.notes}&rdquo;
          </Text>
        )}
      </Stack>
    ),
  }));

  return <Timeline>{timelineItems}</Timeline>;
};

function DocumentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;

  // State untuk PDF base64 data
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const { data: document, isLoading } = useDocument(id);
  const { data: history, isLoading: historyLoading } = useDocumentHistory(id);
  const { mutateAsync: downloadDocument, isLoading: downloadLoading } =
    useDownloadDocument();
  const { mutateAsync: previewDocument, isLoading: previewLoading } =
    usePreviewDocument();

  // Generate document ID
  const documentId = document?.id || router.query.id || id;

  // Fetch PDF base64 data
  const fetchPdfBase64 = useCallback(async () => {
    if (!documentId) return;

    try {
      setPdfLoading(true);
      setPdfError(null);

      const base64Response = await previewDocumentAsBase64(documentId);

      const base64Content =
        base64Response?.data?.content ??
        base64Response?.data ??
        base64Response?.content ??
        null;

      if (typeof base64Content === "string" && base64Content.length > 0) {
        setPdfBase64(base64Content);
      } else {
        throw new Error("Invalid base64 response format");
      }
    } catch (error) {
      setPdfError(error.message);
    } finally {
      setPdfLoading(false);
    }
  }, [documentId]);

  // useEffect untuk fetch PDF saat documentId berubah
  useEffect(() => {
    if (documentId && !isLoading) {
      fetchPdfBase64();
    }
  }, [documentId, isLoading, fetchPdfBase64]);

  const handleDownload = async () => {
    try {
      await downloadDocument({ id, filename: document?.filename });
    } catch (error) {
      setPdfError(error.message);
    }
  };

  const handlePreview = async () => {
    try {
      await previewDocument(id);
    } catch (error) {
      setPdfError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Header Section */}
        <Paper
          style={{
            background: "#FF4500",
            padding: "24px",
            borderRadius: "12px 12px 0 0",
            marginBottom: "24px",
          }}
        >
          <Group gap="md">
            <SafetyOutlined style={{ fontSize: "24px", color: "white" }} />
            <Stack gap="xs">
              <Title order={3} c="white">
                Detail Dokumen
              </Title>
              <Text size="sm" c="rgba(255,255,255,0.9)">
                Informasi lengkap dokumen dan riwayat aktivitas
              </Text>
            </Stack>
          </Group>
        </Paper>

        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Header Section */}
        <Paper
          style={{
            background: "#FF4500",
            padding: "24px",
            borderRadius: "12px 12px 0 0",
            marginBottom: "24px",
          }}
        >
          <Group gap="md">
            <SafetyOutlined style={{ fontSize: "24px", color: "white" }} />
            <Stack gap="xs">
              <Title order={3} c="white">
                Detail Dokumen
              </Title>
              <Text size="sm" c="rgba(255,255,255,0.9)">
                Informasi lengkap dokumen dan riwayat aktivitas
              </Text>
            </Stack>
          </Group>
        </Paper>

        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Stack align="center" gap="md">
            <SafetyOutlined style={{ fontSize: 64, color: "#d1d5db" }} />
            <Text size="lg" c="dimmed">
              Dokumen tidak ditemukan
            </Text>
          </Stack>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {/* Header Section */}
      <Paper
        style={{
          background: "#FF4500",
          padding: "24px",
          borderRadius: "12px 12px 0 0",
          marginBottom: "24px",
        }}
      >
        <Group gap="md">
          <SafetyOutlined style={{ fontSize: "24px", color: "white" }} />
          <Stack gap="xs">
            <Title order={3} c="white">
              Detail Dokumen
            </Title>
            <Text size="sm" c="rgba(255,255,255,0.9)">
              Informasi lengkap dokumen dan riwayat aktivitas
            </Text>
          </Stack>
        </Group>
      </Paper>

      <div style={{ marginTop: "16px" }}>
        {/* PDF Viewer Section */}
        {pdfBase64 && !isLoading && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <PdfViewer
                pdfBase64={pdfBase64}
                title={document?.title || "Dokumen PDF"}
              />
            </Col>
          </Row>
        )}

        {/* PDF Loading State */}
        {pdfLoading && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text size="sm" c="dimmed">
                      Memuat dokumen PDF...
                    </Text>
                  </Stack>
                </Center>
              </Card>
            </Col>
          </Row>
        )}

        {/* PDF Error State */}
        {pdfError && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <ExclamationCircleOutlined
                      style={{ fontSize: 64, color: "#ff4d4f" }}
                    />
                    <Text size="lg" c="red">
                      Gagal memuat PDF: {pdfError}
                    </Text>
                    <Button onClick={fetchPdfBase64} variant="light">
                      Coba Lagi
                    </Button>
                  </Stack>
                </Center>
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={16} xl={18} xxl={18}>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Avatar color="blue" size="sm" radius="xl">
                      <FileTextOutlined />
                    </Avatar>
                    <Text fw={600} size="lg">
                      Detail Dokumen
                    </Text>
                  </Group>
                  <Group gap="sm">
                    <Button
                      leftSection={<EyeOutlined />}
                      onClick={handlePreview}
                      loading={previewLoading}
                      variant="default"
                      size="sm"
                    >
                      Preview
                    </Button>
                    <Button
                      leftSection={<DownloadOutlined />}
                      onClick={handleDownload}
                      loading={downloadLoading}
                      color="orange"
                      size="sm"
                    >
                      Download
                    </Button>
                  </Group>
                </Group>
              </Card.Section>
              <Stack gap="md" mt="md">
                <Title order={4}>{document.title}</Title>

                <StatusBadge status={document.status} />

                <Row gutter={[8, 4]}>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Deskripsi
                    </Text>
                    <Text size="sm" truncate>
                      {document.description || "-"}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Dibuat oleh
                    </Text>
                    <Text size="sm" truncate>
                      {document.created_by?.name || "-"}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Tanggal dibuat
                    </Text>
                    <Text size="sm">
                      {dayjs(document.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Ukuran file
                    </Text>
                    <Text size="sm">
                      {document.file_size
                        ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "-"}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Tipe file
                    </Text>
                    <Text size="sm">{document.file_type || "PDF"}</Text>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Visibilitas
                    </Text>
                    <Badge
                      color={document.is_public ? "blue" : "gray"}
                      variant="light"
                      size="sm"
                    >
                      {document.is_public ? "Publik" : "Privat"}
                    </Badge>
                  </Col>
                  <Col xs={24} sm={12} md={24} lg={12} xl={8}>
                    <Text fw={500} c="dimmed" size="xs">
                      Terakhir diperbarui
                    </Text>
                    <Text size="sm">
                      {dayjs(document.updated_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Col>
                </Row>

                {document.status !== "draft" && (
                  <>
                    <Divider my="md" />
                    <Title order={5} mb="sm">
                      Informasi Workflow
                    </Title>

                    <Row gutter={[8, 4]}>
                      <Col xs={24} sm={12} md={24} lg={12}>
                        <Text fw={500} c="dimmed" size="xs">
                          Total Penandatangan
                        </Text>
                        <Text size="sm">
                          {document.total_signers || 0} orang
                        </Text>
                      </Col>
                      <Col xs={24} sm={12} md={24} lg={12}>
                        <Text fw={500} c="dimmed" size="xs">
                          Sudah Ditandatangani
                        </Text>
                        <Text size="sm">
                          {document.signed_count || 0} orang
                        </Text>
                      </Col>
                      <Col xs={24}>
                        <Text fw={500} c="dimmed" size="xs">
                          Progress
                        </Text>
                        <Progress
                          value={
                            ((document.signed_count || 0) /
                              (document.total_signers || 1)) *
                            100
                          }
                          color="orange"
                          size="sm"
                          radius="md"
                        />
                        <Text size="xs" c="dimmed" mt={2}>
                          {(
                            ((document.signed_count || 0) /
                              (document.total_signers || 1)) *
                            100
                          ).toFixed(0)}
                          % selesai
                        </Text>
                      </Col>
                    </Row>
                  </>
                )}
              </Stack>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group gap="sm">
                  <Avatar color="orange" size="sm" radius="xl">
                    <HistoryOutlined />
                  </Avatar>
                  <Text fw={600} size="lg">
                    Riwayat Aktivitas
                  </Text>
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                {historyLoading ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Loader size="sm" />
                  </div>
                ) : history && history.length > 0 ? (
                  <WorkflowTimeline data={history} />
                ) : (
                  <Stack align="center" gap="md" py="xl">
                    <HistoryOutlined
                      style={{ fontSize: 48, color: "#d1d5db" }}
                    />
                    <Text size="sm" c="dimmed">
                      Belum ada aktivitas
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Col>
        </Row>
      </div>

      {document.status === "draft" && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Col xs={24} sm={16} md={12} lg={8} xl={6}>
            <Group justify="center" gap="md">
              <Button
                leftSection={<EditOutlined />}
                onClick={() => router.push(`/esign-bkd/documents/${id}/edit`)}
                variant="default"
                size="sm"
                fullWidth={isMobile}
              >
                Edit Dokumen
              </Button>
              <Button
                onClick={() =>
                  router.push(`/esign-bkd/documents/${id}/workflow`)
                }
                color="orange"
                size="sm"
                fullWidth={isMobile}
              >
                Setup Workflow
              </Button>
            </Group>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default DocumentDetail;
