import {
  bookmarkKnowledgeContent,
  createKnowledgeContentComment,
  deleteKnowledgeContentComment,
  getKnowledgeContentComments,
  likeKnowledgeContent,
  updateKnowledgeContentComment,
} from "@/services/knowledge-management.services";
import {
  CommentOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Flex,
  Form,
  message,
  Modal,
  Skeleton,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import CommentList from "./components/CommentList";
import FormComment from "./components/FormComment";
import KnowledgeContentHeader from "./components/KnowledgeContentHeader";

dayjs.extend(relativeTime);

const { Text } = Typography;


// Component untuk menampilkan daftar komentar dengan style seperti SocmedComments
const KnowledgeCommentsList = ({
  comments,
  currentUser,
  isLoading,
  onEdit,
  onDelete,
  onReply,
  editingComment,
  replyingTo,
  isUpdatingComment,
  isDeletingComment,
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
            bodyStyle={{ padding: 0 }}
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
        bodyStyle={{ padding: "48px 32px" }}
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

  // Reuse the existing CommentList component without wrapper since it's now in unified card
  return (
    <CommentList
      comments={comments}
      currentUser={currentUser}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onReply={onReply}
      editingComment={editingComment}
      replyingTo={replyingTo}
      isUpdatingComment={isUpdatingComment}
      isDeletingComment={isDeletingComment}
    />
  );
};

const KnowledgeUserContentDetail = ({ data, isLoading }) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [form] = Form.useForm();

  // Comment management states
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const { id } = router.query;

  const { data: comments, isLoading: isLoadingComments } = useQuery(
    ["knowledge-content-comments", id],
    () => getKnowledgeContentComments(id),
    {
      enabled: !!id,
      keepPreviousData: true,
    }
  );

  const { mutate: like, isLoading: isLiking } = useMutation(
    (data) => likeKnowledgeContent(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["knowledge-content-detail", id]);
      },
      onError: () => {
        message.error("Gagal menyukai konten");
      },
    }
  );

  const handleLike = () => {
    if (isLiking) return;
    like(id);
  };

  const { mutate: bookmark, isLoading: isBookmarking } = useMutation(
    (data) => bookmarkKnowledgeContent(data),
    {
      onSuccess: (response) => {
        message.success(
          response?.is_bookmarked
            ? "Konten disimpan"
            : "Konten dihapus dari simpanan"
        );
        queryClient.invalidateQueries(["knowledge-content-detail", id]);
      },
      onError: () => {
        message.error("Gagal menyimpan konten");
      },
    }
  );

  const { mutate: createComment, isLoading: isCreatingComment } = useMutation(
    (data) => createKnowledgeContentComment(data),
    {
      onSuccess: () => {
        message.success("Komentar berhasil ditambahkan");
        queryClient.invalidateQueries(["knowledge-content-comments", id]);
        queryClient.invalidateQueries(["knowledge-content-detail", id]);
        form.resetFields();
        setReplyingTo(null);
      },
      onError: () => {
        message.error("Gagal menambahkan komentar");
      },
    }
  );

  const { mutate: updateComment, isLoading: isUpdatingComment } = useMutation(
    (data) => updateKnowledgeContentComment(data),
    {
      onSuccess: () => {
        message.success("Komentar berhasil diperbarui");
        queryClient.invalidateQueries(["knowledge-content-comments", id]);
        setEditingComment(null);
      },
      onError: () => {
        message.error("Gagal memperbarui komentar");
      },
    }
  );

  const { mutate: deleteComment, isLoading: isDeletingComment } = useMutation(
    (data) => deleteKnowledgeContentComment(data),
    {
      onSuccess: () => {
        message.success("Komentar berhasil dihapus");
        queryClient.invalidateQueries(["knowledge-content-comments", id]);
        queryClient.invalidateQueries(["knowledge-content-detail", id]);
      },
      onError: () => {
        message.error("Gagal menghapus komentar");
      },
    }
  );

  const handleSubmitComment = async () => {
    if (isCreatingComment) return;

    try {
      const formData = await form.validateFields();
      const payload = {
        id,
        data: {
          comment: formData.content,
        },
      };
      createComment(payload);
    } catch (error) {
      // Form validation failed, don't proceed
      return;
    }
  };

  const handleEditComment = (comment, newContent, isSubmit = false) => {
    if (isSubmit && newContent) {
      const payload = {
        id,
        commentId: comment.id,
        data: {
          comment: newContent,
        },
      };
      // Submit edit
      updateComment(payload);
    } else if (comment) {
      // Start editing
      setEditingComment(comment.id);
    } else {
      // Cancel editing
      setEditingComment(null);
    }
  };

  const handleDeleteComment = (commentId) => {
    Modal.confirm({
      title: "Hapus Komentar",
      content: "Apakah Anda yakin ingin menghapus komentar ini?",
      okText: "Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: () => {
        const payload = {
          id,
          commentId,
        };
        deleteComment(payload);
      },
    });
  };

  const handleReplyComment = (commentId, content, isSubmit = false) => {
    if (isSubmit && content) {
      // Submit reply
      const payload = {
        id,
        data: {
          comment: content,
          parent_id: commentId, // If your API supports nested comments
        },
      };
      createComment(payload);
    } else if (commentId) {
      // Start replying
      setReplyingTo(commentId);
    } else {
      // Cancel replying
      setReplyingTo(null);
    }
  };

  const handleBookmark = () => {
    if (isBookmarking) return;
    bookmark(id);
  };

  return (
    <>
      {/* Knowledge Content Header */}
      {data && (
        <KnowledgeContentHeader
          content={data}
          onLike={handleLike}
          onBookmark={handleBookmark}
          isLiked={data?.is_liked}
          isBookmarked={data?.is_bookmarked}
          isLiking={isLiking}
          isBookmarking={isBookmarking}
        />
      )}

      {/* Comments Section - Combined Form and List */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Combined */}
          <div
            style={{
              width: "40px",
              backgroundColor: "#F8F9FA",
              borderRight: "1px solid #EDEFF1",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "16px",
              minHeight: "100%",
            }}
          >
            <CommentOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
          </div>

          {/* Content Section - Combined */}
          <div style={{ flex: 1, padding: "16px" }}>
            {/* Comment Section Header */}
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: "16px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Diskusi
              </Text>
              <Text
                style={{
                  color: "#787C7E",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                Berkomentarlah dengan sopan dan konstruktif. Hindari spam dan konten tidak pantas.
              </Text>
            </div>

            {/* Comment Form */}
            {status === "authenticated" && (
              <div style={{ marginBottom: comments && comments.length > 0 ? "24px" : "16px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Tulis Komentar
                  </Text>
                </div>
                <FormComment
                  form={form}
                  currentUser={session?.user}
                  onSubmit={handleSubmitComment}
                  loading={isCreatingComment}
                />
              </div>
            )}

            {/* Comments List Header */}
            {comments && comments.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Komentar ({comments.length})
                </Text>
              </div>
            )}

            {/* Comments List */}
            <KnowledgeCommentsList
              comments={comments}
              currentUser={session?.user}
              isLoading={isLoadingComments}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleReplyComment}
              editingComment={editingComment}
              replyingTo={replyingTo}
              isUpdatingComment={isUpdatingComment}
              isDeletingComment={isDeletingComment}
            />
          </div>
        </Flex>
      </Card>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }

        .ant-dropdown-menu-item-danger {
          color: #ff4757 !important;
        }

        .ant-dropdown-menu-item-danger:hover {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </>
  );
};

export default KnowledgeUserContentDetail;
