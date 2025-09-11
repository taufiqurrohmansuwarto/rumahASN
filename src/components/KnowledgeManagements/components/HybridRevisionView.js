import { useState } from "react";
import { Button, Card, Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { KnowledgeUserContentDetail } from "../";
import { KnowledgeFormUserRevisions } from "../revisions";
import { useRevisionDetails } from "@/hooks/knowledge-management/useRevisions";

const { Text } = Typography;

const HybridRevisionView = ({
  revisionData,
  contentId,
  onSuccess = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Use revision details hook for refetching
  const revisionDetailsQuery = useRevisionDetails(revisionData?.id, contentId);

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
                Revisi ini masih dalam status draft dan dapat diedit
              </Text>
            </div>
            <Button
              type={isEditing ? "default" : "primary"}
              icon={<EditOutlined />}
              onClick={handleEditToggle}
            >
              {isEditing ? "Batal" : "Edit Revisi"}
            </Button>
          </Flex>
        </Card>
      )}

      {/* Content Display */}
      <KnowledgeUserContentDetail
        data={revisionData}
        disableInteractions={true}
        showOwnerActions={false}
      />
    </div>
  );
};

export default HybridRevisionView;
