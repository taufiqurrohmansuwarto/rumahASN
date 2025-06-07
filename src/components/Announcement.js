import { getAnnouncements } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, Typography, Flex, Skeleton } from "antd";
import { BellOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ReactMarkdownCustom from "./MarkdownEditor/ReactMarkdownCustom";

const { Title, Text } = Typography;

function Announcement() {
  const { data, isLoading } = useQuery(
    ["announcements"],
    () => getAnnouncements(),
    {}
  );

  if (isLoading) {
    return (
      <Card
        style={{
          marginBottom: "16px",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Skeleton */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #EDEFF1",
            backgroundColor: "#FFF7E6",
          }}
        >
          <Flex align="center" gap={8}>
            <Skeleton.Avatar size={24} />
            <Skeleton.Input style={{ width: 200 }} active size="small" />
          </Flex>
        </div>

        {/* Content Skeleton */}
        <div style={{ padding: "16px" }}>
          <Skeleton paragraph={{ rows: 3 }} active />
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card
      style={{
        marginBottom: "16px",
        border: "1px solid #FF4500",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(255, 69, 0, 0.1)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #EDEFF1",
          background: "linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 100%)",
        }}
      >
        <Flex align="center" gap={8}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#FF4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BellOutlined style={{ color: "white", fontSize: "12px" }} />
          </div>
          <Title
            level={5}
            style={{
              margin: 0,
              color: "#1A1A1B",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {data?.title}
          </Title>
          <div
            style={{
              marginLeft: "auto",
              padding: "2px 8px",
              backgroundColor: "#FF4500",
              borderRadius: "12px",
              fontSize: "10px",
              color: "white",
              fontWeight: 600,
            }}
          >
            PENGUMUMAN
          </div>
        </Flex>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            color: "#1A1A1B",
            fontSize: "14px",
            lineHeight: "22px",
          }}
        >
          <ReactMarkdownCustom>{data?.content}</ReactMarkdownCustom>
        </div>

        {/* Info Footer */}
        <Flex
          align="center"
          gap={6}
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: "#F8F9FA",
            borderRadius: "4px",
            border: "1px solid #EDEFF1",
          }}
        >
          <InfoCircleOutlined style={{ color: "#FF4500", fontSize: "14px" }} />
          <Text
            style={{
              fontSize: "12px",
              color: "#787C7E",
              fontStyle: "italic",
            }}
          >
            Informasi ini penting untuk seluruh komunitas ASN
          </Text>
        </Flex>
      </div>
    </Card>
  );
}

export default Announcement;
