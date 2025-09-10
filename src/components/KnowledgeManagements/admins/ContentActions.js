import { EditOutlined, ExclamationCircleOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Tag, Typography, Badge, Modal, Form, Input, message } from "antd";
import { useAdminContentRevisions, useApproveRevision } from "@/hooks/knowledge-management/useRevisions";
import { useState } from "react";

const { Text } = Typography;
const { TextArea } = Input;

const ContentActions = ({
  content,
  editContentMode,
  isMobile,
  getStatusInfo,
  onEditToggle,
  onStatusModalOpen,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [form] = Form.useForm();

  // Get revisions for this content to check for pending revisions (admin endpoint)
  const { data: revisionData, refetch } = useAdminContentRevisions(content?.id);
  
  // Extract pending count from structured response
  const pendingCount = revisionData?.pending_count || 0;
  const hasPendingRevisions = pendingCount > 0;

  // Admin actions for approve/reject
  const approveRevisionMutation = useApproveRevision();

  // Check if content is a pending revision
  const isPendingRevision = content?.status === "pending_revision";

  // Handle approve/reject actions
  const handleAction = (action) => {
    setActionType(action);
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    try {
      const values = await form.validateFields();
      
      await approveRevisionMutation.mutateAsync({
        versionId: content.id,
        action: actionType,
        rejectionReason: values.reason || "",
      });

      setModalVisible(false);
      form.resetFields();
      setActionType(null);
      
      // Refresh page or redirect after successful action
      window.location.reload();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      // API errors are handled by the mutation
    }
  };

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "16px" }}
      >
      <Space wrap size="small">
        {/* Status */}
        <Text strong style={{ fontSize: "13px" }}>
          Status:
        </Text>
        <Tag color={getStatusInfo(content.status).color} size="small">
          {getStatusInfo(content.status).label}
        </Tag>

        {/* Category */}
        {content.category && (
          <>
            <Text strong style={{ fontSize: "13px" }}>
              Kategori:
            </Text>
            <Tag color="orange" size="small">
              {content.category.name}
            </Tag>
          </>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <>
            <Text strong style={{ fontSize: "13px" }}>
              Tags:
            </Text>
            {content.tags.slice(0, 2).map((tag, index) => (
              <Tag key={index} size="small" style={{ fontSize: "11px" }}>
                {tag}
              </Tag>
            ))}
            {content.tags.length > 2 && (
              <Tag size="small" style={{ fontSize: "11px" }}>
                +{content.tags.length - 2}
              </Tag>
            )}
          </>
        )}

        {/* Pending Revisions Alert */}
        {hasPendingRevisions && (
          <>
            <Tag 
              color="orange" 
              icon={<ExclamationCircleOutlined />}
              style={{ 
                fontSize: "11px", 
                display: "flex", 
                alignItems: "center", 
                gap: "4px" 
              }}
            >
              {pendingCount} Revisi Pending
            </Tag>
          </>
        )}
      </Space>
      <Space size="small">
        {isPendingRevision ? (
          // Show approve/reject buttons for pending revisions
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleAction("approve")}
              loading={approveRevisionMutation.isLoading}
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              {isMobile ? "Setujui" : "Setujui Revisi"}
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => handleAction("reject")}
              loading={approveRevisionMutation.isLoading}
            >
              {isMobile ? "Tolak" : "Tolak Revisi"}
            </Button>
          </>
        ) : (
          // Show normal edit/status buttons for published content
          <>
            <Button
              type={editContentMode ? "default" : "primary"}
              icon={<EditOutlined />}
              size="small"
              onClick={onEditToggle}
              style={
                editContentMode
                  ? {}
                  : {
                      backgroundColor: "#FF4500",
                      borderColor: "#FF4500",
                    }
              }
            >
              {editContentMode ? "Batal" : isMobile ? "Edit" : "Edit Konten"}
            </Button>
            <Button size="small" onClick={onStatusModalOpen}>
              {isMobile ? "Status" : "Ubah Status"}
            </Button>
          </>
        )}
      </Space>
    </Flex>

      {/* Approve/Reject Modal */}
      <Modal
        title={
          actionType === "approve"
            ? "Setujui Revisi"
            : "Tolak Revisi"
        }
        open={modalVisible}
        onOk={handleConfirmAction}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setActionType(null);
        }}
        confirmLoading={approveRevisionMutation.isLoading}
        okText={actionType === "approve" ? "Setujui" : "Tolak"}
        okButtonProps={{
          danger: actionType === "reject",
        }}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: "16px" }}>
            <Text>
              Apakah Anda yakin ingin{" "}
              {actionType === "approve" ? "menyetujui" : "menolak"} revisi ini?
            </Text>
            {actionType === "approve" && (
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Revisi yang disetujui akan menggantikan konten yang ada saat ini.
                </Text>
              </div>
            )}
          </div>
          
          <Form.Item
            label={
              actionType === "approve"
                ? "Catatan Persetujuan (Opsional)"
                : "Alasan Penolakan"
            }
            name="reason"
            rules={actionType === "reject" ? [
              { required: true, message: "Alasan penolakan wajib diisi" }
            ] : []}
          >
            <TextArea
              rows={4}
              placeholder={
                actionType === "approve" 
                  ? "Tambahkan catatan untuk author (opsional)..." 
                  : "Jelaskan mengapa revisi ini ditolak..."
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ContentActions;