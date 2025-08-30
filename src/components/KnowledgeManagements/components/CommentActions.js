import {
  LikeOutlined,
  LikeFilled,
  RetweetOutlined,
  PushpinOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import { Tooltip, Grid } from "antd";

const { useBreakpoint } = Grid;

const CommentActions = ({
  comment,
  currentUser,
  contentAuthorId,
  onLike,
  onReply,
  onPin,
  isHierarchical = false,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const actions = [];
  const canPin = currentUser?.id === contentAuthorId;

  // Like action
  const isLiked = comment.user_liked;
  const likesCount = comment.likes_count || 0;
  actions.push(
    <Tooltip key="comment-like" title={isLiked ? "Batal suka" : "Suka"}>
      <span
        onClick={() => onLike && onLike(comment.id)}
        style={{
          color: isLiked ? "#FF4500" : "#6B7280",
          cursor: "pointer",
          fontSize: isMobile ? "12px" : "13px",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = isLiked ? "#e53e00" : "#374151";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isLiked ? "#FF4500" : "#6B7280";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {isLiked ? <LikeFilled /> : <LikeOutlined />}
        <span className="comment-action">{likesCount > 0 ? likesCount : "Suka"}</span>
      </span>
    </Tooltip>
  );

  // Reply action - only show if not at max depth (for hierarchical)
  const canReply = !isHierarchical || comment.depth < 1;
  if (canReply) {
    actions.push(
      <Tooltip key="comment-reply" title="Balas">
        <span
          onClick={() => onReply && onReply(comment.id)}
          style={{
            color: "#6B7280",
            cursor: "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <RetweetOutlined />
          <span className="comment-action">Balas</span>
        </span>
      </Tooltip>
    );
  }

  // Pin action - only for content author and parent comments
  if (canPin && (!isHierarchical || comment.depth === 0)) {
    const isPinned = comment.is_pinned;
    actions.push(
      <Tooltip key="comment-pin" title={isPinned ? "Batal pin" : "Pin komentar"}>
        <span
          onClick={() => onPin && onPin(comment.id)}
          style={{
            color: isPinned ? "#FF4500" : "#6B7280",
            cursor: "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isPinned ? "#e53e00" : "#374151";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isPinned ? "#FF4500" : "#6B7280";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          <span className="comment-action">{isPinned ? "Dipin" : "Pin"}</span>
        </span>
      </Tooltip>
    );
  }

  return actions;
};

export default CommentActions;