import {
  bookmarkKnowledgeContent,
  createKnowledgeContentComment,
  deleteKnowledgeContentComment,
  getKnowledgeContentComments,
  likeKnowledgeContent,
  updateKnowledgeContentComment,
} from "@/services/knowledge-management.services";
import { BookOutlined, CommentOutlined, LikeOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, message, Modal, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import CommentList from "./components/CommentList";
import FormComment from "./components/FormComment";
import KnowledgeContentBody from "./components/KnowledgeContentBody";
import KnowledgeContentHeader from "./components/KnowledgeContentHeader";

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

  const actions = [
    <Tooltip
      key="comment-basic-like"
      title={data?.is_liked ? "Batalkan Like" : "Like"}
    >
      <span
        onClick={handleLike}
        style={{
          opacity: isLiking ? 0.5 : 1,
          cursor: isLiking ? "not-allowed" : "pointer",
        }}
      >
        <LikeOutlined
          style={{
            paddingRight: "4px",
            color: data?.is_liked ? "#FF4500" : undefined,
          }}
        />
        <span
          className="comment-action"
          style={{ color: data?.is_liked ? "#FF4500" : undefined }}
        >
          {isLiking ? "..." : data?.likes_count || 0}
        </span>
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-comment" title="Komentar">
      <span>
        <CommentOutlined style={{ paddingRight: "4px" }} />
        <span className="comment-action">{data?.comments_count}</span>
      </span>
    </Tooltip>,

    <Tooltip
      key="comment-basic-bookmark"
      title={data?.is_bookmarked ? "Hapus dari Simpanan" : "Simpan"}
    >
      <span
        onClick={handleBookmark}
        style={{
          opacity: isBookmarking ? 0.5 : 1,
          cursor: isBookmarking ? "not-allowed" : "pointer",
        }}
      >
        <BookOutlined
          style={{
            paddingRight: "4px",
            color: data?.is_bookmarked ? "#FF4500" : undefined,
          }}
        />
        <span
          className="comment-action"
          style={{ color: data?.is_bookmarked ? "#FF4500" : undefined }}
        >
          {isBookmarking ? "..." : data?.is_bookmarked ? "Tersimpan" : "Simpan"}
        </span>
      </span>
    </Tooltip>,
  ];

  return (
    <div>
      <style jsx>{`
        /* tile uploaded pictures */
        .comment-action {
          padding-left: 8px;
          cursor: pointer;
        }

        [class*="-col-rtl"] .comment-action {
          padding-right: 8px;
          padding-left: 0;
        }
      `}</style>

      <KnowledgeContentHeader data={data} />
      <KnowledgeContentBody data={data} actions={actions} />

      {status === "authenticated" && (
        <FormComment
          form={form}
          currentUser={session?.user}
          onSubmit={handleSubmitComment}
          loading={isCreatingComment}
        />
      )}

      <CommentList
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
  );
};

export default KnowledgeUserContentDetail;
