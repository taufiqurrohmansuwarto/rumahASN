import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Comment } from "@ant-design/compatible";
import { DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Form, Input, List, Space, Tooltip } from "antd";
import dayjs from "dayjs";

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

export default CommentList;
