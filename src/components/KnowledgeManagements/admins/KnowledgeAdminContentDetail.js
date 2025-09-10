import {
  useAdminContentDetail,
  useUpdateAdminContent,
  useUpdateContentStatus,
} from "@/hooks/knowledge-management/useAdminContentDetail";
import { SettingOutlined } from "@ant-design/icons";
import { Card, Empty, Grid, Input, Spin, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import KnowledgeFormAdminContents from "../forms/KnowledgeFormAdminContents";
import ContentActions from "./ContentActions";
import ContentRevisions from "./ContentRevisions";
import InfoModal from "./InfoModal";
import StatusModal from "./StatusModal";
// Import user components untuk tampilan yang sama seperti user
import KnowledgeContentHeader from "../components/KnowledgeContentHeader";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

/**
 * Admin Content Detail Component with User-like Layout
 * Features:
 * - Clean user-style presentation
 * - Preserved admin functionality (edit, status change, etc.)
 * - Anchor navigation support with section IDs
 * - Responsive design
 */
const KnowledgeAdminContentDetail = ({
  data: externalData = null,
  isLoading: externalLoading = false,
  isAdminView = true,
}) => {
  const router = useRouter();
  const { id } = router.query;
  const [editContentMode, setEditContentMode] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Handler functions
  const handleContentUpdateSuccess = () => {
    setEditContentMode(false); // Toggle back to read mode after successful update
  };

  // Use external data if provided, otherwise fetch from hooks
  // This allows the component to work both standalone and with parent data
  const {
    data: hookData,
    isLoading: hookLoading,
    isError: hookError,
  } = useAdminContentDetail(id, {
    enabled: !externalData && !!id,
  });

  const content = externalData || hookData;
  const isLoading = externalLoading || hookLoading;
  const isError = hookError;

  const updateContentMutation = useUpdateAdminContent(
    handleContentUpdateSuccess
  );
  const updateStatusMutation = useUpdateContentStatus();

  // Status options
  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "#d9d9d9",
      description: "Konten sedang menunggu review dan belum dipublikasikan",
    },
    {
      value: "published",
      label: "Published",
      color: "#52c41a",
      description: "Konten telah direview dan dipublikasikan untuk umum",
    },
    {
      value: "rejected",
      label: "Rejected",
      color: "#ff4d4f",
      description:
        "Konten ditolak karena tidak memenuhi standar atau kebijakan",
    },
    {
      value: "archived",
      label: "Archived",
      color: "#fa8c16",
      description:
        "Konten disimpan sebagai arsip dan tidak ditampilkan kepada umum",
    },
  ];

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus && selectedStatus !== content.status) {
      await updateStatusMutation.mutateAsync({
        id: content.id,
        payload: {
          status: selectedStatus,
          reason: statusReason,
        },
      });
      setStatusModalVisible(false); // Close modal after successful update
      setSelectedStatus(null);
      setStatusReason("");
    }
  };

  const handleEditContentToggle = () => {
    setEditContentMode(!editContentMode);
  };

  const handleStatusModalOpen = () => {
    setSelectedStatus(content?.status);
    setStatusReason(content?.reason || "");
    setStatusModalVisible(true);
  };

  const handleStatusModalClose = () => {
    setStatusModalVisible(false);
    setSelectedStatus(null);
    setStatusReason("");
  };

  if (!isClient) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Empty description="Konten tidak ditemukan atau gagal dimuat" />
      </div>
    );
  }

  return (
    <>
      {/* Content Display Section - menggunakan komponen yang sama seperti user */}
      <div id="content-section">
        {content && !editContentMode && (
          <KnowledgeContentHeader
            content={content}
            // Admin tidak perlu like/bookmark functionality, tapi bisa ditambahkan jika perlu
            onLike={() => {}}
            onBookmark={() => {}}
            isLiked={false}
            isBookmarked={false}
            isLiking={false}
            isBookmarking={false}
            disableInteractions={true} // Disable user interactions untuk admin
            showOwnerActions={false} // Admin tidak perlu owner actions
            // Admin-specific actions bisa ditambahkan jika diperlukan
            onSubmitForReview={() => {}}
            isSubmittingForReview={false}
            onDelete={() => {}}
            isDeleting={false}
            onCreateRevision={() => {}}
            isCreatingRevision={false}
            onViewRevisions={() => {}}
            revisions={[]}
          />
        )}
      </div>

      {/* Edit Mode - menggunakan form admin khusus */}
      {editContentMode && (
        <div id="content-edit" style={{ marginBottom: "24px" }}>
          <KnowledgeFormAdminContents
            initialData={content}
            onSuccess={handleContentUpdateSuccess}
            onCancel={handleEditContentToggle}
            queryKeysToInvalidate={[
              "admin-knowledge-content-detail",
              "fetch-knowledge-admin-contents",
            ]}
          />
        </div>
      )}

      {/* Admin Actions Card - hanya muncul saat tidak edit mode */}
      {!editContentMode && (
        <Card
          id="content-status"
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            border: "1px solid #EDEFF1",
            backgroundColor: "#FAFAFA",
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SettingOutlined style={{ color: "#FF4500" }} />
              <Text strong>Admin Actions</Text>
            </div>
          }
          styles={{ body: { padding: "24px" } }}
        >
          <ContentActions
            content={content}
            editContentMode={editContentMode}
            isMobile={isMobile}
            getStatusInfo={getStatusInfo}
            onEditToggle={handleEditContentToggle}
            onStatusModalOpen={handleStatusModalOpen}
            isAdminView={isAdminView}
          />

          {/* Last Updated Info */}
          {content.updated_at && content.updated_at !== content.created_at && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #F0F0F0",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Terakhir diedit:{" "}
                {dayjs(content.updated_at).format("DD MMMM YYYY, HH:mm")}
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Content Revisions - only show when not in edit mode */}
      {!editContentMode && (
        <ContentRevisions contentId={content?.id} isMobile={isMobile} />
      )}

      <StatusModal
        visible={statusModalVisible}
        onCancel={handleStatusModalClose}
        onOk={handleStatusUpdate}
        content={content}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusReason={statusReason}
        setStatusReason={setStatusReason}
        getStatusInfo={getStatusInfo}
        statusOptions={statusOptions}
        loading={updateStatusMutation.isPending}
      />

      <InfoModal
        visible={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        content={content}
      />

      {/* Admin Detail Styles - Clean and simple */}
      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          border-radius: 12px !important;
          border: 1px solid #edeff1 !important;
        }

        .ant-card:hover {
          border-color: #d9d9d9 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px) !important;
        }

        /* Orange theme for admin actions */
        .ant-btn-primary {
          background-color: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-btn-primary:hover {
          background-color: #e63e00 !important;
          border-color: #e63e00 !important;
        }

        /* Smooth scrolling for anchor links */
        html {
          scroll-behavior: smooth;
        }

        /* Section spacing */
        #content-info,
        #content-status,
        #content-revisions,
        #content-body,
        #content-attachments,
        #content-references,
        #content-comments {
          scroll-margin-top: 80px;
        }
      `}</style>
    </>
  );
};

export default KnowledgeAdminContentDetail;
