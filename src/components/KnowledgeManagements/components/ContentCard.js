import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Flex, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ContentCard = ({ content, isMobile, onClick }) => {
  return (
    <Card
      style={{
        marginBottom: isMobile ? "12px" : "16px",
        borderRadius: isMobile ? "8px" : "12px",
        border: "1px solid #EDEFF1",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      hoverable
      onClick={onClick}
    >
      <Space direction="vertical" size={0} style={{ width: "100%" }}>
        {/* Title */}
        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: 0,
            marginBottom: isMobile ? "8px" : "18px",
            fontWeight: 600,
            color: "#1A1A1B",
            lineHeight: "1.4",
            fontWeight: 600,
            display: "-webkit-box",
            "-webkit-line-clamp": isMobile ? 2 : 3,
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={content.title}
        >
          {content.title}
        </Title>

        {/* Author Info */}
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: isMobile ? "12px" : "16px" }}
        >
          <Flex align="center" gap="small">
            <div style={{ position: "relative" }}>
              <Avatar
                size={isMobile ? 32 : 40}
                src={content.author?.image}
                icon={<UserOutlined />}
                style={{
                  border: "2px solid #f0f0f0",
                }}
              />
              {content.author?.is_online && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0px",
                    right: "0px",
                    width: isMobile ? "8px" : "10px",
                    height: isMobile ? "8px" : "10px",
                    backgroundColor: "#52c41a",
                    border: "2px solid white",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                strong
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: "#1A1A1B",
                  display: "block",
                  lineHeight: "1.2",
                  marginBottom: "2px",
                }}
              >
                {content.author?.username}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#8c8c8c",
                  display: "block",
                  lineHeight: "1.2",
                }}
                title={dayjs(content.created_at).format("DD-MM-YYYY HH:mm")}
              >
                {dayjs(content.created_at).fromNow()}
              </Text>
            </div>
          </Flex>

          {/* Category Tags */}
          <Flex gap="small" wrap="wrap">
            {content.category && (
              <Tag
                color="#FF4500"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  fontWeight: 500,
                }}
              >
                {content.category.name}
              </Tag>
            )}
          </Flex>
        </Flex>
      </Space>

      {/* Content preview */}
      {content?.content && (
        <div
          style={{
            marginTop: isMobile ? "12px" : "16px",
            marginBottom: isMobile ? "16px" : "20px",
            padding: isMobile ? "12px" : "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.6",
              color: "#262626",
              display: "-webkit-box",
              "-webkit-line-clamp": 4,
              "-webkit-box-orient": "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            <ReactMarkdownCustom withCustom={false}>
              {content?.content?.substring(0, 300)}
            </ReactMarkdownCustom>
          </div>
          {content?.content?.length > 300 && (
            <Text
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#8c8c8c",
                marginTop: "8px",
                fontStyle: "italic",
              }}
            >
              Baca selengkapnya...
            </Text>
          )}
        </div>
      )}

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
          <Flex gap="small" wrap="wrap">
            {content.tags?.slice(0, 3).map((tag, index) => (
              <Tag
                key={index}
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e8e8e8",
                  color: "#595959",
                  margin: 0,
                }}
              >
                {tag}
              </Tag>
            ))}
            {content.tags?.length > 3 && (
              <Tag
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "11px",
                  padding: "2px 8px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #d9d9d9",
                  color: "#8c8c8c",
                  margin: 0,
                }}
              >
                +{content.tags.length - 3}
              </Tag>
            )}
          </Flex>
        </div>
      )}

      {/* Bottom Actions */}
      <div
        style={{
          paddingTop: isMobile ? "8px" : "12px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Flex justify="space-between" align="center">
          <Space size={isMobile ? "middle" : "large"}>
            <Flex align="center" gap="small">
              <EyeOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.views_count || 0}
              </Text>
            </Flex>
            <Flex align="center" gap="small">
              <LikeOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.likes_count || 0}
              </Text>
            </Flex>
            <Flex align="center" gap="small">
              <MessageOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <Text
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#8c8c8c",
                }}
              >
                {content.comments_count || 0}
              </Text>
            </Flex>
          </Space>

          <Text
            style={{
              fontSize: isMobile ? "11px" : "12px",
              color: "#52c41a",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {content.status}
          </Text>
        </Flex>
      </div>
    </Card>
  );
};

export default ContentCard;
