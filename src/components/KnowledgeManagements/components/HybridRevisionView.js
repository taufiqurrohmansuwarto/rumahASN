import { useState } from "react";
import { Button, Card, Flex, Typography, Modal, Input, message } from "antd";
import { EditOutlined, SendOutlined } from "@ant-design/icons";
import { KnowledgeUserContentDetail } from "../";
import { KnowledgeFormUserRevisions } from "../revisions";
import { useRevisionDetails, useSubmitRevision } from "@/hooks/knowledge-management/useRevisions";

const { Text } = Typography;
const { TextArea } = Input;

const HybridRevisionView = ({
  revisionData,
  contentId,
  onSuccess = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");

  // Use revision details hook for refetching
  const revisionDetailsQuery = useRevisionDetails(revisionData?.id, contentId);
  
  // Submit revision hook
  const submitRevisionMutation = useSubmitRevision();

  // Check if revision can be edited (only draft status)
  const canEdit = revisionData?.status === 'draft';

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSuccess = (data) => {
    setIsEditing(false);
    // Refetch revision details to get updated data
    revisionDetailsQuery.refetch();
    onSuccess(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Handle submit revision
  const handleSubmitRevision = () => {
    setIsSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    try {
      await submitRevisionMutation.mutateAsync({
        contentId,
        versionId: revisionData?.id,
        submitNotes,
      });
      
      setIsSubmitModalVisible(false);
      setSubmitNotes("");
      
      // Refetch revision details to get updated status
      revisionDetailsQuery.refetch();
      onSuccess({ message: "Revisi berhasil disubmit untuk review" });
      
    } catch (error) {
      console.error("Error submitting revision:", error);
    }
  };

  const handleSubmitCancel = () => {
    setIsSubmitModalVisible(false);
    setSubmitNotes("");
  };

  // If editing and can edit, show the cancel button + form
  if (isEditing && canEdit) {
    return (
      <div>
        {/* Cancel Button for edit mode */}
        <Card
          style={{
            marginBottom: "16px",
            border: "1px solid #e8f4f8",
            backgroundColor: "#f6ffed",
          }}
        >
          <Flex justify="space-between" align="center">
            <div>
              <Text strong style={{ color: "#389e0d" }}>
                Edit Revisi v{revisionData.version}
              </Text>
              <br />
              <Text style={{ fontSize: "12px", color: "#666" }}>
                Mode edit aktif - perubahan akan disimpan sebagai draft
              </Text>
            </div>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={handleCancel}
            >
              Batal Edit
            </Button>
          </Flex>
        </Card>

        {/* Form */}
        <KnowledgeFormUserRevisions
          revisionData={revisionData}
          contentId={contentId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Otherwise show the content detail with edit button if applicable
  return (
    <div>
      {/* Edit Button for draft revisions */}
      {canEdit && !isEditing && (
        <Card
          style={{
            marginBottom: "16px",
            border: "1px solid #e8f4f8",
            backgroundColor: "#f6ffed",
          }}
        >
          <Flex justify="space-between" align="center">
            <div>
              <Text strong style={{ color: "#389e0d" }}>
                Draft Revisi v{revisionData.version}
              </Text>
              <br />
              <Text style={{ fontSize: "12px", color: "#666" }}>
                Revisi ini masih dalam status draft dan dapat diedit atau disubmit untuk review
              </Text>
            </div>
            <Flex gap="small">
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={handleEditToggle}
              >
                Edit Revisi
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitRevision}
                loading={submitRevisionMutation.isLoading}
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                }}
              >
                Submit untuk Review
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Content Display */}
      <KnowledgeUserContentDetail
        data={revisionData}
        disableInteractions={true}
        showOwnerActions={false}
      />

      {/* Submit Confirmation Modal */}
      <Modal
        title="Submit Revisi untuk Review"
        open={isSubmitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={handleSubmitCancel}
        confirmLoading={submitRevisionMutation.isLoading}
        okText="Submit"
        cancelText="Batal"
        okButtonProps={{
          style: {
            backgroundColor: "#FF4500",
            borderColor: "#FF4500",
          },
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text style={{ display: "block", marginBottom: "8px" }}>
            Anda akan mengirim revisi v{revisionData?.version} untuk direview oleh admin.
          </Text>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            Setelah disubmit, revisi tidak dapat diedit hingga mendapat feedback dari admin.
          </Text>
        </div>
        
        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Catatan Submit (Opsional):
          </Text>
          <TextArea
            rows={4}
            placeholder="Tambahkan catatan untuk reviewer mengenai perubahan yang dibuat..."
            value={submitNotes}
            onChange={(e) => setSubmitNotes(e.target.value)}
            style={{ borderRadius: "6px" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default HybridRevisionView;
