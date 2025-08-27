import {
  useAdminContentDetail,
  useUpdateAdminContent,
  useUpdateContentStatus,
} from "@/hooks/knowledge-management/useAdminContentDetail";
import { BookOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Grid,
  Row,
  Spin,
  Typography,
  Input,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import KnowledgeFormUserContents from "../forms/KnowledgeFormUserContents";
import ContentHeader from "./ContentHeader";
import ContentActions from "./ContentActions";
import ContentDisplay from "./ContentDisplay";
import ContentReferences from "./ContentReferences";
import ContentAttachments from "./ContentAttachments";
import ContentComments from "./ContentComments";
import StatusModal from "./StatusModal";
import InfoModal from "./InfoModal";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const KnowledgeAdminContentDetail = () => {
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

  // Hooks
  const { data: content, isLoading, isError } = useAdminContentDetail(id);
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
      <div style={{ padding: isMobile ? "12px" : "16px" }}>
        <Card
          style={{
            marginBottom: isMobile ? "16px" : "24px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #EDEFF1",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Flex>
            {/* Icon Section */}
            {!isMobile && (
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "24px",
                  minHeight: "100%",
                }}
              >
                <BookOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
              </div>
            )}

            {/* Main Content Section - Single Column Layout */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              <ContentHeader
                isMobile={isMobile}
                onInfoClick={() => setInfoModalVisible(true)}
              />

              {/* Single Column Layout */}
              <Row>
                {/* Content Column */}
                <Col xs={24}>
                  <ContentActions
                    content={content}
                    editContentMode={editContentMode}
                    isMobile={isMobile}
                    getStatusInfo={getStatusInfo}
                    onEditToggle={handleEditContentToggle}
                    onStatusModalOpen={handleStatusModalOpen}
                  />

                  {/* Last Updated Info */}
                  {content.updated_at &&
                    content.updated_at !== content.created_at && (
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            fontStyle: "italic",
                          }}
                        >
                          Terakhir diedit:{" "}
                          {dayjs(content.updated_at).format(
                            "DD MMMM YYYY, HH:mm"
                          )}
                        </Text>
                      </div>
                    )}

                  <Divider style={{ margin: "16px 0 24px 0" }} />

                  {/* Content Edit Mode or Content Display */}
                  {editContentMode ? (
                    <div style={{ marginBottom: "24px" }}>
                      <KnowledgeFormUserContents
                        initialData={content}
                        onSuccess={handleContentUpdateSuccess}
                        onCancel={handleEditContentToggle}
                        mode="admin"
                        queryKeysToInvalidate={[
                          "admin-knowledge-content-detail",
                          "fetch-knowledge-admin-contents",
                        ]}
                        showDraftButton={false}
                        showSubmitButton={true}
                        customButtonText={{
                          submit: "Perbarui Konten",
                          cancel: "Batal Edit",
                        }}
                        customTitle="Edit Konten ASNPedia"
                        customSubtitle="Perbarui informasi konten ASNPedia"
                        useUpdateMutation={() => updateContentMutation}
                      />
                    </div>
                  ) : (
                    /* Content Details - Always Visible */
                    <>
                      <ContentDisplay content={content} isMobile={isMobile} />
                      <ContentReferences content={content} />
                      <ContentAttachments content={content} />
                      <ContentComments content={content} />
                    </>
                  )}
                </Col>
              </Row>
            </div>
          </Flex>
        </Card>
      </div>

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

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-input:hover {
          border-color: #ff4500 !important;
        }
      `}</style>
    </>
  );
};

export default KnowledgeAdminContentDetail;
