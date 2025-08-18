import { Comment } from "@ant-design/compatible";
import {
  Avatar,
  Button,
  Form,
  Input,
  Card,
  Flex,
  Grid,
  Typography,
  Space,
} from "antd";
import { EditOutlined } from "@ant-design/icons";

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
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "16px",
                minHeight: "120px",
              }}
            >
              <EditOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
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
                <Form form={form} onFinish={onSubmit}>
                  <Form.Item
                    name="content"
                    rules={[
                      {
                        required: true,
                        message: "Komentar tidak boleh kosong!",
                      },
                    ]}
                    style={{ marginBottom: isMobile ? "12px" : "16px" }}
                  >
                    <TextArea
                      rows={4}
                      placeholder={placeholder}
                      disabled={loading}
                      style={{
                        borderRadius: "6px",
                        fontSize: isMobile ? "13px" : "14px",
                        lineHeight: "1.6",
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
                        size={isMobile ? "small" : "middle"}
                        style={{
                          background:
                            "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                          borderColor: "#FF4500",
                          boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                          borderRadius: "6px",
                        }}
                      >
                        {buttonText}
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              }
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

        /* Fix untuk icon section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        /* Fix untuk content section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
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

        /* Responsive styling */
        @media (max-width: 768px) {
          .ant-comment-content-author-name {
            font-size: 13px !important;
          }

          .ant-form-item {
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FormComment;
