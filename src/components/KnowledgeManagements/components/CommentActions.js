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
  // New prop for per-comment loading functions
  isLikingSpecificComment,
  isPinningSpecificComment,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const actions = [];
  const canPin = currentUser?.id === contentAuthorId;

  // Like action - try multiple possible field names
  const isLiked = comment.user_liked || comment.is_liked || comment.liked || false;
  const likesCount = comment.likes_count || 0;
  const isCurrentlyLiking = isLikingSpecificComment ? isLikingSpecificComment(comment.id) : isLikingComment;
  
  // Debug log to check comment data structure
  if (process.env.NODE_ENV === 'development') {
    console.log(`Comment ${comment.id}:`, {
      user_liked: comment.user_liked,
      is_liked: comment.is_liked,
      liked: comment.liked,
      isLiked,
      likes_count: comment.likes_count,
      hierarchical: isHierarchical,
      comment
    });
  }
  
  actions.push(
    <Tooltip key="comment-like" title={isCurrentlyLiking ? "Loading..." : (isLiked ? "Batal suka" : "Suka")}>
      <span
        onClick={() => !isCurrentlyLiking && onLike && onLike(comment.id)}
        style={{
          color: isLiked ? "#FF4500" : "#6B7280",
          cursor: isCurrentlyLiking ? "not-allowed" : "pointer",
          fontSize: isMobile ? "12px" : "13px",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: isCurrentlyLiking ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isCurrentlyLiking) {
            e.currentTarget.style.color = isLiked ? "#e53e00" : "#374151";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentlyLiking) {
            e.currentTarget.style.color = isLiked ? "#FF4500" : "#6B7280";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {isCurrentlyLiking ? <LoadingOutlined spin /> : (isLiked ? <LikeFilled /> : <LikeOutlined />)}
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
    const isCurrentlyPinning = isPinningSpecificComment ? isPinningSpecificComment(comment.id) : isPinningComment;
    
    actions.push(
      <Tooltip key="comment-pin" title={isCurrentlyPinning ? "Loading..." : (isPinned ? "Batal pin" : "Pin komentar")}>
        <span
          onClick={() => !isCurrentlyPinning && onPin && onPin(comment.id)}
          style={{
            color: isPinned ? "#FF4500" : "#6B7280",
            cursor: isCurrentlyPinning ? "not-allowed" : "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            opacity: isCurrentlyPinning ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isCurrentlyPinning) {
              e.currentTarget.style.color = isPinned ? "#e53e00" : "#374151";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isCurrentlyPinning) {
              e.currentTarget.style.color = isPinned ? "#FF4500" : "#6B7280";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isCurrentlyPinning ? <LoadingOutlined spin /> : (isPinned ? <PushpinFilled /> : <PushpinOutlined />)}
          <span className="comment-action">{isPinned ? "Dipin" : "Pin"}</span>
        </span>
      </Tooltip>
    );
  }

  return actions;
};

export default CommentActions;