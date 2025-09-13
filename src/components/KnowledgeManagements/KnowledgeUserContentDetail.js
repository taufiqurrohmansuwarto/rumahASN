import {
  useCreateRevision,
  useDeleteMyContent,
  useMyRevisions,
  useSubmitContentForReview,
} from "@/hooks/knowledge-management";
import {
  useCommentInteractions,
  useComments,
  useCommentsHierarchical,
} from "@/hooks/knowledge-management/useComments";
import {
  bookmarkKnowledgeContent,
  likeKnowledgeContent,
} from "@/services/knowledge-management.services";
import { CommentOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Flex, Form, message, Modal, Switch, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import FormComment from "./components/FormComment";
import KnowledgeCommentsList from "./components/KnowledgeCommentsList";
import KnowledgeContentHeader from "./components/KnowledgeContentHeader";
import RelatedContent from "./components/RelatedContent";
import AIMetadataPanel from "./components/AIMetadataPanel";

dayjs.extend(relativeTime);

const { Text } = Typography;

const KnowledgeUserContentDetail = ({
  data,
  disableInteractions = false,
  showOwnerActions = false,
}) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [form] = Form.useForm();

  // Comment management states
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isHierarchicalView, setIsHierarchicalView] = useState(true);

  const { id } = router.query;

  // Use hierarchical or flat comments based on toggle
  const { data: hierarchicalComments, isLoading: isLoadingHierarchical } =
    useCommentsHierarchical(id, {
      enabled: !!id && isHierarchicalView,
    });

  const { data: flatComments, isLoading: isLoadingFlat } = useComments(id, {
    enabled: !!id && !isHierarchicalView,
  });

  // Use the appropriate data based on view mode
  const comments = isHierarchicalView ? hierarchicalComments : flatComments;
  const isLoadingComments = isHierarchicalView
    ? isLoadingHierarchical
    : isLoadingFlat;

  // Use the comment interactions hook
  const commentInteractions = useCommentInteractions(id);

  // Use submit for review hook
  const submitForReviewMutation = useSubmitContentForReview();

  // Use delete content hook
  const deleteContentMutation = useDeleteMyContent();

  // Use create revision hook
  const createRevisionMutation = useCreateRevision();

  // Get revisions for this content
  const { data: revisions } = useMyRevisions(id);

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
    if (isLiking || disableInteractions) return;
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

  // All comment mutations are now handled by the hook

  const handleSubmitComment = async () => {
    if (commentInteractions.isCreatingComment) return;

    try {
      const formData = await form.validateFields();
      commentInteractions.createComment({
        comment: formData.content,
      });
      form.resetFields();
      setReplyingTo(null);
    } catch (error) {
      // Form validation failed, don't proceed
      return;
    }
  };

  const handleEditComment = (comment, newContent, isSubmit = false) => {
    if (isSubmit && newContent) {
      // Submit edit
      commentInteractions.updateComment(comment.id, {
        comment: newContent,
      });
      // Hide edit form after submission
      setEditingComment(null);
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
        commentInteractions.deleteComment(commentId);
      },
    });
  };

  const handleReplyComment = (commentId, content, isSubmit = false) => {
    if (isSubmit && content) {
      // Submit reply using new reply endpoint
      commentInteractions.createReply(commentId, {
        comment: content,
      });
      // Hide reply form after submission
      setReplyingTo(null);
    } else if (commentId) {
      // Start replying
      setReplyingTo(commentId);
    } else {
      // Cancel replying
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId) => {
    commentInteractions.likeComment(commentId);
  };

  const handlePinComment = (commentId) => {
    commentInteractions.pinComment(commentId);
  };

  const handleBookmark = () => {
    if (isBookmarking || disableInteractions) return;
    bookmark(id);
  };

  const handleSubmitForReview = () => {
    if (submitForReviewMutation.isLoading) return;

    Modal.confirm({
      title: "Submit Konten untuk Review",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Apakah Anda yakin ingin mengirim konten ini untuk direview?</p>
          <p style={{ color: "#666", fontSize: "13px" }}>
            Setelah disubmit, konten akan masuk ke dalam antrian review dan
            tidak dapat diedit hingga proses review selesai.
          </p>
        </div>
      ),
      okText: "Ya, Submit untuk Review",
      cancelText: "Batal",
      okType: "primary",
      onOk: () => {
        submitForReviewMutation.mutate(id);
      },
    });
  };

  const handleDelete = () => {
    if (deleteContentMutation.isLoading) return;

    Modal.confirm({
      title: "Hapus Draft Konten",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Apakah Anda yakin ingin menghapus draft konten ini?</p>
          <p style={{ color: "#ff4d4f", fontSize: "13px", fontWeight: 500 }}>
            ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data konten akan
            dihapus permanen.
          </p>
        </div>
      ),
      okText: "Ya, Hapus Draft",
      cancelText: "Batal",
      okType: "danger",
      onOk: () => {
        deleteContentMutation.mutate(id, {
          onSuccess: () => {
            // Navigate back to my-knowledge list after successful delete
            router.push("/asn-connect/asn-knowledge/my-knowledge");
          },
        });
      },
    });
  };

  const handleCreateRevision = () => {
    if (createRevisionMutation.isLoading) return;

    createRevisionMutation.mutate(id, {
      onSuccess: (response) => {
        // Navigate to view the new revision
        const revisionId = response?.revision?.id;
        if (revisionId) {
          router.push(
            `/asn-connect/asn-knowledge/my-knowledge/${id}/revisions/${revisionId}`
          );
        } else {
          console.error("Revision ID not found in response:", response);
        }
      },
    });
  };

  const handleViewRevisions = (revision) => {
    if (revision?.id) {
      // Navigate to specific revision
      router.push(
        `/asn-connect/asn-knowledge/my-knowledge/${id}/revisions/${revision.id}`
      );
    } else {
      // Navigate to revision list if no specific revision
      router.push(`/asn-connect/asn-knowledge/my-knowledge/${id}/revisions`);
    }
  };

  const handleEditRevision = (revision) => {
    if (revision?.id) {
      // Navigate to edit specific revision
      router.push(
        `/asn-connect/asn-knowledge/my-knowledge/${id}/revisions/${revision.id}/edit`
      );
    }
  };

  return (
    <>
      {/* Knowledge Content Header */}
      <div id="content-section">
        {data && (
          <KnowledgeContentHeader
            content={data}
            onLike={handleLike}
            onBookmark={handleBookmark}
            isLiked={data?.is_liked}
            isBookmarked={data?.is_bookmarked}
            isLiking={isLiking}
            isBookmarking={isBookmarking}
            disableInteractions={disableInteractions}
            showOwnerActions={showOwnerActions}
            onSubmitForReview={handleSubmitForReview}
            isSubmittingForReview={submitForReviewMutation.isLoading}
            onDelete={handleDelete}
            isDeleting={deleteContentMutation.isLoading}
            onCreateRevision={handleCreateRevision}
            isCreatingRevision={createRevisionMutation.isLoading}
            onViewRevisions={handleViewRevisions}
            onEditRevision={handleEditRevision}
            revisions={revisions?.revisions || []}
          />
        )}
      </div>

      {/* Comments Section - Combined Form and List */}
      <Card
        id="comments-section"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
        styles={{ body: { padding: 0 } }}
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
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: "8px" }}
              >
                <Text
                  strong
                  style={{
                    color: "#1A1A1B",
                    fontSize: "16px",
                  }}
                >
                  Diskusi
                </Text>

                {!disableInteractions && comments && comments.length > 0 && (
                  <Flex align="center" gap={8}>
                    <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                      Tampilan Berjenjang
                    </Text>
                    <Switch
                      size="small"
                      checked={isHierarchicalView}
                      onChange={setIsHierarchicalView}
                      loading={isLoadingComments}
                    />
                  </Flex>
                )}
              </Flex>
              <Text
                style={{
                  color: "#787C7E",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                {disableInteractions
                  ? "Komentar tidak tersedia untuk konten yang belum dipublikasikan."
                  : "Berkomentarlah dengan sopan dan konstruktif. Hindari spam dan konten tidak pantas."}
              </Text>
            </div>

            {/* Comment Form */}
            {!disableInteractions && status === "authenticated" && (
              <div
                id="comments-form"
                style={{
                  marginBottom:
                    comments && comments.length > 0 ? "24px" : "16px",
                }}
              >
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
                  loading={commentInteractions.isCreatingComment}
                />
              </div>
            )}

            {/* Comments List Header */}
            {!disableInteractions && comments && comments.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Komentar (
                  {isHierarchicalView
                    ? comments.reduce((total, comment) => {
                        // Count parent + all nested replies
                        const countReplies = (replies) => {
                          return (
                            replies?.reduce(
                              (sum, reply) =>
                                sum + 1 + countReplies(reply.replies || []),
                              0
                            ) || 0
                          );
                        };
                        return total + 1 + countReplies(comment.replies || []);
                      }, 0)
                    : comments.length}
                  )
                </Text>
              </div>
            )}

            {/* Comments List */}
            {!disableInteractions && (
              <div id="comments-list">
                <KnowledgeCommentsList
                  comments={comments}
                  currentUser={session?.user}
                  isLoading={isLoadingComments}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReply={handleReplyComment}
                  onLike={handleLikeComment}
                  onPin={handlePinComment}
                  editingComment={editingComment}
                  replyingTo={replyingTo}
                  isUpdatingComment={commentInteractions.isUpdatingComment}
                  isDeletingComment={commentInteractions.isDeletingComment}
                  isCreatingComment={commentInteractions.isCreatingComment}
                  isCreatingReply={commentInteractions.isCreatingReply}
                  isLikingComment={commentInteractions.isLikingComment}
                  isPinningComment={commentInteractions.isPinningComment}
                  isHierarchical={isHierarchicalView}
                  contentAuthorId={data?.author_id}
                  isLikingSpecificComment={
                    commentInteractions.isLikingSpecificComment
                  }
                  isPinningSpecificComment={
                    commentInteractions.isPinningSpecificComment
                  }
                />
              </div>
            )}

            {/* Disabled State Message */}
            {disableInteractions && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                  backgroundColor: "#F8F9FA",
                  borderRadius: "8px",
                  border: "1px solid #EDEFF1",
                }}
              >
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  💬 Fitur komentar akan tersedia setelah konten dipublikasikan
                </Text>
              </div>
            )}

            {/* Related Content */}
            <div id="related-section">
              <RelatedContent contentId={id} isMobile={false} />
            </div>

            {/* AIMetadata Section */}
            <div id="aimetadata-section">
              <AIMetadataPanel data={data?.ai_metadata} />
            </div>
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
