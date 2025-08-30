import { Comment } from "@ant-design/compatible";
import { Button, Form, Input, Space } from "antd";
import AvatarUser from "@/components/Users/AvatarUser";

const { TextArea } = Input;

const CommentReplyForm = ({
  form,
  parentComment,
  currentUser,
  onReply,
  isCreatingComment,
}) => {
  return (
    <Comment
      avatar={
        <AvatarUser
          src={currentUser?.image}
          userId={currentUser?.custom_id}
          user={currentUser}
          size="small"
        />
      }
      content={
        <Form
          form={form}
          onFinish={(values) => onReply(parentComment.id, values.content, true)}
        >
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                message: "Balasan tidak boleh kosong!",
              },
              {
                validator: (_, value) => {
                  if (value) {
                    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
                    if (wordCount > 200) {
                      return Promise.reject(`Balasan maksimal 200 kata. Saat ini: ${wordCount} kata`);
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ marginBottom: "16px" }}
          >
            <TextArea
              rows={3}
              placeholder={`Membalas ${parentComment?.user?.username}...`}
              disabled={isCreatingComment}
              style={{
                borderRadius: "4px",
                fontSize: "14px",
                lineHeight: "21px",
              }}
              onFocus={(e) => {
                if (!isCreatingComment) {
                  e.target.style.borderColor = "#FF4500";
                  e.target.style.boxShadow = "0 0 0 2px rgba(255, 69, 0, 0.2)";
                }
              }}
              onBlur={(e) => {
                if (!isCreatingComment) {
                  e.target.style.borderColor = "#d9d9d9";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="small"
                loading={isCreatingComment}
                disabled={isCreatingComment}
                style={{
                  background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
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
                disabled={isCreatingComment}
                style={{
                  borderColor: "#d9d9d9",
                  color: "#595959",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  if (!isCreatingComment) {
                    e.currentTarget.style.borderColor = "#FF4500";
                    e.currentTarget.style.color = "#FF4500";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreatingComment) {
                    e.currentTarget.style.borderColor = "#d9d9d9";
                    e.currentTarget.style.color = "#595959";
                  }
                }}
              >
                Batal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      }
    />
  );
};

export default CommentReplyForm;