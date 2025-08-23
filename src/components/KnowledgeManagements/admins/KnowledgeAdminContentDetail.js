import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  useAdminContentDetail,
  useUpdateAdminContent,
  useUpdateContentStatus,
} from "@/hooks/knowledge-management/useAdminContentDetail";
import { Comment } from "@ant-design/compatible";
import {
  BookOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Grid,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useState } from "react";
import KnowledgeFormUserContents from "../forms/KnowledgeFormUserContents";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const KnowledgeAdminContentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [editContentMode, setEditContentMode] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusReason, setStatusReason] = useState("");

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Handler functions
  const handleContentUpdateSuccess = () => {
    setEditContentMode(false); // Toggle back to read mode after successful update
  };

  // Hooks
  const { data: content, isLoading, isError } = useAdminContentDetail(id);
  const updateContentMutation = useUpdateAdminContent(handleContentUpdateSuccess);
  const updateStatusMutation = useUpdateContentStatus();

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft", color: "#d9d9d9" },
    { value: "published", label: "Published", color: "#52c41a" },
    { value: "rejected", label: "Rejected", color: "#ff4d4f" },
    { value: "archived", label: "Archived", color: "#fa8c16" },
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

            {/* Content Section */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  📋 Detail Konten Knowledge
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  Kelola konten dan status publikasi knowledge
                </Text>
              </div>

              {/* Action Buttons - Top Right */}
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: "24px" }}
              >
                <div>
                  <Text strong>Status: </Text>
                  <Tag
                    color={getStatusInfo(content.status).color}
                    style={{ marginLeft: "8px" }}
                  >
                    {getStatusInfo(content.status).label}
                  </Tag>
                  {/* Category */}
                  {content.category && (
                    <>
                      <Text strong style={{ marginLeft: "16px" }}>
                        Kategori:{" "}
                      </Text>
                      <Tag color="orange" style={{ marginLeft: "4px" }}>
                        {content.category.name}
                      </Tag>
                    </>
                  )}
                  {/* Tags */}
                  {content.tags && content.tags.length > 0 && (
                    <>
                      <Text strong style={{ marginLeft: "16px" }}>
                        Tags:{" "}
                      </Text>
                      <Space style={{ marginLeft: "4px" }}>
                        {content.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index} size="small">
                            {tag}
                          </Tag>
                        ))}
                        {content.tags.length > 3 && (
                          <Tag size="small">+{content.tags.length - 3}</Tag>
                        )}
                      </Space>
                    </>
                  )}
                </div>
                <Space>
                  <Button
                    type={editContentMode ? "default" : "primary"}
                    icon={<EditOutlined />}
                    onClick={handleEditContentToggle}
                  >
                    {editContentMode
                      ? "Batal Edit"
                      : isMobile
                      ? "Edit"
                      : "Edit Konten"}
                  </Button>
                  <Button onClick={handleStatusModalOpen}>
                    {isMobile ? "Status" : "Ubah Status"}
                  </Button>
                </Space>
              </Flex>

              {/* Content Edit Mode */}
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
                    customTitle="Edit Konten Knowledge"
                    customSubtitle="Perbarui informasi konten knowledge"
                    useUpdateMutation={() => updateContentMutation}
                  />
                </div>
              ) : (
                /* Content Details - Always Visible */
                <div style={{ marginBottom: "24px" }}>
                  {/* Content Title */}
                  <Title
                    level={isMobile ? 4 : 3}
                    style={{ marginBottom: "16px" }}
                  >
                    {content.title}
                  </Title>
                  <Comment
                    avatar={
                      <Avatar
                        src={content.author?.image}
                        icon={<UserOutlined />}
                      />
                    }
                    author={content.author?.username}
                    datetime={dayjs(content.created_at).format(
                      "DD MMM YYYY, HH:mm"
                    )}
                    actions={[
                      <Tooltip title="Dilihat" key="eye">
                        <span>
                          <EyeOutlined /> {content.views_count || 0}
                        </span>
                      </Tooltip>,
                      <Tooltip title="Like" key="like">
                        <span>
                          <LikeOutlined /> {content.likes_count || 0}
                        </span>
                      </Tooltip>,
                      <Tooltip title="Komentar" key="message">
                        <span>
                          <MessageOutlined /> {content.comments_count || 0}
                        </span>
                      </Tooltip>,
                    ]}
                    content={
                      <div
                        style={{
                          padding: isMobile ? "16px 12px" : "24px 16px",
                          backgroundColor: "#F8F9FA",
                          borderRadius: "8px",
                          border: "1px solid #EDEFF1",
                          marginTop: "12px",
                          lineHeight: "1.8",
                          fontSize: isMobile ? "14px" : "15px",
                          color: "#1A1A1B",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <ReactMarkdownCustom withCustom={false}>
                          {content?.content}
                        </ReactMarkdownCustom>
                      </div>
                    }
                  />
                </div>
              )}
            </div>
          </Flex>
        </Card>
      </div>

      {/* Status Modal */}
      <Modal
        title="Ubah Status Konten"
        open={statusModalVisible}
        onCancel={handleStatusModalClose}
        footer={null}
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text
              style={{ display: "block", marginBottom: "8px", color: "#666" }}
            >
              Status saat ini:{" "}
              <Tag color={getStatusInfo(content.status).color}>
                {getStatusInfo(content.status).label}
              </Tag>
            </Text>
            <Text style={{ display: "block", marginBottom: "8px" }}>
              Pilih status baru:
            </Text>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%", marginBottom: "16px" }}
              size="large"
              placeholder="Pilih status baru"
              options={statusOptions.map((option) => ({
                ...option,
                label: (
                  <span>
                    <Tag
                      color={option.color}
                      size="small"
                      style={{ marginRight: "8px" }}
                    >
                      ●
                    </Tag>
                    {option.label}
                  </span>
                ),
              }))}
            />
          </div>

          {/* Reason Field */}
          <div>
            <Text style={{ display: "block", marginBottom: "8px" }}>
              Alasan perubahan status{" "}
              {selectedStatus && selectedStatus !== content.status
                ? "(Wajib diisi)"
                : "(Opsional)"}
              :
            </Text>
            <TextArea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder={`Jelaskan alasan mengubah status dari ${getStatusInfo(
                content.status
              ).label.toLowerCase()} ke ${
                selectedStatus
                  ? getStatusInfo(selectedStatus).label.toLowerCase()
                  : "status baru"
              }...`}
              rows={4}
              maxLength={500}
              showCount
              style={{ width: "100%" }}
            />
          </div>

          <Flex justify="space-between" align="center">
            <Button onClick={handleStatusModalClose}>Batal</Button>
            <Button
              type="primary"
              onClick={handleStatusUpdate}
              loading={updateStatusMutation.isPending}
              disabled={
                !selectedStatus ||
                selectedStatus === content.status ||
                (selectedStatus !== content.status && !statusReason.trim())
              }
            >
              Simpan Status
            </Button>
          </Flex>
        </Space>
      </Modal>

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
