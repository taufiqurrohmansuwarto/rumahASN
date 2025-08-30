import {
  Card,
  Flex,
  Skeleton,
  Space,
  Typography,
} from "antd";
import CommentList from "./CommentList";

const { Text } = Typography;

// Component untuk menampilkan daftar komentar dengan style seperti SocmedComments
const KnowledgeCommentsList = ({
  comments,
  currentUser,
  isLoading,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onPin,
  editingComment,
  replyingTo,
  isUpdatingComment,
  isDeletingComment,
  isCreatingComment,
  isCreatingReply,
  isLikingComment,
  isPinningComment,
  isHierarchical = false,
  contentAuthorId,
}) => {
  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            style={{
              marginBottom: "8px",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
            }}
            styles={{ body: { padding: 0 } }}
          >
            <Flex>
              <div
                style={{
                  width: "32px",
                  backgroundColor: "#F8F9FA",
                  padding: "8px",
                }}
              >
                <Skeleton.Avatar size={16} />
              </div>
              <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
                <Skeleton.Input style={{ width: "30%" }} active size="small" />
                <Skeleton
                  paragraph={{ rows: 2, width: ["100%", "70%"] }}
                  active
                />
                <Skeleton.Input style={{ width: "20%" }} active size="small" />
              </Flex>
            </Flex>
          </Card>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Card
        style={{
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
          textAlign: "center",
        }}
        styles={{ body: { padding: "48px 32px" } }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div
            style={{
              fontSize: "36px",
              color: "#D1D5DB",
              marginBottom: "8px",
            }}
          >
            💬
          </div>
          <Text style={{ color: "#787C7E", fontSize: "16px" }}>
            Belum ada komentar
          </Text>
          <Text type="secondary" style={{ fontSize: "14px", color: "#9CA3AF" }}>
            Jadilah yang pertama untuk berkomentar
          </Text>
        </Space>
      </Card>
    );
  }

  // Reuse the existing CommentList component with enhanced props
  return (
    <CommentList
      comments={comments}
      currentUser={currentUser}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onReply={onReply}
      onLike={onLike}
      onPin={onPin}
      editingComment={editingComment}
      replyingTo={replyingTo}
      isUpdatingComment={isUpdatingComment}
      isDeletingComment={isDeletingComment}
      isCreatingComment={isCreatingComment}
      isCreatingReply={isCreatingReply}
      isLikingComment={isLikingComment}
      isPinningComment={isPinningComment}
      isHierarchical={isHierarchical}
      contentAuthorId={contentAuthorId}
    />
  );
};

export default KnowledgeCommentsList;