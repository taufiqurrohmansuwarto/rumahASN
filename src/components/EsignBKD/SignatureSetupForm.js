import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Form,
  Button,
  Input,
  Flex,
  Typography,
  message,
  Divider,
  Grid,
  Row,
  Col,
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Collapse,
  Space,
} from "antd";
import {
  SaveOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  UserOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import {
  Text as MantineText,
  Stack,
  Group,
  Badge as MantineBadge,
  Paper,
  Divider as MantineDivider,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCreateSignatureRequest } from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";
import useSignatureStore from "@/store/useSignatureStore";
import { coordinatesToPixelFormat } from "@/utils/signature-coordinate-helper";

// Import new components
import SignaturePlacementForm from "./SignaturePlacementForm";
import SignersList from "./SignersList";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function SignatureSetupForm({ document }) {
  const router = useRouter();
  const { data: session } = useSession();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const [form] = Form.useForm();

  const [signatureType, setSignatureType] = useState("self_sign"); // self_sign or request_sign
  const [signers, setSigners] = useState([]);
  const [documentNotes, setDocumentNotes] = useState({
    globalNotes: "",
    participantNotes: {},
  });

  // Use Zustand store for signature coordinates
  const signCoordinates = useSignatureStore((state) => state.signCoordinates);
  const clearSignCoordinates = useSignatureStore(
    (state) => state.clearSignCoordinates
  );

  // PDF Preview states
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [totalPages, setTotalPages] = useState(1); // Total pages dari PDF
  const [pdfReady, setPdfReady] = useState(false); // Flag untuk PDF sudah ready

  // Confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  const { mutateAsync: createSignatureRequest, isLoading } =
    useCreateSignatureRequest();

  // Fetch PDF base64 data using documentId
  const fetchPdfBase64 = useCallback(async () => {
    if (!document?.id) return;

    try {
      setPdfLoading(true);
      setPdfError(null);
      setPdfReady(false);

      const base64Response = await previewDocumentAsBase64(document.id);

      const base64Content =
        base64Response?.data?.content ??
        base64Response?.data ??
        base64Response?.content ??
        null;

      if (typeof base64Content === "string" && base64Content.length > 0) {
        setPdfBase64(base64Content);
        // Extract totalPages if available
        if (base64Response?.data?.totalPages) {
          setTotalPages(base64Response.data.totalPages);
        } else if (base64Response?.totalPages) {
          setTotalPages(base64Response.totalPages);
        }

        // Set PDF ready setelah berhasil dimuat
        setTimeout(() => {
          setPdfReady(true);
        }, 100);
      } else {
        throw new Error("Invalid PDF content received");
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setPdfError("Gagal memuat preview dokumen");
      message.error("Gagal memuat preview dokumen");
    } finally {
      setPdfLoading(false);
    }
  }, [document?.id]);

  // Load PDF when component mounts or document changes
  useEffect(() => {
    if (document?.id) {
      fetchPdfBase64();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  // Clear signature coordinates on unmount
  useEffect(() => {
    return () => {
      clearSignCoordinates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync sign_coordinate to form
  useEffect(() => {
    if (signCoordinates && signCoordinates.length > 0) {
      const pixelCoords = coordinatesToPixelFormat(signCoordinates);
      form.setFieldValue("sign_coordinate", pixelCoords);
    } else {
      form.setFieldValue("sign_coordinate", []);
    }
  }, [signCoordinates, form]);

  // Memoize signer name untuk avoid re-render
  const signerName = useMemo(() => {
    return session?.user?.nama || session?.user?.name || "Saya";
  }, [session?.user?.nama, session?.user?.name]);

  // Memoize pdfBase64 untuk avoid re-render
  const memoizedPdfBase64 = useMemo(() => pdfBase64, [pdfBase64]);

  const handleConfirmSubmit = async () => {
    try {
      await createSignatureRequest({
        documentId: document.id,
        data: pendingSubmitData,
      });

      message.success("Pengaturan tanda tangan berhasil dibuat");
      setConfirmModalVisible(false);
      setPendingSubmitData(null);
      clearSignCoordinates(); // Clear store after successful submission
      router.push("/esign-bkd/documents");
    } catch (error) {
      console.error("Error creating signature request:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal membuat pengaturan tanda tangan";
      message.error(errorMessage);
    }
  };

  const handleFinish = async (values) => {
    try {
      console.log("Signature setup values:", values);

      // Validate coordinates
      if (!signCoordinates || signCoordinates.length === 0) {
        message.error(
          "Silakan tempatkan minimal satu logo TTE pada dokumen dengan drag & drop"
        );
        return;
      }

      // Convert to pixel coordinates format
      const signCoordinatesPixel = coordinatesToPixelFormat(signCoordinates);

      // Validate pages tidak melebihi total halaman PDF
      const validatePages = (pages) => {
        const invalidPages = pages.filter(
          (page) => page > totalPages || page < 1
        );
        if (invalidPages.length > 0) {
          throw new Error(
            `Halaman ${invalidPages.join(
              ", "
            )} tidak valid. Dokumen hanya memiliki ${totalPages} halaman.`
          );
        }
      };

      // Validate coordinates have valid pages
      const coordinatePages = signCoordinatesPixel.map((coord) => coord.page);
      validatePages(coordinatePages);

      let signatureRequestData = {
        request_type: "sequential", // Default to sequential
        notes: documentNotes.globalNotes || "",
        type: signatureType,
        sign_coordinate: signCoordinatesPixel, // Array of {page, originX, originY, width, height}
        sign_pages: [], // Empty for backward compatibility
        tag_coordinate: "$", // Default tag for BSrE compatibility
      };

      if (signatureType === "self_sign") {
        // Self sign: simple structure
        signatureRequestData.signature_type = "self_sign";
      } else if (signatureType === "request_sign") {
        // Request sign: validate signers
        if (signers.length === 0) {
          message.error("Silakan tambahkan minimal satu penandatangan");
          return;
        }

        // Validate user_id (required)
        const invalidSigners = signers.filter((s) => !s.user_id);
        if (invalidSigners.length > 0) {
          message.error(
            "Beberapa penandatangan belum memiliki user_id yang valid"
          );
          return;
        }

        // Prepare signers data with notes
        const signersData = signers.map((signer, index) => ({
          user_id: signer.user_id,
          role_type: signer.role_type || "signer",
          sequence_order: signer.sequence_order || index + 1,
          notes: documentNotes.participantNotes[signer.user_id] || "",
        }));

        signatureRequestData.signature_type = "request_sign";
        signatureRequestData.signers = signersData;
        signatureRequestData.request_type = "sequential";
      }

      // Show confirmation modal instead of directly submitting
      setPendingSubmitData(signatureRequestData);
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("Error validating signature setup:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal validasi pengaturan tanda tangan";
      message.error(errorMessage);
    }
  };

  const addSigner = useCallback(() => {
    setSigners((prevSigners) => [
      ...prevSigners,
      {
        id: Date.now(),
        user_id: "", // Store user custom_id
        username: "", // Store username
        user_name: "", // For display
        nama_jabatan: "", // User position
        avatar: "", // User avatar
        role_type: "signer",
        signature_pages: [1],
        tag_coordinate: "!", // Default tag coordinate
        notes: "",
      },
    ]);
  }, []);

  const removeSigner = useCallback((id) => {
    setSigners((prevSigners) =>
      prevSigners.filter((signer) => signer.id !== id)
    );
  }, []);

  const updateSigner = useCallback((id, field, value) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.id === id ? { ...signer, [field]: value } : signer
      )
    );
  }, []);

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        {/* Main Card - Combined */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "20px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <SettingOutlined
              style={{ fontSize: "20px", marginBottom: "6px" }}
            />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Pengaturan Tanda Tangan
            </Title>
            <MantineText
              style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}
            >
              Atur siapa yang akan menandatangani dokumen:{" "}
              {document?.title || "Dokumen"}
            </MantineText>
            <MantineText
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
                marginTop: 4,
                display: "block",
              }}
            >
              Step 2 - Pilih jenis dan atur workflow tanda tangan
            </MantineText>
          </div>

          {/* Action Button Section */}
          <div
            style={{
              padding: "16px 0 12px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <MantineText style={{ fontSize: 16, color: "#6b7280" }}>
                  Preview dokumen dan konfigurasikan workflow tanda tangan
                  elektronik
                </MantineText>
              </Col>
              <Col
                xs={24}
                md={8}
                style={{
                  display: "flex",
                  justifyContent: !screens?.sm ? "flex-start" : "flex-end",
                }}
              >
                <Button
                  onClick={() => router.back()}
                  style={{
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "0 16px",
                  }}
                  block={!screens?.sm}
                >
                  Kembali
                </Button>
              </Col>
            </Row>
          </div>

          {/* Content Section */}
          <div style={{ padding: "20px" }}>
            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
            >
              <Flex vertical gap="middle">
                {/* PDF Preview with Signature Placement - always show di atas */}
                {!pdfLoading && !pdfError && pdfReady && memoizedPdfBase64 && (
                  <>
                    <SignaturePlacementForm
                      pdfBase64={memoizedPdfBase64}
                      initialMode={
                        signatureType === "self_sign" ? "self" : "request"
                      }
                      onModeChange={(newMode) => {
                        // Update signatureType based on mode
                        setSignatureType(
                          newMode === "self" ? "self_sign" : "request_sign"
                        );
                      }}
                      onSignersChange={(newSigners) => {
                        // ADD THIS: Receive signers from SignaturePlacementForm
                        setSigners(newSigners);
                      }}
                      onNotesChange={(notes) => {
                        // Receive notes from SignaturePlacementForm
                        setDocumentNotes(notes);
                      }}
                      canEdit={true}
                    />
                  </>
                )}

                {/* REMOVE THIS BLOCK - SignersList component */}
                {/* {signatureType === "request_sign" && (
                  <SignersList signers={signers} onSignersChange={setSigners} />
                )} */}

                {/* Hidden field for sign_coordinate */}
                <Form.Item name="sign_coordinate" hidden>
                  <Input type="hidden" />
                </Form.Item>

                {/* Action Buttons */}
                <Divider style={{ margin: "16px 0" }} />

                <Flex justify="space-between" style={{ marginTop: 16 }}>
                  <Button
                    onClick={() => router.back()}
                    style={{
                      borderRadius: 6,
                      height: 40,
                      paddingInline: 20,
                      fontWeight: 500,
                    }}
                  >
                    Batal
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    icon={<SaveOutlined />}
                    style={{
                      background: "#FF4500",
                      borderColor: "#FF4500",
                      borderRadius: 6,
                      height: 40,
                      paddingInline: 20,
                      fontWeight: 500,
                    }}
                  >
                    Buat Pengajuan TTE
                  </Button>
                </Flex>
              </Flex>
            </Form>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal - Compact dengan Mantine */}
      <Modal
        title={
          <Group gap="xs">
            <CheckCircleOutlined style={{ color: "#FF4500", fontSize: 18 }} />
            <MantineText size="md" fw={600}>
              Konfirmasi Pengajuan TTE
            </MantineText>
          </Group>
        }
        open={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setPendingSubmitData(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setConfirmModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleConfirmSubmit}
            style={{
              background: "#FF4500",
              borderColor: "#FF4500",
            }}
          >
            Ya, Ajukan
          </Button>,
        ]}
        width={650}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
      >
        {/* Compact Info - Mantine */}
        <Stack gap="md">
          {/* Dokumen Info */}
          <Paper withBorder p="sm" radius="md">
            <Stack gap={6}>
              <Group justify="space-between" wrap="nowrap">
                <MantineText size="xs" c="dimmed">
                  Dokumen
                </MantineText>
                <MantineText size="xs" fw={600} ta="right" style={{ flex: 1 }}>
                  {document?.title}
                </MantineText>
              </Group>
              <MantineDivider size="xs" />
              <Group justify="space-between">
                <MantineText size="xs" c="dimmed">
                  Mode
                </MantineText>
                <MantineBadge
                  size="sm"
                  color={
                    pendingSubmitData?.type === "self_sign" ? "blue" : "green"
                  }
                >
                  {pendingSubmitData?.type === "self_sign" ? "Self" : "Request"}
                </MantineBadge>
              </Group>
              {pendingSubmitData?.notes && (
                <>
                  <MantineDivider size="xs" />
                  <Stack gap={4}>
                    <MantineText size="xs" c="dimmed">
                      Catatan:
                    </MantineText>
                    <MantineText
                      size="xs"
                      style={{
                        padding: 6,
                        background: "#fafafa",
                        borderRadius: 4,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {pendingSubmitData.notes}
                    </MantineText>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          {/* TTE Info - Compact */}
          {pendingSubmitData?.type === "self_sign" ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={6}>
                <MantineText size="sm" fw={600}>
                  Penempatan TTE
                </MantineText>
                <MantineDivider size="xs" />
                <Group justify="space-between">
                  <MantineText size="xs" c="dimmed">
                    Total Logo
                  </MantineText>
                  <MantineBadge size="sm" color="blue">
                    {pendingSubmitData?.sign_coordinate?.length || 0} posisi
                  </MantineBadge>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <MantineText size="xs" c="dimmed">
                    Halaman
                  </MantineText>
                  <Group gap={4}>
                    {pendingSubmitData?.sign_coordinate?.length > 0
                      ? [
                          ...new Set(
                            pendingSubmitData.sign_coordinate.map((c) => c.page)
                          ),
                        ]
                          .sort((a, b) => a - b)
                          .map((page) => (
                            <MantineBadge
                              key={page}
                              size="xs"
                              variant="light"
                              color="cyan"
                            >
                              {page}
                            </MantineBadge>
                          ))
                      : "-"}
                  </Group>
                </Group>
              </Stack>
            </Paper>
          ) : (
            <Paper withBorder p="sm" radius="md">
              <Stack gap="xs">
                <MantineText size="sm" fw={600}>
                  Peserta ({pendingSubmitData?.signers?.length || 0})
                </MantineText>
                <MantineDivider size="xs" />
                <Stack gap={6}>
                  {pendingSubmitData?.signers?.map((signer, index) => {
                    const signerData = signers.find(
                      (s) => s.user_id === signer.user_id
                    );

                    // Count TTE for this signer
                    const tteCount =
                      pendingSubmitData?.sign_coordinate?.filter(
                        (coord) => coord.signerId === signer.user_id
                      ).length || 0;

                    const ttePages = [
                      ...new Set(
                        pendingSubmitData?.sign_coordinate
                          ?.filter((coord) => coord.signerId === signer.user_id)
                          ?.map((c) => c.page) || []
                      ),
                    ].sort((a, b) => a - b);

                    return (
                      <Paper
                        key={index}
                        withBorder
                        p="xs"
                        radius="sm"
                        style={{ backgroundColor: "#fafafa" }}
                      >
                        <Stack gap={4}>
                          <Group justify="space-between">
                            <Group gap={6}>
                              <Avatar src={signerData?.image} size={20}>
                                {signerData?.name?.charAt(0) || "?"}
                              </Avatar>
                              <MantineText size="xs" fw={500}>
                                #{signer.sequence_order}{" "}
                                {signerData?.name || signer.user_id}
                              </MantineText>
                            </Group>
                            <Group gap={4}>
                              <MantineBadge
                                size="xs"
                                color={
                                  signer.role_type === "signer"
                                    ? "blue"
                                    : "orange"
                                }
                              >
                                {signer.role_type === "signer"
                                  ? "Signer"
                                  : "Reviewer"}
                              </MantineBadge>
                              {signer.role_type === "signer" &&
                                tteCount > 0 && (
                                  <MantineBadge size="xs" color="green">
                                    {tteCount} TTE
                                  </MantineBadge>
                                )}
                            </Group>
                          </Group>

                          {signer.role_type === "signer" &&
                            ttePages.length > 0 && (
                              <Group gap={4}>
                                <MantineText size="xs" c="dimmed">
                                  Hal:
                                </MantineText>
                                {ttePages.map((page) => (
                                  <MantineBadge
                                    key={page}
                                    size="xs"
                                    variant="light"
                                    color="cyan"
                                  >
                                    {page}
                                  </MantineBadge>
                                ))}
                              </Group>
                            )}

                          {signer.notes && (
                            <MantineText
                              size="xs"
                              c="dimmed"
                              style={{
                                padding: 4,
                                background: "white",
                                borderRadius: 4,
                                fontStyle: "italic",
                              }}
                            >
                              &ldquo;{signer.notes}&rdquo;
                            </MantineText>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Modal>
    </div>
  );
}

export default SignatureSetupForm;
