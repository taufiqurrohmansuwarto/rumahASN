import { Comment } from "@ant-design/compatible";
import { Form, List, Skeleton, Divider, Grid, Typography } from "antd";
import { useEffect } from "react";
import CommentItem from "./CommentItem";
import CommentActions from "./CommentActions";
import CommentDropdown from "./CommentDropdown";
import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import CommentEditForm from "./CommentEditForm";
import CommentReplyForm from "./CommentReplyForm";
import dayjs from "dayjs";
import { Tooltip } from "antd";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CommentList = ({
  comments,
  isLoading,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onPin,
  editingComment,
  replyingTo,
  isUpdatingComment,
  isDeletingComment,
  isCreatingComment,
  isCreatingReply,
  isLikingComment,
  isPinningComment,
  isHierarchical = false,
  contentAuthorId,
  // New per-comment loading functions
  isLikingSpecificComment,
  isPinningSpecificComment,
}) => {
  const [editForm] = Form.useForm();
  const [replyForm] = Form.useForm();

  // Reset forms when modes change
  useEffect(() => {
    if (replyingTo) {
      replyForm.resetFields();
    }
  }, [replyingTo, replyForm]);

  useEffect(() => {
    if (editingComment) {
      // Form akan diset dengan initial values di Form component
    } else {
      editForm.resetFields();
    }
  }, [editingComment, editForm]);

  // Responsive breakpoints - sama seperti komponen lainnya
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      {isHierarchical ? (
        // Hierarchical view with tree-like nested structure
        <div style={{ padding: 0 }}>
          {isLoading && (
            <div>
              {[1, 2, 3].map((item) => (
                <div key={item} style={{ marginBottom: "16px" }}>
                  <Comment
                    avatar={<Skeleton.Avatar size="small" />}
                    author={<Skeleton.Input style={{ width: "100px" }} active size="small" />}
                    content={
                      <div>
                        <Skeleton paragraph={{ rows: 2, width: ["100%", "70%"] }} active />
                        <Skeleton.Input style={{ width: "80px" }} active size="small" />
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && comments?.map((comment, index) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                level={0}
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
              {/* Add divider between depth 0 comments, except for the last one */}
              {index < comments.length - 1 && (
                <Divider 
                  style={{ 
                    margin: "16px 0",
                    borderColor: "#f0f0f0"
                  }} 
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        // Flat view with simple list structure
        <List
          dataSource={comments}
          loading={isLoading}
          style={{ padding: 0 }}
          renderItem={(item) => (
            <div 
              key={item.id} 
              style={{ 
                marginBottom: "8px",
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
                padding: "12px",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EDEFF1";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 10,
                }}
              >
                <CommentDropdown
                  comment={item}
                  currentUser={currentUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isUpdatingComment={isUpdatingComment}
                  isDeletingComment={isDeletingComment}
                />
              </div>

              <Comment
                author={
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingRight: "30px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      <UserText 
                        userId={item?.user?.custom_id}
                        text={item?.user?.username}
                      />
                    </div>
                    <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                    <Tooltip
                      title={dayjs(item?.created_at).format("DD-MM-YYYY HH:mm")}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "11px",
                          color: "#787C7E",
                          cursor: "pointer",
                        }}
                      >
                        {dayjs(item?.created_at).fromNow()}
                      </Text>
                    </Tooltip>
                    {item?.is_edited && (
                      <>
                        <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                        <Tooltip
                          title={`Terakhir diedit: ${dayjs(item?.edited_at || item?.updated_at).format("DD-MM-YYYY HH:mm")}`}
                        >
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "10px",
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
                    src={item?.user?.image}
                    userId={item?.user?.custom_id}
                    user={item?.user}
                    size="small"
                  />
                }
                content={
                  editingComment === item.id ? (
                    <CommentEditForm
                      form={editForm}
                      comment={item}
                      onEdit={onEdit}
                      isUpdatingComment={isUpdatingComment}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "13px",
                        lineHeight: "18px",
                        color: "#1A1A1B",
                      }}
                    >
                      <ReactMarkdownCustom withCustom={false}>
                        {item?.comment_text}
                      </ReactMarkdownCustom>
                    </div>
                  )
                }
                actions={CommentActions({
                  comment: item,
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
              />
              {/* Reply Form - positioned right below this comment */}
              {replyingTo === item.id && (
                <div
                  style={{
                    marginLeft: isMobile ? "24px" : "36px",
                    marginTop: "8px",
                    marginBottom: "8px",
                    padding: "8px",
                  }}
                >
                  <CommentReplyForm
                    form={replyForm}
                    parentComment={item}
                    currentUser={currentUser}
                    onReply={onReply}
                    isCreatingComment={isCreatingReply}
                  />
                </div>
              )}
            </div>
          )}
        />
      )}

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 4px !important;
        }

        .ant-card:hover {
          border-color: #edeff1 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn-primary {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(
            135deg,
            #e53e00 0%,
            #ff4500 100%
          ) !important;
          border-color: #e53e00 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(255, 69, 0, 0.4) !important;
          transition: all 0.2s ease !important;
        }

        .comment-action {
          transition: all 0.2s ease !important;
        }

        .ant-comment-actions > li {
          margin-right: 12px !important;
        }

        @media (max-width: 768px) {
          .ant-comment-content-author-name {
            font-size: 13px !important;
          }

          .ant-comment-content-author-time {
            font-size: 11px !important;
          }
        }
      `}</style>
    </>
  );
};

export default CommentList;
