import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  Button,
  Avatar,
  Typography,
  message,
  Spin,
  Empty,
  Popconfirm,
  Flex,
} from "antd";
import { IconSend, IconTrash, IconMessage } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import {
  getComments,
  addComment,
  deleteComment,
} from "../../../services/kanban.services";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { TextArea } = Input;
const { Text } = Typography;

function CommentItem({ comment, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid #f5f5f5",
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <Avatar src={comment.user?.image} size={28}>
        {comment.user?.username?.charAt(0)?.toUpperCase()}
      </Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Flex justify="space-between" align="center" gap={8}>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 12 }}>
              {comment.user?.username}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(comment.created_at).fromNow()}
            </Text>
            {comment.is_edited && (
              <Text type="secondary" italic style={{ fontSize: 10 }}>
                (diedit)
              </Text>
            )}
          </Flex>
          <div style={{ opacity: showDelete ? 1 : 0, transition: "opacity 0.2s" }}>
            <Popconfirm
              title="Hapus komentar?"
              onConfirm={() => onDelete(comment.id)}
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true, size: "small" }}
              cancelButtonProps={{ size: "small" }}
              placement="left"
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<IconTrash size={12} />}
                style={{ height: 20, width: 20, padding: 0 }}
              />
            </Popconfirm>
          </div>
        </Flex>
        <Text
          style={{
            display: "block",
            marginTop: 4,
            whiteSpace: "pre-wrap",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#262626",
          }}
        >
          {comment.content}
        </Text>
      </div>
    </div>
  );
}

function TaskComments({ taskId }) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["kanban-comments", taskId],
    () => getComments({ taskId }),
    { enabled: !!taskId }
  );

  const { mutate: add, isLoading: isAdding } = useMutation(
    (content) => addComment({ taskId, content }),
    {
      onSuccess: () => {
        setNewComment("");
        queryClient.invalidateQueries(["kanban-comments", taskId]);
        queryClient.invalidateQueries(["kanban-task", taskId]);
        message.success("Komentar ditambahkan");
      },
      onError: (error) => {
        console.error("Comment error:", error);
        message.error("Gagal menambah komentar");
      },
    }
  );

  const { mutate: remove } = useMutation(
    (commentId) => deleteComment({ taskId, commentId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["kanban-comments", taskId]);
        queryClient.invalidateQueries(["kanban-task", taskId]);
        message.success("Komentar dihapus");
      },
      onError: () => message.error("Gagal menghapus komentar"),
    }
  );

  const handleSubmit = () => {
    if (newComment.trim()) {
      add(newComment.trim());
    }
  };

  const comments = data?.comments || [];

  return (
    <div>
      {/* Comment Input - Compact */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          backgroundColor: "#fafafa",
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <TextArea
          placeholder="Tulis komentar... (Ctrl+Enter untuk kirim)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{
            flex: 1,
            border: "none",
            backgroundColor: "transparent",
            resize: "none",
            fontSize: 13,
          }}
          onPressEnter={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          type="primary"
          icon={<IconSend size={14} />}
          onClick={handleSubmit}
          loading={isAdding}
          disabled={!newComment.trim()}
          size="small"
        />
      </div>

      {/* Comment List */}
      {isLoading ? (
        <Flex justify="center" style={{ padding: 20 }}>
          <Spin size="small" />
        </Flex>
      ) : comments.length === 0 ? (
        <Empty
          image={<IconMessage size={32} color="#d9d9d9" />}
          imageStyle={{ height: 32 }}
          description={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Belum ada komentar
            </Text>
          }
          style={{ margin: "20px 0" }}
        />
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskComments;
