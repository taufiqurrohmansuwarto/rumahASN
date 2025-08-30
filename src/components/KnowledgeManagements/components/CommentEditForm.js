import { Button, Form, Input, Space, Grid } from "antd";

const { TextArea } = Input;
const { useBreakpoint } = Grid;

const CommentEditForm = ({
  form,
  comment,
  onEdit,
  isUpdatingComment,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Form
      form={form}
      initialValues={{ content: comment?.comment_text }}
      onFinish={(values) => onEdit(comment, values.content, true)}
    >
      <Form.Item
        name="content"
        rules={[
          {
            required: true,
            message: "Komentar tidak boleh kosong!",
          },
          {
            validator: (_, value) => {
              if (value) {
                const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
                if (wordCount > 200) {
                  return Promise.reject(`Komentar maksimal 200 kata. Saat ini: ${wordCount} kata`);
                }
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <TextArea
          rows={3}
          disabled={isUpdatingComment}
          style={{
            borderRadius: "4px",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            if (!isUpdatingComment) {
              e.target.style.borderColor = "#FF4500";
              e.target.style.boxShadow = "0 0 0 2px rgba(255, 69, 0, 0.2)";
            }
          }}
          onBlur={(e) => {
            if (!isUpdatingComment) {
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
            size={isMobile ? "small" : "middle"}
            loading={isUpdatingComment}
            disabled={isUpdatingComment}
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              borderColor: "#FF4500",
              boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
            }}
          >
            Simpan
          </Button>
          <Button
            size={isMobile ? "small" : "middle"}
            onClick={() => onEdit(null)}
            disabled={isUpdatingComment}
            style={{
              borderColor: "#d9d9d9",
              color: "#595959",
            }}
            onMouseEnter={(e) => {
              if (!isUpdatingComment) {
                e.currentTarget.style.borderColor = "#FF4500";
                e.currentTarget.style.color = "#FF4500";
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingComment) {
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
  );
};

export default CommentEditForm;