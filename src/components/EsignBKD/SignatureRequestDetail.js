import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Space, Tabs, Card, Spin, Tag, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Text, Badge, Flex, Alert } from "@mantine/core";
import { useSession } from "next-auth/react";
import {
  IconCheck,
  IconX,
  IconPencil,
  IconCalendar,
  IconFileCheck,
  IconRefresh,
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  SignModal,
  RejectModal,
  ReviewModal,
  SignatureHistory,
  PdfViewer,
} from "@/components/EsignBKD";
import {
  useSignatureRequest,
  useReviewDocument,
  useSignDocument,
  useRejectDocument,
} from "@/hooks/esign-bkd";
import { previewDocumentAsBase64 } from "@/services/esign-bkd.services";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const SignatureRequestDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  // State for modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detail");

  // State for PDF
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // API hooks
  const { data: response, isLoading, refetch } = useSignatureRequest(id);
  const { mutateAsync: reviewDocument, isLoading: reviewLoading } = useReviewDocument();
  const { mutateAsync: signDocument, isLoading: signLoading } = useSignDocument();
  const { mutateAsync: rejectDocument, isLoading: rejectLoading } = useRejectDocument();

  // Extract signature request from response
  const signatureRequest = response?.data;

  // Get current user ID from session
  const currentUserId = session?.user?.id;

  // Load PDF base64 when document_id is available
  const loadPdfBase64 = useCallback(async (documentId) => {
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
  }, []);

  // Load PDF when document_id changes
  useEffect(() => {
    const documentId = signatureRequest?.document_id;
    if (documentId) {
      loadPdfBase64(documentId);
    }
  }, [signatureRequest?.document_id, loadPdfBase64]);

  // Find user detail in signature_details
  const userDetail = signatureRequest?.signature_details?.find(
    (detail) => detail.user_id === currentUserId
  );

  // Check if it's user's turn based on order
  const checkIsUserTurn = () => {
    if (!userDetail || !signatureRequest?.signature_details) return false;

    const sortedDetails = [...signatureRequest.signature_details].sort(
      (a, b) => a.order - b.order
    );

    // Find current user's order
    const currentOrder = userDetail.order;

    // Check if all previous orders are completed (signed/reviewed)
    const previousCompleted = sortedDetails
      .filter((detail) => detail.order < currentOrder)
      .every((detail) =>
        detail.status === "signed" ||
        detail.status === "reviewed"
      );

    return previousCompleted;
  };

  const isUserTurn = checkIsUserTurn();

  // Determine user's capabilities
  const canReview =
    userDetail?.role_type === "reviewer" &&
    userDetail?.status === "waiting" &&
    signatureRequest?.status === "pending" &&
    isUserTurn;

  const canSign =
    userDetail?.role_type === "signer" &&
    userDetail?.status === "waiting" &&
    signatureRequest?.status === "pending" &&
    isUserTurn;

  const canAction = canReview || canSign;

  const isWaitingTurn =
    userDetail?.status === "waiting" &&
    !isUserTurn &&
    signatureRequest?.status === "pending";

  // Handle Review Approve
  const handleReviewApprove = async (data) => {
    try {
      await reviewDocument({
        id: userDetail.id,
        data: { notes: data.notes },
      });
      setShowReviewModal(false);
      refetch();
      router.push("/esign-bkd/signature-requests");
    } catch (error) {
      console.error("Review approve error:", error);
    }
  };

  // Handle Review Reject (via ReviewModal)
  const handleReviewReject = async (data) => {
    try {
      await rejectDocument({
        id: userDetail.id,
        data: { reason: data.notes || "Ditolak oleh reviewer" },
      });
      setShowReviewModal(false);
      refetch();
      router.push("/esign-bkd/signature-requests");
    } catch (error) {
      console.error("Review reject error:", error);
    }
  };

  // Handle Sign
  const handleSign = async (data) => {
    try {
      await signDocument({
        id: userDetail.id,
        data: {
          nik: data.nik,
          passphrase: data.passphrase,
          notes: data.notes,
        },
      });
      setShowSignModal(false);
      refetch();
      router.push("/esign-bkd/signature-requests");
    } catch (error) {
      console.error("Sign error:", error);
    }
  };

  // Handle Reject
  const handleReject = async (data) => {
    try {
      await rejectDocument({
        id: userDetail.id,
        data: { reason: data.reason },
      });
      setShowRejectModal(false);
      refetch();
      router.push("/esign-bkd/signature-requests");
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text c="dimmed">Memuat data...</Text>
        </div>
      </div>
    );
  }

  if (!signatureRequest) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Alert
          icon={<IconX size={16} />}
          title="Dokumen Tidak Ditemukan"
          color="red"
          variant="light"
        >
          Permintaan tanda tangan tidak ditemukan atau Anda tidak memiliki akses.
        </Alert>
      </Card>
    );
  }

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "orange", icon: <IconClock size={12} />, text: "PENDING" },
      completed: { color: "green", icon: <IconCircleCheck size={12} />, text: "SELESAI" },
      rejected: { color: "red", icon: <IconX size={12} />, text: "DITOLAK" },
      cancelled: { color: "default", icon: <IconX size={12} />, text: "DIBATALKAN" },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <Badge
        color={config.color}
        variant="light"
        size="sm"
        leftSection={<div style={{ display: "flex", alignItems: "center" }}>{config.icon}</div>}
        styles={{
          section: { display: "flex", alignItems: "center" },
          label: { display: "flex", alignItems: "center" },
        }}
      >
        {config.text}
      </Badge>
    );
  };

  // Render action buttons based on user role and status
  const renderActionButtons = () => {
    // User is Reviewer and can review
    if (canReview) {
      return (
        <Space>
          <Button
            type="primary"
            icon={<IconCheck size={16} />}
            onClick={() => setShowReviewModal(true)}
            style={{
              background: "#52c41a",
              borderColor: "#52c41a",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Setujui
          </Button>
          <Button
            danger
            icon={<IconX size={16} />}
            onClick={() => setShowRejectModal(true)}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Tolak
          </Button>
        </Space>
      );
    }

    // User is Signer and can sign
    if (canSign) {
      return (
        <Space>
          <Button
            type="primary"
            icon={<IconPencil size={16} />}
            onClick={() => setShowSignModal(true)}
            style={{
              background: "#FF4500",
              borderColor: "#FF4500",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Tanda Tangan
          </Button>
          <Button
            danger
            icon={<IconX size={16} />}
            onClick={() => setShowRejectModal(true)}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Tolak
          </Button>
        </Space>
      );
    }

    return null;
  };

  const tabItems = [
    {
      key: "detail",
      label: "Detail Dokumen",
      children: (
        <div style={{ padding: "16px 0" }}>
          {pdfLoading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text c="dimmed">Memuat dokumen...</Text>
              </div>
            </div>
          ) : pdfError ? (
            <div>
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Gagal Memuat Dokumen"
                color="red"
                variant="light"
                withCloseButton={false}
              >
                {pdfError}
              </Alert>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <Button size="small" onClick={() => loadPdfBase64(signatureRequest?.document_id)}>
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : pdfBase64 ? (
            <PdfViewer
              pdfBase64={pdfBase64}
              title={signatureRequest.document?.title || "Dokumen PDF"}
            />
          ) : (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Dokumen Tidak Tersedia"
              color="yellow"
              variant="light"
            >
              Dokumen tidak dapat ditampilkan.
            </Alert>
          )}
        </div>
      ),
    },
    {
      key: "history",
      label: "Riwayat",
      children: <SignatureHistory requestId={signatureRequest.id} />,
    },
  ];

  return (
    <div>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: "#FF4500",
            color: "white",
            padding: 24,
            textAlign: "center",
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 0 -24px",
          }}
        >
          <IconFileCheck size={24} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            {signatureRequest.document?.title || "Detail Permintaan TTE"}
          </div>
          <Text size="sm" style={{ color: "rgba(255,255,255,0.9)" }}>
            {signatureRequest.document?.document_code}
          </Text>
        </div>

        {/* Action Buttons - Only show if user is part of workflow */}
        {userDetail && (
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Flex align="center" justify="center">
              {canAction ? (
                renderActionButtons()
              ) : (
                <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
                  {isWaitingTurn && (
                    <Alert
                      icon={<IconClock size={16} />}
                      title="Menunggu Giliran"
                      color="yellow"
                      variant="light"
                    >
                      Anda harus menunggu step sebelumnya diselesaikan terlebih dahulu.
                    </Alert>
                  )}
                  {(userDetail?.status === "signed" || userDetail?.status === "reviewed") && (
                    <Alert
                      icon={<IconCircleCheck size={16} />}
                      title="Anda Sudah Menyelesaikan Aksi"
                      color="green"
                      variant="light"
                    >
                      Dokumen telah {userDetail.status === "signed" ? "ditandatangani" : "direview"} pada{" "}
                      {dayjs(userDetail.signed_at || userDetail.reviewed_at).format("DD MMMM YYYY, HH:mm")}
                    </Alert>
                  )}
                  {userDetail?.status === "rejected" && (
                    <Alert
                      icon={<IconX size={16} />}
                      title="Anda Telah Menolak Dokumen"
                      color="red"
                      variant="light"
                    >
                      Dokumen ini telah Anda tolak sebelumnya.
                    </Alert>
                  )}
                </div>
              )}
            </Flex>
          </div>
        )}

        {/* Info Section - Compact */}
        <div style={{ padding: "20px 0", borderBottom: "1px solid #f0f0f0" }}>
          <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
            <Flex align="center" gap={12}>
              <Avatar
                src={signatureRequest.creator?.image}
                size={36}
                style={{
                  border: "2px solid #f0f0f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {!signatureRequest.creator?.image && <UserOutlined />}
              </Avatar>
              <Flex align="center" gap={8}>
                <Text size="xs" fw={600}>
                  {signatureRequest.creator?.username || "-"}
                </Text>
                <Text size="xs" c="dimmed">•</Text>
                <Flex align="center" gap={6}>
                  <IconCalendar size={12} style={{ color: "#999" }} />
                  <Text size="xs" c="dimmed">
                    {dayjs(signatureRequest.created_at).format("DD.MM.YYYY • HH:mm")}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex gap={12} wrap="wrap">
              {getStatusBadge(signatureRequest.status)}
              <Badge
                color="blue"
                variant="light"
                size="sm"
                leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconRefresh size={12} /></div>}
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: { display: "flex", alignItems: "center" },
                }}
              >
                {signatureRequest.request_type === "sequential" ? "SEQUENTIAL" : "PARALLEL"}
              </Badge>
              <Badge
                color="cyan"
                variant="light"
                size="sm"
                leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconFileCheck size={12} /></div>}
                styles={{
                  section: { display: "flex", alignItems: "center" },
                  label: { display: "flex", alignItems: "center" },
                }}
              >
                {signatureRequest.type === "self_sign" ? "TANDA TANGAN SENDIRI" : "PERMINTAAN TANDA TANGAN"}
              </Badge>
            </Flex>
          </Flex>

          {/* Notes Section */}
          {signatureRequest.notes && (
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
                Catatan:
              </Text>
              <Text size="xs" style={{ lineHeight: 1.6 }}>
                {signatureRequest.notes}
              </Text>
            </div>
          )}
        </div>

        {/* Workflow Progress - Compact */}
        {signatureRequest.signature_details && signatureRequest.signature_details.length > 0 && (
          <div style={{ padding: "20px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Text fw={600} size="sm" c="dimmed" style={{ marginBottom: 12 }}>
              Progress Penandatanganan
            </Text>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {signatureRequest.signature_details.map((detail, index) => {
                const statusColor = {
                  waiting: "orange",
                  signed: "green",
                  reviewed: "blue",
                  rejected: "red",
                }[detail.status] || "default";

                return (
                  <Flex key={detail.id} align="center" justify="space-between">
                    <Flex align="center" gap={8}>
                      <Tag color={statusColor} style={{ margin: 0 }}>
                        {index + 1}
                      </Tag>
                      <Text size="xs" fw={500}>
                        {detail.user?.username}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({detail.role_type === "signer" ? "Penanda Tangan" : "Reviewer"})
                      </Text>
                    </Flex>
                    <Badge
                      color={statusColor}
                      variant="light"
                      size="sm"
                    >
                      {detail.status?.toUpperCase()}
                    </Badge>
                  </Flex>
                );
              })}
            </Space>
          </div>
        )}


        {/* Tabs */}
        <div style={{ marginTop: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
          />
        </div>
      </Card>

      {/* Modals */}
      <ReviewModal
        open={showReviewModal}
        onCancel={() => setShowReviewModal(false)}
        onApprove={handleReviewApprove}
        onReject={handleReviewReject}
        document={signatureRequest.document}
        loading={reviewLoading || rejectLoading}
      />

      <SignModal
        open={showSignModal}
        onCancel={() => setShowSignModal(false)}
        onSign={handleSign}
        loading={signLoading}
      />

      <RejectModal
        open={showRejectModal}
        onCancel={() => setShowRejectModal(false)}
        onReject={handleReject}
        loading={rejectLoading}
      />
    </div>
  );
};

export default SignatureRequestDetail;