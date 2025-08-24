import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  bookmarkKnowledgeContent,
  createKnowledgeContentComment,
  deleteKnowledgeContentComment,
  getKnowledgeContentComments,
  likeKnowledgeContent,
  updateKnowledgeContentComment,
} from "@/services/knowledge-management.services";
import {
  BookOutlined,
  CommentOutlined,
  HeartFilled,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Flex,
  Form,
  message,
  Modal,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import CommentList from "./components/CommentList";
import FormComment from "./components/FormComment";

dayjs.extend(relativeTime);

const { Text } = Typography;

// Component untuk menampilkan header content seperti SocmedComments style
const KnowledgeContentHeader = ({
  content,
  onLike,
  onBookmark,
  isLiked,
  isBookmarked,
}) => {
  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex style={{ minHeight: "80px" }}>
        {/* Like Section - Reddit Style */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <Tooltip title={isLiked ? "Unlike" : "Like konten ini"}>
            {isLiked ? (
              <HeartFilled
                style={{
                  fontSize: 16,
                  color: "#FF4500",
                  cursor: "pointer",
                  marginBottom: "4px",
                  transition: "transform 0.2s ease",
                }}
                onClick={onLike}
              />
            ) : (
              <HeartOutlined
                style={{
                  fontSize: 16,
                  color: "#878A8C",
                  cursor: "pointer",
                  marginBottom: "4px",
                  transition: "color 0.2s ease, transform 0.2s ease",
                }}
                onClick={onLike}
              />
            )}
          </Tooltip>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isLiked ? "#FF4500" : "#878A8C",
              margin: "4px 0",
              lineHeight: 1,
            }}
          >
            {content?.likes_count || 0}
          </Text>
        </div>

        {/* Content Section */}
        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          {/* Content Meta */}
          <Flex align="center" gap={6} style={{ marginBottom: "12px" }}>
            <Avatar
              size={24}
              src={content?.author?.image}
              icon={<UserOutlined />}
            />
            <Text
              style={{
                fontSize: "14px",
                color: "#787C7E",
                fontWeight: 600,
              }}
            >
              {content?.author?.username}
            </Text>
            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            <Tooltip
              title={dayjs(content?.created_at).format("DD MMM YYYY HH:mm")}
            >
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                }}
              >
                {dayjs(content?.created_at).fromNow()}
              </Text>
            </Tooltip>

            {/* Category */}
            {content?.category && (
              <>
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                <Tag
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    backgroundColor: "#FF4500",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    margin: 0,
                    padding: "0 6px",
                    lineHeight: "16px",
                  }}
                >
                  {content?.category?.name}
                </Tag>
              </>
            )}
          </Flex>

          {/* Content Title */}
          <Text
            strong
            style={{
              color: "#1A1A1B",
              fontSize: "18px",
              lineHeight: "1.3",
              marginBottom: "12px",
            }}
          >
            {content?.title}
          </Text>

          {/* Content Body */}
          <div
            style={{
              color: "#1A1A1B",
              fontSize: "16px",
              lineHeight: "22px",
              marginBottom: "16px",
            }}
          >
            <ReactMarkdownCustom withCustom={false}>
              {content?.content}
            </ReactMarkdownCustom>
          </div>

          {/* Tags */}
          {content?.tags && content?.tags.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Flex gap="4px" wrap="wrap">
                {content?.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: "10px",
                      padding: "0 6px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e8e8e8",
                      color: "#595959",
                      margin: 0,
                      borderRadius: "4px",
                      lineHeight: "16px",
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Flex>
            </div>
          )}

          {/* References */}
          {content?.references && content?.references.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                🔗 Referensi:
              </Text>
              {content.references.map((reference, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#FF4500" }}
                  >
                    {reference.title || reference.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Attachments */}
          {content?.attachments && content?.attachments.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                📎 Lampiran:
              </Text>
              {content.attachments.map((attachment, index) => (
                <div key={index} style={{ marginBottom: "4px" }}>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#FF4500" }}
                  >
                    {attachment.filename || attachment.name}
                    {attachment.size && (
                      <span style={{ color: "#787C7E", fontSize: "11px" }}>
                        {" "}
                        ({Math.round(attachment.size / 1024)} KB)
                      </span>
                    )}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Content Stats */}
          <Flex align="center" gap={16}>
            <Flex align="center" gap={4}>
              <CommentOutlined style={{ fontSize: "14px", color: "#787C7E" }} />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 700,
                }}
              >
                {content?.comments_count || 0} Komentar
              </Text>
            </Flex>

            <Flex
              align="center"
              gap={4}
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease",
              }}
              onClick={onBookmark}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <BookOutlined
                style={{
                  fontSize: "14px",
                  color: isBookmarked ? "#FF4500" : "#787C7E",
                }}
              />
              <Text
                style={{
                  fontSize: "12px",
                  color: isBookmarked ? "#FF4500" : "#787C7E",
                  fontWeight: 700,
                }}
              >
                {isBookmarked ? "Tersimpan" : "Simpan"}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

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

  // Reuse the existing CommentList component but wrap it in the new styling
  return (
    <div>
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
    </div>
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
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Knowledge Content Header */}
      {data && (
        <KnowledgeContentHeader
          content={data}
          onLike={handleLike}
          onBookmark={handleBookmark}
          isLiked={data?.is_liked}
          isBookmarked={data?.is_bookmarked}
        />
      )}

      {/* Comment Form */}
      {status === "authenticated" && (
        <Card
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <FormComment
            form={form}
            currentUser={session?.user}
            onSubmit={handleSubmitComment}
            loading={isCreatingComment}
          />
        </Card>
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
    </div>
  );
};

export default KnowledgeUserContentDetail;
