import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "@/components/Users/AvatarUser";
import { Comment } from "@ant-design/compatible";
import {
  DeleteOutlined,
  EditOutlined,
  RetweetOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  List,
  Space,
  Tooltip,
  Grid,
  Typography,
} from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

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

  // Responsive breakpoints - sama seperti komponen lainnya
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const renderCommentActions = (item) => {
    const isOwner = currentUser?.id === item?.user?.custom_id;
    const actions = [];

    // Reply action - always available
    actions.push(
      <Tooltip key="comment-reply" title="Balas">
        <span
          onClick={() => onReply(item.id)}
          style={{
            color: "#6B7280",
            cursor: "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
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
          <RetweetOutlined style={{ paddingRight: "4px" }} />
          <span className="comment-action">Balas</span>
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
              color: "#6B7280",
              fontSize: isMobile ? "12px" : "13px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isUpdatingComment) {
                e.currentTarget.style.color = "#374151";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingComment) {
                e.currentTarget.style.color = "#6B7280";
                e.currentTarget.style.transform = "translateY(0)";
              }
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
              color: "#DC2626",
              fontSize: isMobile ? "12px" : "13px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDeletingComment) {
                e.currentTarget.style.color = "#B91C1C";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeletingComment) {
                e.currentTarget.style.color = "#DC2626";
                e.currentTarget.style.transform = "translateY(0)";
              }
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
    <>
      <List
        dataSource={comments}
        loading={isLoading}
        style={{
          padding: 0,
        }}
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
                  <Comment
                    author={
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Text
                          strong
                          style={{
                            color: "#1A1A1B",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {item?.user?.username}
                        </Text>
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
                        {item?.updated_at && item?.updated_at !== item?.created_at && (
                          <>
                            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                            <Tooltip
                              title={`Terakhir diedit: ${dayjs(item?.updated_at).format("DD-MM-YYYY HH:mm")}`}
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
                        <Form
                          form={editForm}
                          initialValues={{ content: item?.comment_text }}
                          onFinish={(values) =>
                            onEdit(item, values.content, true)
                          }
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
                            <TextArea
                              rows={3}
                              style={{
                                borderRadius: "4px",
                                fontSize: "14px",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#FF4500";
                                e.target.style.boxShadow =
                                  "0 0 0 2px rgba(255, 69, 0, 0.2)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#d9d9d9";
                                e.target.style.boxShadow = "none";
                              }}
                            />
                          </Form.Item>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                              <Button
                                type="primary"
                                htmlType="submit"
                                size={isMobile ? "small" : "middle"}
                                loading={isUpdatingComment}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                                  borderColor: "#FF4500",
                                  boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                                }}
                              >
                                Simpan
                              </Button>
                              <Button
                                size={isMobile ? "small" : "middle"}
                                onClick={() => onEdit(null)}
                                style={{
                                  borderColor: "#d9d9d9",
                                  color: "#595959",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#FF4500";
                                  e.currentTarget.style.color = "#FF4500";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#d9d9d9";
                                  e.currentTarget.style.color = "#595959";
                                }}
                              >
                                Batal
                              </Button>
                            </Space>
                          </Form.Item>
                        </Form>
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
                    actions={renderCommentActions(item)}
                  />
                  {/* Reply Form - positioned right below this comment */}
                  {replyingTo === item.id && (
                    <div
                      style={{
                        marginLeft: isMobile ? "24px" : "36px",
                        marginTop: "8px",
                        marginBottom: "8px",
                        padding: "8px",
                        backgroundColor: "#F8F9FA",
                        borderRadius: "4px",
                        border: "1px solid #EDEFF1",
                      }}
                    >
                      <Comment
                        avatar={
                          <AvatarUser
                            src={currentUser?.image}
                            userId={currentUser?.custom_id}
                            user={currentUser}
                            size="small"
                          />
                        }
                        author={
                          <Text
                            strong
                            style={{
                              color: "#1A1A1B",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            {currentUser?.username}
                          </Text>
                        }
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
                              style={{ marginBottom: "16px" }}
                            >
                              <TextArea
                                rows={3}
                                placeholder={`Membalas ${item?.user?.username}...`}
                                style={{
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                  lineHeight: "21px",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "#FF4500";
                                  e.target.style.boxShadow =
                                    "0 0 0 2px rgba(255, 69, 0, 0.2)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "#d9d9d9";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                              <Space>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  size="small"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                                    borderColor: "#FF4500",
                                    boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                                    borderRadius: "4px",
                                  }}
                                >
                                  Balas
                                </Button>
                                <Button
                                  onClick={() => onReply(null)}
                                  size="small"
                                  style={{
                                    borderColor: "#d9d9d9",
                                    color: "#595959",
                                    borderRadius: "4px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor =
                                      "#FF4500";
                                    e.currentTarget.style.color = "#FF4500";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor =
                                      "#d9d9d9";
                                    e.currentTarget.style.color = "#595959";
                                  }}
                                >
                                  Batal
                                </Button>
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
