import { useCheckQRDocument } from "@/hooks/useCheckQRDocument";
import {
  IconShieldCheck,
  IconFileText,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconX,
  IconUser,
  IconInfoCircle,
  IconDownload,
  IconShieldCheckFilled,
} from "@tabler/icons-react";
import { Card, Empty, Spin, Alert, Tag, Avatar, Timeline, Tabs, Grid, Button, Descriptions } from "antd";
import { Card as MantineCard, Text, Group, Stack, Badge, Divider } from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/id";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { verifyPdfServicePublic } from "@/services/public.services";

const PdfViewer = dynamic(() => import("@/components/EsignBKD/PdfViewer"), {
  ssr: false,
});

const { useBreakpoint } = Grid;

dayjs.locale("id");

const CheckQRDocument = ({ documentCode }) => {
  const { data: response, isLoading, error } = useCheckQRDocument(documentCode);
  const [activeTab, setActiveTab] = useState("info");
  const screens = useBreakpoint();
  const [bsreVerification, setBsreVerification] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Verify PDF with BSRE
  useEffect(() => {
    const verifyDocument = async () => {
      if (!response?.file_url) return;

      setVerifyLoading(true);
      try {
        const result = await verifyPdfServicePublic({ file: response.file_url });
        if (result?.success) {
          setBsreVerification(result.data);
        }
      } catch (error) {
        console.error("Error verifying PDF:", error);
      } finally {
        setVerifyLoading(false);
      }
    };

    verifyDocument();
  }, [response?.file_url]);

  const handleDownload = () => {
    if (!response?.file_url) return;

    // Convert base64 to blob
    const base64Data = response.file_url.includes('base64,')
      ? response.file_url.split('base64,')[1]
      : response.file_url;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Use FileSaver to download with document title as filename
    const filename = response.title
      ? `${response.title}.pdf`
      : `${response.document_code || 'document'}.pdf`;
    saveAs(blob, filename);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text c="dimmed">Memuat data dokumen...</Text>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <Alert
        message="Dokumen Tidak Ditemukan"
        description="Kode dokumen tidak valid atau dokumen tidak ditemukan dalam sistem."
        type="error"
        showIcon
        icon={<IconX size={20} />}
      />
    );
  }

  // Service now returns res?.data?.data directly
  const document = response;

  console.log("CheckQR Document data:", document);
  console.log("File URL:", document?.file_url);

  const getStatusConfig = (status) => {
    const statusMap = {
      draft: { color: "default", text: "Draft", icon: <IconClock size={14} /> },
      in_progress: { color: "processing", text: "Dalam Proses", icon: <IconClock size={14} /> },
      signed: { color: "success", text: "Ditandatangani", icon: <IconCircleCheck size={14} /> },
      completed: { color: "success", text: "Selesai", icon: <IconCircleCheck size={14} /> },
      rejected: { color: "error", text: "Ditolak", icon: <IconX size={14} /> },
    };
    return statusMap[status] || statusMap.draft;
  };

  const statusConfig = getStatusConfig(document.status);

  const isMobile = !screens.md;

  return (
    <Card
      style={{
        borderRadius: isMobile ? 0 : 12,
        boxShadow: isMobile ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
        border: "none",
      }}
      bodyStyle={{ padding: isMobile ? 8 : 24 }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FF4500",
          color: "white",
          padding: isMobile ? 12 : 16,
          borderRadius: isMobile ? 0 : "12px 12px 0 0",
          margin: isMobile ? "-8px -8px 0 -8px" : "-24px -24px 0 -24px",
          textAlign: "center",
        }}
      >
        <IconShieldCheck size={isMobile ? 24 : 28} style={{ marginBottom: isMobile ? 6 : 8 }} />
        <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 4 }}>
          {document.title || "Dokumen E-Sign"}
        </div>
        {document.description && (
          <Text size="xs" style={{ color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
            {document.description}
          </Text>
        )}
        <Text size="xs" style={{ color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>
          {document.document_code}
        </Text>
        <Text size="xs" style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
          Halaman verifikasi keaslian dokumen yang ditandatangani secara elektronik
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginTop: isMobile ? 8 : 16 }}
        size={isMobile ? "small" : "middle"}
        items={[
          {
            key: "info",
            label: (
              <span>
                <IconInfoCircle size={14} style={{ marginRight: 4 }} />
                Informasi
              </span>
            ),
            children: (
              <Stack gap="sm" style={{ marginTop: 8 }}>
                {/* Document Info */}
                <MantineCard withBorder padding="sm" radius="md">
          <Group justify="space-between" wrap="wrap" mb="xs">
            <Text size="md" fw={600}>
              {document.title}
            </Text>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
          </Group>

          <Divider my="xs" />

          <Group gap="md" wrap="wrap">
            <Group gap={6}>
              <Avatar src={document.creator?.image} size={20}>
                {!document.creator?.image && <IconUser size={10} />}
              </Avatar>
              <Text size="xs" fw={500}>
                {document.creator?.name || "Unknown"}
              </Text>
            </Group>

            <Group gap={4}>
              <IconCalendar size={12} style={{ color: "#999" }} />
              <Text size="xs" c="dimmed">
                {dayjs(document.created_at).format("DD MMM YYYY")}
              </Text>
            </Group>

            <Group gap={4}>
              <IconFileText size={12} style={{ color: "#999" }} />
              <Text size="xs" c="dimmed">
                {document.total_pages} hal • {(document.file_size / 1024 / 1024).toFixed(1)} MB
              </Text>
            </Group>

            <Badge color={document.is_public ? "blue" : "gray"} variant="light" size="sm">
              {document.is_public ? "Publik" : "Privat"}
            </Badge>
          </Group>
        </MantineCard>

        {/* Signature Info */}
        {document.signature_info && document.signature_info.length > 0 && (
          <MantineCard withBorder padding="sm" radius="md">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm">
                Tanda Tangan Digital
              </Text>
              <Group gap={6}>
                <Badge color="cyan" variant="light" size="xs">
                  {document.request_type === "sequential" ? "SEQ" : "PAR"}
                </Badge>
                <Tag color={getStatusConfig(document.request_status).color} style={{ fontSize: 11 }}>
                  {getStatusConfig(document.request_status).text}
                </Tag>
              </Group>
            </Group>

            <Timeline
              items={document.signature_info
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map((sig, index) => {
                  const sigStatusColor =
                    sig.status === "signed"
                      ? "green"
                      : sig.status === "rejected"
                      ? "red"
                      : "gray";

                  return {
                    key: index,
                    color: sigStatusColor,
                    dot:
                      sig.status === "signed" ? (
                        <IconCircleCheck size={16} />
                      ) : sig.status === "rejected" ? (
                        <IconX size={16} />
                      ) : (
                        <IconClock size={16} />
                      ),
                    children: (
                      <div style={{ width: "100%" }}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Group gap="xs" style={{ flex: 1 }}>
                            <Avatar src={sig.signer_image} size={24}>
                              {!sig.signer_image && <IconUser size={12} />}
                            </Avatar>
                            <div>
                              <Text size="xs" fw={500}>
                                {sig.signer_name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {sig.role_type === "signer" ? "TTD" : "Review"} #{sig.sequence_order}
                              </Text>
                            </div>
                          </Group>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <Badge size="xs" color={sigStatusColor} variant="dot">
                              {sig.status === "signed" || sig.status === "reviewed"
                                ? "Selesai"
                                : sig.status === "rejected"
                                ? "Ditolak"
                                : "Menunggu"}
                            </Badge>
                            {sig.signed_at && (
                              <Text size="xs" c="dimmed" mt={2}>
                                {dayjs(sig.signed_at).format("DD/MM/YY HH:mm")}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </div>
                    ),
                  };
                })}
            />

            {document.completed_at && (
              <Alert
                message="Selesai"
                description={`${dayjs(document.completed_at).format("DD/MM/YY HH:mm")}`}
                type="success"
                showIcon
                style={{ marginTop: 8, padding: "8px 12px" }}
              />
            )}
          </MantineCard>
        )}

                {/* Verification Badge */}
                <Alert
                  message="Terverifikasi"
                  description="Dokumen terdaftar di sistem E-Sign BKD."
                  type="success"
                  showIcon
                  icon={<IconShieldCheck size={16} />}
                  style={{ padding: "8px 12px" }}
                />

                {/* Download Button */}
                {document.file_url && (
                  <MantineCard withBorder padding="sm" radius="md" style={{ background: "#f0f9ff" }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="sm" fw={500} mb={2}>
                          Unduh Dokumen
                        </Text>
                        <Text size="xs" c="dimmed">
                          Download file PDF dokumen ini
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        icon={<IconDownload size={16} />}
                        onClick={handleDownload}
                      >
                        Download
                      </Button>
                    </Group>
                  </MantineCard>
                )}

                {/* BSRE Verification */}
                <MantineCard withBorder padding="sm" radius="md">
                  <Group gap="xs" mb="xs">
                    <IconShieldCheckFilled size={16} style={{ color: "#52c41a" }} />
                    <Text fw={600} size="sm">
                      Verifikasi BSRE
                    </Text>
                  </Group>

                  {verifyLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Spin size="small" />
                      <Text size="xs" c="dimmed" mt={8}>
                        Memverifikasi dokumen...
                      </Text>
                    </div>
                  ) : bsreVerification ? (
                    <>
                      {bsreVerification.signatureInformations &&
                        bsreVerification.signatureInformations.length > 0 && (
                          <Descriptions size="small" column={1} bordered>
                            <Descriptions.Item label="Penandatangan">
                              {bsreVerification.signatureInformations[0].signerName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Waktu Tanda Tangan">
                              {dayjs(
                                bsreVerification.signatureInformations[0].signatureDate
                              ).format("DD MMMM YYYY, HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Format Tanda Tangan">
                              {bsreVerification.signatureInformations[0].signatureFormat}
                            </Descriptions.Item>
                            <Descriptions.Item label="Integritas Valid">
                              {bsreVerification.signatureInformations[0].integrityValid ? (
                                <Badge color="green">Ya</Badge>
                              ) : (
                                <Badge color="red">Tidak</Badge>
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sertifikat Terpercaya">
                              {bsreVerification.signatureInformations[0].certificateTrusted ? (
                                <Badge color="green">Ya</Badge>
                              ) : (
                                <Badge color="orange">Tidak</Badge>
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Dokumen Dimodifikasi">
                              {bsreVerification.signatureInformations[0].modified ? (
                                <Badge color="red">Ya</Badge>
                              ) : (
                                <Badge color="green">Tidak</Badge>
                              )}
                            </Descriptions.Item>
                            {bsreVerification.signatureInformations[0].timestampInfomation && (
                              <Descriptions.Item label="Waktu Timestamp">
                                {dayjs(
                                  bsreVerification.signatureInformations[0].timestampInfomation
                                    .timestampDate
                                ).format("DD MMMM YYYY, HH:mm")}
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Total Tanda Tangan">
                              {bsreVerification.signatureCount}
                            </Descriptions.Item>
                          </Descriptions>
                        )}
                    </>
                  ) : (
                    <Alert
                      message="Verifikasi Gagal"
                      description="Dokumen tidak dapat diverifikasi dengan BSRE."
                      type="warning"
                      showIcon
                      style={{ padding: "8px 12px" }}
                    />
                  )}
                </MantineCard>
              </Stack>
            ),
          },
          {
            key: "document",
            label: (
              <span>
                <IconFileText size={14} style={{ marginRight: 4 }} />
                Dokumen
              </span>
            ),
            children: (
              <div
                style={{
                  marginTop: 8,
                  marginLeft: isMobile ? -8 : 0,
                  marginRight: isMobile ? -8 : 0,
                  marginBottom: isMobile ? -8 : 0,
                }}
              >
                {document.file_url ? (
                  <div style={{
                    margin: isMobile ? 0 : 'auto',
                  }}>
                    <PdfViewer
                      pdfBase64={document.file_url}
                      title={document.title}
                    />
                  </div>
                ) : (
                  <Alert
                    message="Dokumen Tidak Tersedia"
                    description="File dokumen tidak dapat ditampilkan."
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default CheckQRDocument;
