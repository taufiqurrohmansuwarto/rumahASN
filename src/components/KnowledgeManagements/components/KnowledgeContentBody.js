import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Comment } from "@ant-design/compatible";
import { Avatar, Card, Flex, Grid, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeContentBody = ({ data, actions }) => {
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
                minHeight: "200px",
              }}
            >
              <FileTextOutlined
                style={{ color: "#FF4500", fontSize: "18px" }}
              />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
            <Comment
              avatar={
                <Avatar
                  src={data?.author?.image}
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
                  {data?.author?.username}
                </Text>
              }
              actions={actions}
              datetime={
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: "#787C7E",
                  }}
                >
                  {dayjs(data?.created_at).format("DD MMMM YYYY")}
                </Text>
              }
              content={
                <div
                  style={{
                    padding: isMobile ? "16px 12px" : "24px 16px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #EDEFF1",
                    marginTop: "12px",
                    lineHeight: "1.8",
                    fontSize: isMobile ? "14px" : "15px",
                    color: "#1A1A1B",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <ReactMarkdownCustom withCustom={false}>
                    {data?.content}
                  </ReactMarkdownCustom>
                </div>
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

        /* Responsive markdown content */
        @media (max-width: 768px) {
          .ant-comment-content-author-name {
            font-size: 13px !important;
          }

          .ant-comment-content-author-time {
            font-size: 11px !important;
          }

          .markdown-content h1 {
            font-size: 20px !important;
          }

          .markdown-content h2 {
            font-size: 18px !important;
          }

          .markdown-content h3 {
            font-size: 16px !important;
          }

          .markdown-content p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </>
  );
};

export default KnowledgeContentBody;
