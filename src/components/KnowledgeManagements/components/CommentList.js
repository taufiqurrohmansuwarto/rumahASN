import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Comment } from "@ant-design/compatible";
import {
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  Space,
  Tooltip,
  Card,
  Flex,
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
            color: "#FF4500",
            cursor: "pointer",
            fontSize: isMobile ? "12px" : "13px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e53e00";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#FF4500";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <SendOutlined style={{ paddingRight: "4px" }} />
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
              color: "#FF4500",
              fontSize: isMobile ? "12px" : "13px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isUpdatingComment) {
                e.currentTarget.style.color = "#e53e00";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingComment) {
                e.currentTarget.style.color = "#FF4500";
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
              color: "#ff4d4f",
              fontSize: isMobile ? "12px" : "13px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDeletingComment) {
                e.currentTarget.style.color = "#cf1322";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeletingComment) {
                e.currentTarget.style.color = "#ff4d4f";
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
      <Card
        style={{
          width: "100%",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #EDEFF1",
          marginBottom: isMobile ? "12px" : "16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60px",
              }}
            >
              <MessageOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1 }}>
            <List
              dataSource={comments}
              loading={isLoading}
              style={{
                padding: isMobile ? "12px" : "16px",
              }}
              renderItem={(item) => (
                <div key={item.id} style={{ marginBottom: "16px" }}>
                  <Comment
                    author={
                      <Text
                        strong
                        style={{
                          color: "#1A1A1B",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                      >
                        {item?.user?.username}
                      </Text>
                    }
                    avatar={
                      <Avatar
                        src={item?.user?.image}
                        size={isMobile ? "small" : "default"}
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
                                borderRadius: "6px",
                                fontSize: isMobile ? "13px" : "14px",
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
                            fontSize: isMobile ? "13px" : "14px",
                            lineHeight: "1.6",
                            color: "#1A1A1B",
                          }}
                        >
                          <ReactMarkdownCustom withCustom={false}>
                            {item?.comment_text}
                          </ReactMarkdownCustom>
                        </div>
                      )
                    }
                    datetime={
                      <Text
                        type="secondary"
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          color: "#787C7E",
                        }}
                      >
                        {dayjs(item?.created_at).format("DD MMMM YYYY")}
                      </Text>
                    }
                    actions={renderCommentActions(item)}
                  />
                  {/* Reply Form - positioned right below this comment */}
                  {replyingTo === item.id && (
                    <div
                      style={{
                        marginLeft: isMobile ? "32px" : "48px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        padding: isMobile ? "8px" : "12px",
                        backgroundColor: "#F8F9FA",
                        borderRadius: "8px",
                        border: "1px solid #EDEFF1",
                      }}
                    >
                      <Comment
                        avatar={
                          <Avatar
                            src={currentUser?.image}
                            size={isMobile ? "small" : "default"}
                          />
                        }
                        author={
                          <Text
                            strong
                            style={{
                              color: "#1A1A1B",
                              fontSize: isMobile ? "13px" : "14px",
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
                            >
                              <TextArea
                                rows={3}
                                placeholder={`Membalas ${item?.user?.username}...`}
                                style={{
                                  borderRadius: "6px",
                                  fontSize: isMobile ? "13px" : "14px",
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
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                                    borderColor: "#FF4500",
                                    boxShadow:
                                      "0 2px 4px rgba(255, 69, 0, 0.3)",
                                  }}
                                >
                                  Balas
                                </Button>
                                <Button
                                  onClick={() => onReply(null)}
                                  size={isMobile ? "small" : "middle"}
                                  style={{
                                    borderColor: "#d9d9d9",
                                    color: "#595959",
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
          </div>
        </Flex>
      </Card>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
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
