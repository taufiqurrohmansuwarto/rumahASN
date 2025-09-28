import { useState, useEffect, useCallback } from "react";
import {
  useDocument,
  useDocumentHistory,
  useDownloadDocument,
  usePreviewDocument,
} from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";
import dynamic from "next/dynamic";
import {
  ExclamationCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

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
  EditOutlined,
  ReloadOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
  Title,
  Tabs,
} from "@mantine/core";
import {
  IconBook2,
  IconFileInfo,
  IconHistory,
  IconUserCircle,
  IconEye,
  IconDownload,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Button, Col, Grid, Row, Dropdown, Menu } from "antd";
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

  const renderActionMenu = () => (
    <Menu>
    <Menu.Item
      key="preview"
      icon={<IconEye size={14} />}
        onClick={() => handlePreview()}
        disabled={previewLoading}
      >
        Preview di Tab Baru
      </Menu.Item>
      <Menu.Item
        key="download"
        icon={<IconDownload size={14} />}
        onClick={() => handleDownload()}
        disabled={downloadLoading}
      >
        Unduh Dokumen
      </Menu.Item>
    </Menu>
  );

  const renderDocumentActions = () => (
    <Group gap="xs" wrap="nowrap" justify="flex-end">
      <Button
        leftSection={<ReloadOutlined />}
        onClick={fetchPdfBase64}
        variant="subtle"
        size="sm"
        loading={pdfLoading}
      >
        Muat Ulang
      </Button>
      <Dropdown
        overlay={renderActionMenu()}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Button
          variant="default"
          size="sm"
          icon={<IconDotsVertical size={16} />}
          loading={previewLoading || downloadLoading}
        />
      </Dropdown>
    </Group>
  );

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

      <Tabs defaultValue="document" variant="outline" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="document" leftSection={<IconBook2 size={16} />}>
            Dokumen
          </Tabs.Tab>
          <Tabs.Tab
            value="information"
            leftSection={<IconFileInfo size={16} />}
          >
            Informasi
          </Tabs.Tab>
          <Tabs.Tab value="workflow" leftSection={<IconUserCircle size={16} />}>
            Workflow
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            Riwayat
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="document" pt="md">
          <Stack gap="md">
            {pdfError ? (
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between" align="center">
                    <Group gap="sm" align="center">
                      <Avatar color="blue" size="sm" radius="xl">
                        <IconBook2 size={16} />
                      </Avatar>
                      <Text fw={600}>{document?.title || "Dokumen PDF"}</Text>
                    </Group>
                    {renderDocumentActions()}
                  </Group>
                </Card.Section>
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <ExclamationCircleOutlined
                      style={{ fontSize: 64, color: "#ff4d4f" }}
                    />
                    <Text size="lg" c="red" ta="center">
                      Gagal memuat PDF: {pdfError}
                    </Text>
                    <Button onClick={fetchPdfBase64} variant="light">
                      Coba Lagi
                    </Button>
                  </Stack>
                </Center>
              </Card>
            ) : !pdfBase64 ? (
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between" align="center">
                    <Group gap="sm" align="center">
                      <Avatar color="blue" size="sm" radius="xl">
                        <IconBook2 size={16} />
                      </Avatar>
                      <Text fw={600}>{document?.title || "Dokumen PDF"}</Text>
                    </Group>
                    {renderDocumentActions()}
                  </Group>
                </Card.Section>
                <Center py="xl">
                  <Stack align="center" gap="md">
                    {pdfLoading ? (
                      <Loader size="lg" />
                    ) : (
                      <IconBook2 size={48} color="#d1d5db" />
                    )}
                    <Text size="sm" c="dimmed" ta="center">
                      {pdfLoading
                        ? "Memuat dokumen PDF..."
                        : "Dokumen belum tersedia"}
                    </Text>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <PdfViewer
                pdfBase64={pdfBase64}
                title={document?.title || "Dokumen PDF"}
                headerActions={renderDocumentActions()}
              />
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="information" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group gap="sm">
                <Avatar color="blue" size="sm" radius="xl">
                  <IconFileInfo size={16} />
                </Avatar>
                <Text fw={600} size="lg">
                  Informasi Dokumen
                </Text>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Title order={4}>{document.title}</Title>
              <StatusBadge status={document.status} />

              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Deskripsi
                  </Text>
                  <Text size="sm">{document.description || "-"}</Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Dibuat oleh
                  </Text>
                  <Text size="sm">{document.created_by?.name || "-"}</Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Tanggal dibuat
                  </Text>
                  <Text size="sm">
                    {dayjs(document.created_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Terakhir diperbarui
                  </Text>
                  <Text size="sm">
                    {dayjs(document.updated_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Ukuran file
                  </Text>
                  <Text size="sm">
                    {document.file_size
                      ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                      : "-"}
                  </Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Text fw={500} c="dimmed" size="xs">
                    Tipe file
                  </Text>
                  <Text size="sm">{document.file_type || "PDF"}</Text>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8}>
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
              </Row>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="workflow" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group gap="sm">
                <Avatar color="orange" size="sm" radius="xl">
                  <IconUserCircle size={16} />
                </Avatar>
                <Text fw={600} size="lg">
                  Status Workflow
                </Text>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              {document.status === "draft" ? (
                <Stack gap="sm" align="center" py="lg">
                  <Text size="sm" c="dimmed">
                    Workflow belum disiapkan. Atur alur penandatangan untuk
                    memulai proses.
                  </Text>
                  <Group gap="sm" justify="center" wrap="wrap">
                    <Button
                      leftSection={<EditOutlined />}
                      onClick={() =>
                        router.push(`/esign-bkd/documents/${id}/edit`)
                      }
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
                </Stack>
              ) : (
                <Stack gap="md">
                  <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <Text fw={500} c="dimmed" size="xs">
                        Jenis Workflow
                      </Text>
                      <Text size="sm" style={{ textTransform: "capitalize" }}>
                        {document.workflow_type || "-"}
                      </Text>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <Text fw={500} c="dimmed" size="xs">
                        Total Penandatangan
                      </Text>
                      <Text size="sm">{document.total_signers || 0} orang</Text>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                      <Text fw={500} c="dimmed" size="xs">
                        Sudah Ditandatangani
                      </Text>
                      <Text size="sm">{document.signed_count || 0} orang</Text>
                    </Col>
                  </Row>

                  <Stack gap={4}>
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
                      size="md"
                      radius="md"
                    />
                    <Text size="xs" c="dimmed">
                      {(
                        ((document.signed_count || 0) /
                          (document.total_signers || 1)) *
                        100
                      ).toFixed(0)}
                      % selesai
                    </Text>
                  </Stack>

                  <Group gap="sm" wrap="wrap">
                    <Button
                      variant="default"
                      size="sm"
                      leftSection={<EditOutlined />}
                      onClick={() =>
                        router.push(`/esign-bkd/documents/${id}/edit`)
                      }
                      fullWidth={isMobile}
                    >
                      Edit Dokumen
                    </Button>
                    <Button
                      size="sm"
                      color="orange"
                      onClick={() =>
                        router.push(`/esign-bkd/documents/${id}/workflow`)
                      }
                      fullWidth={isMobile}
                    >
                      Kelola Workflow
                    </Button>
                  </Group>
                </Stack>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group gap="sm">
                <Avatar color="orange" size="sm" radius="xl">
                  <IconHistory size={16} />
                </Avatar>
                <Text fw={600} size="lg">
                  Riwayat Aktivitas
                </Text>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              {historyLoading ? (
                <Center py="lg">
                  <Loader size="sm" />
                </Center>
              ) : history && history.length > 0 ? (
                <WorkflowTimeline data={history} />
              ) : (
                <Stack align="center" gap="md" py="xl">
                  <HistoryOutlined style={{ fontSize: 48, color: "#d1d5db" }} />
                  <Text size="sm" c="dimmed">
                    Belum ada aktivitas
                  </Text>
                </Stack>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default DocumentDetail;
