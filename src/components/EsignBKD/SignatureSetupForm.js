import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import {
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Text as MantineText } from "@mantine/core";
import { useRouter } from "next/router";
import { useCreateSignatureRequest } from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";

// Import new components
import SignatureTypeSelection from "./SignatureTypeSelection";
import PersonalSignatureSettings from "./PersonalSignatureSettings";
import SignersList from "./SignersList";
import PdfPreview from "./PdfPreview";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function SignatureSetupForm({ document }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const [form] = Form.useForm();

  const [signatureType, setSignatureType] = useState("self_sign"); // self_sign or request_sign
  const [signers, setSigners] = useState([]);
  const [currentUserSettings, setCurrentUserSettings] = useState({
    pages: [1],
    tagCoordinate: "!"
  }); // Settings untuk self sign

  // PDF Preview states
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [totalPages, setTotalPages] = useState(1); // Total pages dari PDF

  const { mutateAsync: createSignatureRequest, isLoading } = useCreateSignatureRequest();

  // Fetch PDF base64 data using documentId
  const fetchPdfBase64 = useCallback(async () => {
    if (!document?.id) return;

    try {
      setPdfLoading(true);
      setPdfError(null);

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
  }, [fetchPdfBase64]);

  const handleFinish = async (values) => {
    try {
      console.log("Signature setup values:", values);

      // Validate pages tidak melebihi total halaman PDF
      const validatePages = (pages) => {
        const invalidPages = pages.filter(page => page > totalPages || page < 1);
        if (invalidPages.length > 0) {
          throw new Error(`Halaman ${invalidPages.join(', ')} tidak valid. Dokumen hanya memiliki ${totalPages} halaman.`);
        }
      };

      let signatureRequestData = {
        request_type: "sequential", // Default to sequential
        notes: values.notes || "",
        type: signatureType,
      };

      if (signatureType === "self_sign") {
        // Self sign: current user signs on specified pages
        if (!currentUserSettings.pages || currentUserSettings.pages.length === 0) {
          message.error("Silakan pilih halaman yang akan ditandatangani");
          return;
        }

        // Validate pages
        validatePages(currentUserSettings.pages);

        signatureRequestData.sign_pages = currentUserSettings.pages;
        signatureRequestData.tag_coordinate = currentUserSettings.tagCoordinate;
      } else if (signatureType === "request_sign") {
        // Request sign: validate signers
        if (signers.length === 0) {
          message.error("Silakan tambahkan minimal satu penandatangan");
          return;
        }

        // Validate user_id (required)
        const invalidUsers = signers.filter(signer => !signer.user_id);
        if (invalidUsers.length > 0) {
          message.error("Silakan lengkapi username/pengguna untuk semua penandatangan");
          return;
        }

        // Validate signature_pages for signers only
        const invalidSigners = signers.filter(signer =>
          signer.role_type === 'signer' && (!signer.signature_pages || signer.signature_pages.length === 0)
        );
        if (invalidSigners.length > 0) {
          message.error("Signer harus memilih minimal 1 halaman untuk ditandatangani");
          return;
        }

        // Validate all pages for all signers
        for (const signer of signers) {
          if (signer.role_type === 'signer' && signer.signature_pages) {
            validatePages(signer.signature_pages);
          }
        }

        // Prepare signers data
        const signersData = signers.map((signer, index) => ({
          user_id: signer.user_id,
          role_type: signer.role_type || "signer",
          sequence_order: signer.sequence_order || index + 1,
          signature_pages: signer.signature_pages || [], // Empty array for reviewer
          tag_coordinate: signer.tag_coordinate || "!", // Default to ! if not set
          notes: signer.notes || "",
        }));

        signatureRequestData.signers = signersData;
      }

      // Call createSignatureRequest(documentId, data, userId)
      await createSignatureRequest({
        documentId: document.id,
        data: signatureRequestData,
      });

      message.success("Pengaturan tanda tangan berhasil dibuat");
      router.push("/esign-bkd/documents");
    } catch (error) {
      console.error("Error creating signature request:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Gagal membuat pengaturan tanda tangan";
      message.error(errorMessage);
    }
  };

  const addSigner = useCallback(() => {
    setSigners(prevSigners => [
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
    setSigners(prevSigners => prevSigners.filter((signer) => signer.id !== id));
  }, []);

  const updateSigner = useCallback((id, field, value) => {
    setSigners(prevSigners =>
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
            <SettingOutlined style={{ fontSize: "20px", marginBottom: "6px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Pengaturan Tanda Tangan
            </Title>
            <MantineText style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              Atur siapa yang akan menandatangani dokumen: {document?.title || "Dokumen"}
            </MantineText>
            <MantineText style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 12, marginTop: 4, display: "block" }}>
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
                  Preview dokumen dan konfigurasikan workflow tanda tangan elektronik
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
            {/* PDF Preview */}
            <PdfPreview
              pdfBase64={pdfBase64}
              pdfLoading={pdfLoading}
              pdfError={pdfError}
              document={document}
              onRetry={fetchPdfBase64}
            />

            <Divider style={{ margin: "16px 0" }} />

            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
            >
              <Flex vertical gap="middle">
                {/* Signature Type Selection */}
                <SignatureTypeSelection
                  signatureType={signatureType}
                  onChange={setSignatureType}
                />

                {/* Self Sign Settings */}
                {signatureType === "self_sign" && (
                  <PersonalSignatureSettings
                    currentUserPages={currentUserSettings.pages}
                    tagCoordinate={currentUserSettings.tagCoordinate}
                    onChange={setCurrentUserSettings}
                    totalPages={totalPages}
                  />
                )}

                {/* Request Sign Signers List */}
                {signatureType === "request_sign" && (
                  <SignersList
                    signers={signers}
                    onAdd={addSigner}
                    onUpdate={updateSigner}
                    onRemove={removeSigner}
                    totalPages={totalPages}
                  />
                )}

                {/* Notes - Only for Self Sign */}
                {signatureType === "self_sign" && (
                  <div>
                    <Form.Item
                      label={<MantineText style={{ fontWeight: 600, color: "#6b7280" }}>Catatan</MantineText>}
                      name="notes"
                      rules={[{ max: 500, message: "Maksimal 500 karakter!" }]}
                    >
                      <Input.TextArea
                        placeholder="Catatan untuk pengajuan tanda tangan (opsional)"
                        rows={3}
                        maxLength={500}
                        showCount
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                  </div>
                )}
              </Flex>

              <Divider style={{ margin: "16px 0" }} />

              {/* Action Buttons */}
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
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SignatureSetupForm;