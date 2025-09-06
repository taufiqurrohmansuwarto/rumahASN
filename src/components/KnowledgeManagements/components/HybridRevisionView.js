import { useState } from "react";
import { Button, Card, Flex, Tag, Alert, Space, Modal } from "antd";
import { EyeOutlined, EditOutlined, BranchesOutlined, SendOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useSubmitRevision, useUpdateRevision } from "@/hooks/knowledge-management/useRevisions";
import { KnowledgeUserContentDetail, KnowledgeFormUserContents } from "../";

const HybridRevisionView = ({ 
  revisionData, 
  contentId, 
  versionId,
  currentUser
}) => {
  const [mode, setMode] = useState("view"); // "view" or "edit"
  
  // Revision hooks
  const submitRevisionMutation = useSubmitRevision();
  const updateRevisionMutation = useUpdateRevision();
  
  // Custom update mutation for revision
  const customUpdateMutation = {
    mutate: (formData) => {
      updateRevisionMutation.mutate({
        contentId,
        versionId,
        data: formData
      });
    },
    isLoading: updateRevisionMutation.isLoading
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: "orange", text: "Draft" },
      pending_revision: { color: "blue", text: "Pending Review" },
      published: { color: "green", text: "Published" },
      revision_rejected: { color: "red", text: "Rejected" }
    };
    return configs[status] || configs.draft;
  };

  const formatVersion = (version) => {
    return version ? `v${version}` : "Draft";
  };

  // Transform revision data structure for KnowledgeUserContentDetail
  // Handle both getRevisionDetails format {revision: {...}} and getMyRevisions format {revisions: [...]}
  const currentRevision = revisionData?.revision || 
                         (revisionData?.revisions && revisionData.revisions.find(r => r.id === versionId));
  
  const transformedRevisionData = currentRevision ? {
    ...currentRevision,
    // Ensure compatibility with KnowledgeUserContentDetail expected structure
  } : null;

  const canEdit = currentRevision?.status === 'draft' && 
                  currentRevision?.author_id === currentUser?.id;
  
  
  // Handle submit for review
  const handleSubmitForReview = () => {
    Modal.confirm({
      title: 'Submit Revisi untuk Review',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Apakah Anda yakin ingin mengirim revisi ini untuk direview?</p>
          <p style={{ color: '#666', fontSize: '13px' }}>
            Setelah disubmit, revisi akan masuk ke dalam antrian review dan tidak dapat diedit hingga proses review selesai.
          </p>
        </div>
      ),
      okText: 'Ya, Submit untuk Review',
      cancelText: 'Batal',
      okType: 'primary',
      onOk: () => {
        submitRevisionMutation.mutate({
          contentId,
          versionId,
          submitNotes: "Revision submitted for admin review"
        });
      },
    });
  };


  return (
    <div>
      {/* Mode Toggle Header */}
      {revisionData && (
        <Card 
          size="small" 
          style={{ marginBottom: "16px", backgroundColor: "#f8f9fa" }}
          styles={{ body: { padding: "12px 16px" } }}
        >
          <Flex justify="space-between" align="center">
            {/* Left: Revision Info */}
            <Flex align="center" gap={12}>
              <BranchesOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
              <span style={{ fontWeight: 500 }}>
                Revisi {formatVersion(currentRevision?.current_version)}
              </span>
              <Tag color={getStatusConfig(currentRevision?.status).color}>
                {getStatusConfig(currentRevision?.status).text}
              </Tag>
            </Flex>

            {/* Right: Action Buttons */}
            <Space>
              {canEdit && (
                <>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    type={mode === "view" ? "primary" : "default"}
                    onClick={() => setMode("view")}
                  >
                    Lihat
                  </Button>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    type={mode === "edit" ? "primary" : "default"}
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </Button>
                  
                  {/* Submit button - sama level dengan toggle buttons */}
                  {mode === "view" && (
                    <Button
                      size="small"
                      icon={<SendOutlined />}
                      type="default"
                      style={{ 
                        borderColor: "#52c41a", 
                        color: "#52c41a"
                      }}
                      loading={submitRevisionMutation.isLoading}
                      onClick={handleSubmitForReview}
                    >
                      Submit untuk Review
                    </Button>
                  )}
                </>
              )}
            </Space>
          </Flex>
          
          {/* Additional Info */}
          {currentRevision?.submitNotes && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
              💬 <em>{currentRevision.submitNotes}</em>
            </div>
          )}
        </Card>
      )}

      {/* Content Based on Mode */}
      {mode === "view" ? (
        // VIEW MODE: Use KnowledgeUserContentDetail
        <>
          {!canEdit && (
            <Alert
              message="Mode Tampilan"
              description="Revisi ini sedang dalam mode tampilan saja. Edit tidak tersedia untuk status ini."
              type="info"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}
          
          {transformedRevisionData && (
            <KnowledgeUserContentDetail
              data={transformedRevisionData}
              disableInteractions={true}
              showOwnerActions={false}
            />
          )}
        </>
      ) : (
        // EDIT MODE: Use KnowledgeFormUserContents
        <KnowledgeFormUserContents
          mode="user"
          initialData={transformedRevisionData}
          onSuccess={() => {
            setMode("view");
            // Optionally trigger data refetch here
          }}
          onCancel={() => setMode("view")}
          customTitle="Edit Revisi Konten"
          customSubtitle="Simpan perubahan sebagai draft atau kembali ke mode lihat"
          customButtonText={{
            draft: "Simpan Draft",
            submit: "Simpan Draft", // Same as draft for revision mode
            cancel: "Kembali ke Lihat"
          }}
          useUpdateMutation={() => customUpdateMutation}
          queryKeysToInvalidate={[
            ["revision-details", versionId, contentId],
            ["my-revisions", contentId]
          ]}
        />
      )}
    </div>
  );
};

export default HybridRevisionView;