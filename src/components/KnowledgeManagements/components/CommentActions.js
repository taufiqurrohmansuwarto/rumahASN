import {
  LikeOutlined,
  LikeFilled,
  RetweetOutlined,
  PushpinOutlined,
  PushpinFilled,
  LoadingOutlined,
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
  isLikingComment = false,
  isPinningComment = false,
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
    <Tooltip key="comment-like" title={isLikingComment ? "Loading..." : (isLiked ? "Batal suka" : "Suka")}>
      <span
        onClick={() => !isLikingComment && onLike && onLike(comment.id)}
        style={{
          color: isLiked ? "#FF4500" : "#6B7280",
          cursor: isLikingComment ? "not-allowed" : "pointer",
          fontSize: isMobile ? "12px" : "13px",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: isLikingComment ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isLikingComment) {
            e.currentTarget.style.color = isLiked ? "#e53e00" : "#374151";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLikingComment) {
            e.currentTarget.style.color = isLiked ? "#FF4500" : "#6B7280";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {isLikingComment ? <LoadingOutlined spin /> : (isLiked ? <LikeFilled /> : <LikeOutlined />)}
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
      <Tooltip key="comment-pin" title={isPinningComment ? "Loading..." : (isPinned ? "Batal pin" : "Pin komentar")}>
        <span
          onClick={() => !isPinningComment && onPin && onPin(comment.id)}
          style={{
            color: isPinned ? "#FF4500" : "#6B7280",
            cursor: isPinningComment ? "not-allowed" : "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            opacity: isPinningComment ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isPinningComment) {
              e.currentTarget.style.color = isPinned ? "#e53e00" : "#374151";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPinningComment) {
              e.currentTarget.style.color = isPinned ? "#FF4500" : "#6B7280";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isPinningComment ? <LoadingOutlined spin /> : (isPinned ? <PushpinFilled /> : <PushpinOutlined />)}
          <span className="comment-action">{isPinned ? "Dipin" : "Pin"}</span>
        </span>
      </Tooltip>
    );
  }

  return actions;
};

export default CommentActions;