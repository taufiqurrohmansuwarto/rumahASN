import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  bookmarkKnowledgeContent,
  createKnowledgeContentComment,
  deleteKnowledgeContentComment,
  getKnowledgeContent,
  getKnowledgeContentComments,
  likeKnowledgeContent,
  updateKnowledgeContentComment,
} from "@/services/knowledge-management.services";
import { Comment } from "@ant-design/compatible";
import {
  BookOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  LikeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  message,
  Modal,
  Space,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

const { TextArea } = Input;

const CommentList = ({
  comments,
  isLoading,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  editingComment,
  replyingTo,
  isUpdatingComment,
  isDeletingComment,
}) => {
  const [editForm] = Form.useForm();

  const renderCommentActions = (item) => {
    const isOwner = currentUser?.id === item?.user?.custom_id;
    const actions = [];

    // Reply action - always available
    actions.push(
      <Tooltip key="comment-reply" title="Balas">
        <span onClick={() => onReply(item.id)}>
          <SendOutlined style={{ paddingRight: "4px" }} />
        </span>
      </Tooltip>
    );

    // Edit action - only for comment owner
    if (isOwner) {
      actions.push(
        <Tooltip key="comment-edit" title="Edit">
          <span
            onClick={() => !isUpdatingComment && onEdit(item)}
            style={{
              opacity: isUpdatingComment ? 0.5 : 1,
              cursor: isUpdatingComment ? "not-allowed" : "pointer",
            }}
          >
            <EditOutlined style={{ paddingRight: "4px" }} />
            <span className="comment-action">Edit</span>
          </span>
        </Tooltip>
      );

      actions.push(
        <Tooltip key="comment-delete" title="Hapus">
          <span
            onClick={() => !isDeletingComment && onDelete(item.id)}
            style={{
              opacity: isDeletingComment ? 0.5 : 1,
              cursor: isDeletingComment ? "not-allowed" : "pointer",
            }}
          >
            <DeleteOutlined style={{ paddingRight: "4px" }} />
            <span className="comment-action">Hapus</span>
          </span>
        </Tooltip>
      );
    }

    return actions;
  };

  return (
    <List
      dataSource={comments}
      loading={isLoading}
      renderItem={(item) => (
        <div key={item.id}>
          <Comment
            author={item?.user?.username}
            avatar={<Avatar src={item?.user?.image} />}
            content={
              editingComment === item.id ? (
                <Form
                  form={editForm}
                  initialValues={{ content: item?.comment_text }}
                  onFinish={(values) => onEdit(item, values.content, true)}
                >
                  <Form.Item
                    name="content"
                    rules={[
                      {
                        required: true,
                        message: "Komentar tidak boleh kosong!",
                      },
                    ]}
                  >
                    <TextArea rows={3} />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="small"
                        loading={isUpdatingComment}
                        style={{
                          backgroundColor: "#FF4500",
                          borderColor: "#FF4500",
                        }}
                      >
                        Simpan
                      </Button>
                      <Button size="small" onClick={() => onEdit(null)}>
                        Batal
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <ReactMarkdownCustom withCustom={false}>
                  {item?.comment_text}
                </ReactMarkdownCustom>
              )
            }
            datetime={dayjs(item?.created_at).format("DD MMMM YYYY")}
            actions={renderCommentActions(item)}
          />
          {/* Reply Form - positioned right below this comment */}
          {replyingTo === item.id && (
            <div
              style={{
                marginLeft: "48px",
                marginTop: "8px",
                marginBottom: "16px",
              }}
            >
              <Comment
                avatar={<Avatar src={currentUser?.image} />}
                author={currentUser?.username}
                content={
                  <Form
                    form={editForm}
                    onFinish={(values) =>
                      onReply(item.id, values.content, true)
                    }
                  >
                    <Form.Item
                      name="content"
                      rules={[
                        {
                          required: true,
                          message: "Balasan tidak boleh kosong!",
                        },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder={`Membalas ${item?.user?.username}...`}
                      />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Space>
                        <Button type="primary" htmlType="submit">
                          Balas
                        </Button>
                        <Button onClick={() => onReply(null)}>Batal</Button>
                      </Space>
                    </Form.Item>
                  </Form>
                }
              />
            </div>
          )}
        </div>
      )}
    />
  );
};

const FormComment = ({
  form,
  currentUser,
  onSubmit,
  placeholder = "Tulis komentar...",
  buttonText = "Kirim Komentar",
  loading = false,
}) => {
  return (
    <Comment
      avatar={<Avatar src={currentUser?.image} />}
      author={currentUser?.username}
      content={
        <Form form={form} onFinish={onSubmit}>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Komentar tidak boleh kosong!" },
            ]}
          >
            <TextArea rows={4} placeholder={placeholder} disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#FF4500", borderColor: "#FF4500" }}
            >
              {buttonText}
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
};

const KnowledgeUserContentDetail = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [form] = Form.useForm();

  // Comment management states
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const { id } = router.query;

  const { data, isLoading, refetch } = useQuery(
    ["knowledge-content-detail", id],
    () => getKnowledgeContent(id),
    {
      enabled: !!id,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

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
      <Comment
        avatar={<Avatar src={data?.author?.image} />}
        author={data?.author?.username}
        actions={actions}
        datetime={dayjs(data?.created_at).format("DD MMMM YYYY")}
        content={
          <ReactMarkdownCustom withCustom={false}>
            {data?.content}
          </ReactMarkdownCustom>
        }
      />
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
