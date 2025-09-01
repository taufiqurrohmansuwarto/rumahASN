import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import { Comment } from "@ant-design/compatible";
import { PushpinFilled } from "@ant-design/icons";
import { Tooltip, Typography, Grid } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import CommentActions from "./CommentActions";
import CommentDropdown from "./CommentDropdown";
import CommentEditForm from "./CommentEditForm";
import CommentReplyForm from "./CommentReplyForm";
import CommentCollapseButton from "./CommentCollapseButton";
import { getRepliesForComment } from "@/services/knowledge-management.services";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CommentItem = ({
  comment,
  level = 0,
  currentUser,
  contentAuthorId,
  editingComment,
  replyingTo,
  editForm,
  replyForm,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onPin,
  isUpdatingComment,
  isDeletingComment,
  isCreatingComment,
  isCreatingReply,
  isLikingComment,
  isPinningComment,
  isHierarchical = false,
  // New per-comment loading functions
  isLikingSpecificComment,
  isPinningSpecificComment,
}) => {
  const isNested = level > 0;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  // State for collapsing nested replies (only for parent comments)
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(true); // Default collapsed
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState(null);
  const hasReplies = (comment.replies && comment.replies.length > 0) || (comment.replies_count > 0);
  const repliesCount = comment.replies_count || 0;

  // Subscribe to query changes to refresh loaded replies
  useEffect(() => {
    if (!loadedReplies || isRepliesCollapsed) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' && 
        event.query.queryKey[0] === 'comments-hierarchical' &&
        event.query.queryKey[1] === id
      ) {
        // Refresh replies when the hierarchical comments query updates
        getRepliesForComment(id, comment.id)
          .then(setLoadedReplies)
          .catch(console.error);
      }
    });

    return unsubscribe;
  }, [queryClient, loadedReplies, isRepliesCollapsed, id, comment.id]);

  // Handle async loading when uncollapsing
  const handleToggleReplies = async () => {
    if (isRepliesCollapsed && hasReplies) {
      // Load replies if not already loaded
      if (!loadedReplies) {
        setIsLoadingReplies(true);
        try {
          const replies = await getRepliesForComment(id, comment.id);
          setLoadedReplies(replies);
        } catch (error) {
          console.error("Failed to load replies:", error);
        } finally {
          setIsLoadingReplies(false);
        }
      }
    }
    setIsRepliesCollapsed(!isRepliesCollapsed);
  };
  
  return (
    <Comment
      style={{
        marginLeft: isNested ? (isMobile ? `${level * 16}px` : `${level * 24}px`) : 0,
        borderLeft: isNested ? "2px solid #f0f0f0" : "none",
        paddingLeft: isNested ? (isMobile ? "12px" : "16px") : 0,
      }}
      author={
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "4px" : "6px", paddingRight: isMobile ? "20px" : "30px" }}>
          {comment.is_pinned && (
            <PushpinFilled 
              style={{ 
                color: "#FF4500", 
                fontSize: isMobile ? "10px" : "12px",
                marginRight: "4px"
              }} 
            />
          )}
          <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 600 }}>
            <UserText 
              userId={comment?.user?.custom_id}
              text={comment?.user?.username}
            />
          </div>
          <span style={{ color: "#787C7E", fontSize: isMobile ? "10px" : "12px" }}>•</span>
          <Tooltip
            title={dayjs(comment?.created_at).format("DD-MM-YYYY HH:mm")}
          >
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "10px" : "11px",
                color: "#787C7E",
                cursor: "pointer",
              }}
            >
              {dayjs(comment?.created_at).fromNow()}
            </Text>
          </Tooltip>
          {comment?.is_edited && (
            <>
              <span style={{ color: "#787C7E", fontSize: isMobile ? "10px" : "12px" }}>•</span>
              <Tooltip
                title={`Terakhir diedit: ${dayjs(comment?.edited_at || comment?.updated_at).format("DD-MM-YYYY HH:mm")}`}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    fontStyle: "italic",
                  }}
                >
                  diedit
                </Text>
              </Tooltip>
            </>
          )}
        </div>
      }
      avatar={
        <AvatarUser
          src={comment?.user?.image}
          userId={comment?.user?.custom_id}
          user={comment?.user}
          size="small"
        />
      }
      content={
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "0px",
              zIndex: 10,
            }}
          >
            <CommentDropdown
              comment={comment}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              isUpdatingComment={isUpdatingComment}
              isDeletingComment={isDeletingComment}
            />
          </div>
          
          {editingComment === comment.id ? (
            <CommentEditForm
              form={editForm}
              comment={comment}
              onEdit={onEdit}
              isUpdatingComment={isUpdatingComment}
            />
          ) : (
            <div
              style={{
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: isMobile ? "16px" : "18px",
                color: "#1A1A1B",
                paddingRight: isMobile ? "24px" : "32px",
              }}
            >
              <ReactMarkdownCustom withCustom={false}>
                {comment?.comment_text}
              </ReactMarkdownCustom>
            </div>
          )}
        </div>
      }
      actions={CommentActions({
        comment: comment,
        currentUser: currentUser,
        contentAuthorId: contentAuthorId,
        onLike: onLike,
        onReply: onReply,
        onPin: onPin,
        isLikingComment: isLikingComment,
        isPinningComment: isPinningComment,
        isHierarchical: isHierarchical,
        isLikingSpecificComment: isLikingSpecificComment,
        isPinningSpecificComment: isPinningSpecificComment,
      })}
    >
      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div style={{ marginTop: "16px" }}>
          <CommentReplyForm
            form={replyForm}
            parentComment={comment}
            currentUser={currentUser}
            onReply={onReply}
            isCreatingComment={isCreatingReply}
          />
        </div>
      )}

      {/* Collapse Button - Only show for parent comments with replies */}
      {isHierarchical && level === 0 && repliesCount > 0 && (
        <CommentCollapseButton
          isCollapsed={isRepliesCollapsed}
          repliesCount={repliesCount}
          onToggle={handleToggleReplies}
          isLoading={isLoadingReplies}
          isMobile={isMobile}
        />
      )}

      {/* Nested Replies - Only for hierarchical view and not collapsed */}
      {isHierarchical && hasReplies && !isRepliesCollapsed && !isLoadingReplies && loadedReplies &&
        loadedReplies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            level={level + 1}
            currentUser={currentUser}
            contentAuthorId={contentAuthorId}
            editingComment={editingComment}
            replyingTo={replyingTo}
            editForm={editForm}
            replyForm={replyForm}
            onEdit={onEdit}
            onDelete={onDelete}
            onReply={onReply}
            onLike={onLike}
            onPin={onPin}
            isUpdatingComment={isUpdatingComment}
            isDeletingComment={isDeletingComment}
            isCreatingComment={isCreatingComment}
            isCreatingReply={isCreatingReply}
            isLikingComment={isLikingComment}
            isPinningComment={isPinningComment}
            isHierarchical={isHierarchical}
            isLikingSpecificComment={isLikingSpecificComment}
            isPinningSpecificComment={isPinningSpecificComment}
          />
        ))
      }
    </Comment>
  );
};

export default CommentItem;