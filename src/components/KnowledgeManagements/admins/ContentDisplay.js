import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Comment } from "@ant-design/compatible";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Divider, Flex, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ContentDisplay = ({ content, isMobile }) => {
  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Content Title */}
      <Title level={isMobile ? 4 : 3} style={{ marginBottom: "16px" }}>
        {content.title}
      </Title>

      <Comment
        avatar={<Avatar src={content.author?.image} icon={<UserOutlined />} />}
        author={
          <Flex align="center" gap="small">
            <span>{content.author?.username}</span>
            {content.author?.nama_jabatan && (
              <Tooltip
                title={content.author?.perangkat_daerah_detail}
                placement="top"
              >
                <Tag size="small" style={{ fontSize: "10px", cursor: "help" }}>
                  {content.author?.nama_jabatan}
                </Tag>
              </Tooltip>
            )}
          </Flex>
        }
        datetime={dayjs(content.created_at).format("DD MMM YYYY, HH:mm")}
        actions={[
          <Tooltip title="Dilihat" key="eye">
            <span>
              <EyeOutlined /> {content.views_count || 0}
            </span>
          </Tooltip>,
          <Tooltip title="Like" key="like">
            <span>
              <LikeOutlined /> {content.likes_count || 0}
            </span>
          </Tooltip>,
          <Tooltip title="Komentar" key="message">
            <span>
              <MessageOutlined /> {content.comments_count || 0}
            </span>
          </Tooltip>,
        ]}
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
              {content?.content}
            </ReactMarkdownCustom>
          </div>
        }
      />

      {/* Content Date Information - Top Right */}
      <Flex
        justify="flex-end"
        style={{ marginTop: "16px", marginBottom: "16px" }}
      >
        <div
          style={{
            textAlign: "right",
            padding: "8px 12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e9ecef",
          }}
        >
          <Space
            direction="vertical"
            size={4}
            split={<Divider style={{ margin: "2px 0" }} />}
          >
            <Text
              style={{
                fontSize: "11px",
                color: "#666",
                fontStyle: "italic",
                display: "block",
              }}
            >
              📅 Dibuat: {dayjs(content.created_at).format("DD/MM/YY HH:mm")}
            </Text>
            {content.verified_at && (
              <Text
                style={{
                  fontSize: "11px",
                  color: "#666",
                  fontStyle: "italic",
                  display: "block",
                }}
              >
                ✅ Verifikasi:{" "}
                {dayjs(content.verified_at).format("DD/MM/YY HH:mm")}
              </Text>
            )}
          </Space>
        </div>
      </Flex>
    </div>
  );
};

export default ContentDisplay;
