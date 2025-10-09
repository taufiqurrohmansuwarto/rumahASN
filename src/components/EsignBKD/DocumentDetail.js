import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useDocument,
  useDownloadDocument,
  usePreviewDocument,
  useDeleteDocument,
  useUpdateDocument,
} from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";
import usePdfPageStore from "@/store/usePdfPageStore";
import dynamic from "next/dynamic";
import { DocumentAuditLog } from "@/components/EsignBKD";
import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
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
import { ReloadOutlined, SafetyOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Tabs,
  Tooltip,
} from "@mantine/core";
import {
  IconBook2,
  IconHistory,
  IconUserCircle,
  IconEye,
  IconDownload,
  IconDotsVertical,
  IconClock,
  IconCircleCheck,
  IconX,
} from "@tabler/icons-react";
import { Button, Dropdown, Modal, Switch, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";

dayjs.locale("id");

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: "gray", icon: <IconClock size={12} />, text: "DRAFT" },
    pending: {
      color: "orange",
      icon: <IconClock size={12} />,
      text: "PENDING",
    },
    in_progress: {
      color: "blue",
      icon: <IconClock size={12} />,
      text: "PROSES",
    },
    in_review: {
      color: "orange",
      icon: <IconClock size={12} />,
      text: "REVIEW",
    },
    signed: {
      color: "green",
      icon: <IconCircleCheck size={12} />,
      text: "DITANDATANGANI",
    },
    completed: {
      color: "green",
      icon: <IconCircleCheck size={12} />,
      text: "SELESAI",
    },
    rejected: { color: "red", icon: <IconX size={12} />, text: "DITOLAK" },
    cancelled: { color: "gray", icon: <IconX size={12} />, text: "DIBATALKAN" },
  };

  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge
      color={config.color}
      variant="light"
      size="sm"
      leftSection={
        <div style={{ display: "flex", alignItems: "center" }}>
          {config.icon}
        </div>
      }
      styles={{
        section: { display: "flex", alignItems: "center" },
        label: { display: "flex", alignItems: "center" },
      }}
    >
      {config.text}
    </Badge>
  );
};

function DocumentDetail() {
  const router = useRouter();
  const { id } = router.query;

  // State untuk PDF base64 data
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // No longer needed - we'll use selector directly in component

  const { data: response, isLoading, refetch } = useDocument(id);
  const { mutateAsync: downloadDocument, isLoading: downloadLoading } =
    useDownloadDocument();
  const { mutateAsync: previewDocument, isLoading: previewLoading } =
    usePreviewDocument();
  const { mutateAsync: deleteDocument, isLoading: deleteLoading } =
    useDeleteDocument();
  const { mutateAsync: updateDocument, isLoading: updateLoading } =
    useUpdateDocument();

  // Extract document from response
  const document = response?.data;

  // Generate document ID
  const documentId = document?.id || router.query.id || id;

  // Subscribe to page sizes from Zustand (MUST be before early returns!)
  const allPageSizes = usePdfPageStore((state) => state.pageSizes);

  const pdfPageSizes = useMemo(() => {
    return allPageSizes[id] || {};
  }, [allPageSizes, id]);

  // Calculate TTE coordinates (before early returns, handle undefined gracefully)
  const allTteCoordinates = useMemo(() => {
    const signatureRequest = document?.signature_requests?.[0];
    if (!signatureRequest) return [];

    const signatureDetails = (signatureRequest?.signature_details || []).sort(
      (a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)
    );

    const coordinates = signatureDetails.flatMap((detail) => {
      if (!detail.sign_coordinate || !Array.isArray(detail.sign_coordinate)) {
        return [];
      }
      return detail.sign_coordinate.map((coord) => {
        const pageSize = pdfPageSizes[coord.page];

        if (!pageSize) {
          console.warn(`[DocumentDetail] Page size not loaded for page ${coord.page}`);
          return null;
        }

        // Database stores coordinates in PIXELS with BROWSER coordinate system (top-left origin)
        // No Y-flip needed - use as-is

        console.log('[DocumentDetail] Loading coordinate:', {
          database: { originX: coord.originX, originY: coord.originY, width: coord.width, height: coord.height },
          pageSize,
          calculatedRatio: {
            x: coord.originX / pageSize.width,
            y: coord.originY / pageSize.height,
          },
          NOTE: 'NO Y-FLIP - database stores browser coordinates',
        });

        // Convert pixels to ratio
        return {
          id: `${detail.id}_${coord.page}_${coord.originX}_${coord.originY}`,
          page: coord.page,
          positionRatio: {
            x: coord.originX / pageSize.width,
            y: coord.originY / pageSize.height,
          },
          sizeRatio: {
            width: coord.width / pageSize.width,
            height: coord.height / pageSize.height,
          },
          signerId: coord.signerId,
          signerName: coord.signerName,
          signerAvatar: detail.user?.image || null,
        };
      });
    }).filter(Boolean);

    console.log('[DocumentDetail] Calculated TTE coordinates:', coordinates);
    return coordinates;
  }, [document, pdfPageSizes]);

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

  const handleDelete = () => {
    Modal.confirm({
      title: "Hapus Dokumen",
      content: "Apakah Anda yakin ingin menghapus dokumen ini?",
      okText: "Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDocument(id);
          message.success("Dokumen berhasil dihapus");
          router.push("/esign-bkd/documents");
        } catch (error) {
          message.error(error.message || "Gagal menghapus dokumen");
        }
      },
    });
  };

  const handleAddWorkflow = () => {
    router.push(`/esign-bkd/documents/create?documentId=${id}`);
  };

  const handleTogglePublic = async (checked) => {
    try {
      await updateDocument({
        id,
        data: { is_public: checked },
      });
      message.success(
        `Dokumen berhasil diubah menjadi ${checked ? "publik" : "privat"}`
      );
      refetch();
    } catch (error) {
      message.error(error.message || "Gagal mengubah visibilitas dokumen");
    }
  };

  // Jump to specific page in PDF viewer
  const handleJumpToPage = (pageNumber) => {
    // Dispatch custom event for PdfViewer to listen
    window.dispatchEvent(
      new CustomEvent("jumpToPage", { detail: { page: pageNumber } })
    );

    // Switch to document tab if not visible
    setTimeout(() => {
      const documentTabButton = Array.from(
        window.document.querySelectorAll('[role="tab"]')
      ).find((tab) => tab.textContent.includes("Dokumen"));

      if (documentTabButton) {
        documentTabButton.click();
      }
    }, 100);
  };

  const actionMenuItems = [
    {
      key: "preview",
      icon: <IconEye size={14} />,
      label: "Preview di Tab Baru",
      onClick: () => handlePreview(),
      disabled: previewLoading,
    },
    {
      key: "download",
      icon: <IconDownload size={14} />,
      label: "Unduh Dokumen",
      onClick: () => handleDownload(),
      disabled: downloadLoading,
    },
  ];

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
        menu={{ items: actionMenuItems }}
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

  // Get first signature request data
  const signatureRequest = document?.signature_requests?.[0];
  const creator = signatureRequest?.creator || document?.user;
  const signatureDetails = (signatureRequest?.signature_details || []).sort(
    (a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)
  );

  // allTteCoordinates already calculated above (before early returns)

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
              {document.title}
            </Title>
            <Text size="sm" c="rgba(255,255,255,0.9)">
              {document.document_code}
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Info Section - Compact */}
      <Paper withBorder p="lg" radius="md" mb="md">
        <div style={{ paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
          <Group justify="space-between" wrap="wrap" gap={16}>
            <Group gap={12}>
              <Avatar
                src={creator?.image}
                size={36}
                style={{
                  border: "2px solid #f0f0f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {!creator?.image && <SafetyOutlined />}
              </Avatar>
              <Group gap={8}>
                <Text size="xs" fw={600}>
                  {creator?.username || "Unknown"}
                </Text>
                <Text size="xs" c="dimmed">
                  •
                </Text>
                <Group gap={6}>
                  <IconUserCircle size={12} style={{ color: "#999" }} />
                  <Text size="xs" c="dimmed">
                    {dayjs(document.created_at).format("DD.MM.YYYY • HH:mm")}
                  </Text>
                </Group>
              </Group>
            </Group>
            <Group gap={12} wrap="wrap">
              <StatusBadge status={document.status} />
              <Badge
                color={document.is_public ? "blue" : "gray"}
                variant="light"
                size="sm"
              >
                {document.is_public ? "PUBLIK" : "PRIVAT"}
              </Badge>
              {signatureRequest?.request_type && (
                <Badge color="cyan" variant="light" size="sm">
                  {signatureRequest.request_type === "sequential"
                    ? "SEQUENTIAL"
                    : "PARALLEL"}
                </Badge>
              )}
            </Group>
          </Group>

          {/* Action Buttons berdasarkan status */}
          <div style={{ marginTop: 16 }}>
            {document.status === "draft" ? (
              <Group gap={8}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddWorkflow}
                  style={{ borderRadius: 6 }}
                >
                  Tambah Workflow
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={deleteLoading}
                  style={{ borderRadius: 6 }}
                >
                  Hapus Dokumen
                </Button>
              </Group>
            ) : document.status === "signed" ||
              document.status === "completed" ? (
              <Group gap={8} align="center">
                <Text size="xs" fw={500}>
                  Visibilitas:
                </Text>
                <Switch
                  checked={document.is_public}
                  onChange={handleTogglePublic}
                  loading={updateLoading}
                  checkedChildren="Publik"
                  unCheckedChildren="Privat"
                />
              </Group>
            ) : null}
          </div>

          {/* Description */}
          {document.description && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#fafafa",
                borderRadius: 8,
                border: "1px solid #e8e8e8",
              }}
            >
              <Text size="xs" fw={600} c="dimmed" style={{ marginBottom: 6 }}>
                Deskripsi:
              </Text>
              <Text size="xs" style={{ lineHeight: 1.6 }}>
                {document.description}
              </Text>
            </div>
          )}
        </div>

        {/* Workflow Progress */}
        {signatureDetails.length > 0 && (
          <div style={{ paddingTop: 20 }}>
            <Text fw={600} size="sm" c="dimmed" style={{ marginBottom: 12 }}>
              Progress Penandatanganan
            </Text>
            <Stack gap="xs">
              {signatureDetails.map((detail, index) => {
                const statusColor =
                  {
                    waiting: "orange",
                    signed: "green",
                    reviewed: "blue",
                    rejected: "red",
                  }[detail.status] || "default";

                return (
                  <div key={detail.id}>
                    <Group justify="space-between" gap={8}>
                      <Group gap={6}>
                        <Badge
                          color={statusColor}
                          size="sm"
                          style={{ minWidth: 24 }}
                        >
                          {index + 1}
                        </Badge>
                        <Avatar src={detail.user?.image} size={20}>
                          {!detail.user?.image && <IconUserCircle size={10} />}
                        </Avatar>
                        <div>
                          <Text size="xs" fw={500} style={{ lineHeight: 1.3 }}>
                            {detail.user?.username}
                          </Text>
                          {detail.role_type === "signer" &&
                            detail.sign_pages &&
                            detail.sign_pages.length > 0 && (
                              <Group gap={4} style={{ flexWrap: "wrap" }}>
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  style={{ fontSize: 10 }}
                                >
                                  Hal:
                                </Text>
                                {detail.sign_pages.map((page, idx) => (
                                  <Tooltip
                                    key={idx}
                                    label={`Lihat halaman ${page}`}
                                    withArrow
                                  >
                                    <Badge
                                      size="xs"
                                      color="blue"
                                      variant="light"
                                      style={{
                                        cursor: "pointer",
                                        fontSize: 9,
                                        transition: "all 0.2s",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                          "scale(1.1)";
                                        e.currentTarget.style.backgroundColor =
                                          "#1890ff";
                                        e.currentTarget.style.color = "white";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                          "scale(1)";
                                        e.currentTarget.style.backgroundColor =
                                          "";
                                        e.currentTarget.style.color = "";
                                      }}
                                      onClick={() => handleJumpToPage(page)}
                                    >
                                      {page}
                                    </Badge>
                                  </Tooltip>
                                ))}
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  style={{ fontSize: 10 }}
                                >
                                  • {detail.tag_coordinate || "!"}
                                </Text>
                              </Group>
                            )}
                        </div>
                      </Group>
                      <Badge
                        size="xs"
                        color={statusColor}
                        variant="light"
                        tt="uppercase"
                      >
                        {detail.status === "signed"
                          ? "Ditandatangani"
                          : detail.status === "rejected"
                          ? "Ditolak"
                          : detail.status === "reviewed"
                          ? "Direview"
                          : "Menunggu"}
                      </Badge>
                    </Group>
                    {(detail.notes || detail.reason) && (
                      <div
                        style={{
                          marginTop: 6,
                          marginLeft: 52,
                          padding: "6px 10px",
                          background:
                            detail.status === "rejected"
                              ? "linear-gradient(135deg, #fff1f0 0%, #ffe7e5 100%)"
                              : detail.status === "reviewed"
                              ? "linear-gradient(135deg, #e6f7ff 0%, #d9f0ff 100%)"
                              : detail.status === "signed"
                              ? "linear-gradient(135deg, #f6ffed 0%, #e7f7e0 100%)"
                              : "#fafafa",
                          border: `1px solid ${
                            detail.status === "rejected"
                              ? "#ffccc7"
                              : detail.status === "reviewed"
                              ? "#91d5ff"
                              : detail.status === "signed"
                              ? "#b7eb8f"
                              : "#e8e8e8"
                          }`,
                          borderLeft: `3px solid ${
                            detail.status === "rejected"
                              ? "#ff4d4f"
                              : detail.status === "reviewed"
                              ? "#1890ff"
                              : detail.status === "signed"
                              ? "#52c41a"
                              : "#d9d9d9"
                          }`,
                          borderRadius: 4,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Group gap={4} align="flex-start">
                          <Text
                            size="xs"
                            fw={600}
                            c={
                              detail.status === "rejected"
                                ? "red"
                                : detail.status === "reviewed"
                                ? "blue"
                                : detail.status === "signed"
                                ? "green"
                                : "dimmed"
                            }
                            style={{ fontSize: 10 }}
                          >
                            {detail.reason
                              ? detail.status === "rejected"
                                ? "💬 Alasan Penolakan:"
                                : detail.status === "reviewed"
                                ? "💬 Alasan Review:"
                                : detail.status === "signed"
                                ? "💬 Alasan:"
                                : "💬 Alasan:"
                              : detail.status === "reviewed"
                              ? "📝 Catatan Review:"
                              : detail.status === "signed"
                              ? "✓ Catatan:"
                              : "📌 Catatan:"}
                          </Text>
                        </Group>
                        <Text
                          size="xs"
                          c={detail.status === "rejected" ? "red.7" : "dark.6"}
                          style={{
                            fontSize: 10,
                            lineHeight: 1.5,
                            marginTop: 2,
                          }}
                        >
                          {detail.reason || detail.notes || ""}
                        </Text>
                      </div>
                    )}
                  </div>
                );
              })}
            </Stack>
          </div>
        )}
      </Paper>

      <Tabs defaultValue="document" variant="outline" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="document" leftSection={<IconBook2 size={16} />}>
            Dokumen
          </Tabs.Tab>
          <Tabs.Tab value="audit" leftSection={<IconHistory size={16} />}>
            Audit Log
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
                documentId={id}
                enableSignaturePlacement={allTteCoordinates.length > 0}
                initialSignatures={allTteCoordinates}
                canEdit={false}
              />
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="audit" pt="md">
          <DocumentAuditLog documentId={id} viewMode="table" />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default DocumentDetail;
