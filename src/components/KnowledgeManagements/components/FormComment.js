import { Comment } from "@ant-design/compatible";
import { Button, Form, Input, Grid, Typography, Space } from "antd";
import AvatarUser from "@/components/Users/AvatarUser";
import UserText from "@/components/Users/UserText";

const { TextArea } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const FormComment = ({
  form,
  currentUser,
  onSubmit,
  placeholder = "Tulis komentar...",
  buttonText = "Kirim Komentar",
  loading = false,
}) => {
  // Responsive breakpoints - sama seperti komponen lainnya
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Comment
      avatar={
        <AvatarUser
          src={currentUser?.image}
          userId={currentUser?.custom_id}
          user={currentUser}
          size={isMobile ? "small" : "default"}
        />
      }
      author={
        <div style={{ fontSize: "14px", fontWeight: 600 }}>
          <UserText 
            userId={currentUser?.custom_id}
            text={currentUser?.username}
          />
        </div>
      }
      content={
        <Form form={form} onFinish={onSubmit}>
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                message: "Komentar tidak boleh kosong!",
              },
            ]}
            style={{ marginBottom: "16px" }}
          >
            <TextArea
              rows={4}
              placeholder={placeholder}
              disabled={loading}
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
                loading={loading}
                disabled={loading}
                size={isMobile ? "small" : "middle"}
                style={{
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  borderColor: "#FF4500",
                  boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                  borderRadius: "4px",
                }}
              >
                {buttonText}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      }
    />
  );
};

export default FormComment;
