import { EyeOutlined } from "@ant-design/icons";
import { Card, Flex, Tag, Typography, Divider } from "antd";

const { Text, Title } = Typography;

const PreviewPanel = ({ formData, isVisible = true }) => {
  if (!isVisible || !formData) {
    return null;
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "very_urgent":
        return "#ff4d4f";
      case "urgent":
        return "#fa8c16";
      default:
        return "#52c41a";
    }
  };

  return (
    <Card
      style={{
        marginBottom: "8px",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <EyeOutlined style={{ fontSize: 16, color: "#52C41A" }} />
        </div>

        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          <Text
            style={{
              fontSize: "14px",
              color: "#1A1A1B",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Preview Permintaan Bantuan
          </Text>

          {formData.title && (
            <Title
              level={5}
              style={{
                margin: "0 0 8px 0",
                color: "#1A1A1B",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {formData.title}
            </Title>
          )}

          <Flex gap={8} style={{ marginBottom: "8px" }}>
            {formData.category && (
              <Tag style={{ fontSize: "11px" }}>
                {formData.category.toUpperCase()}
              </Tag>
            )}
            {formData.urgency && (
              <Tag
                color={getUrgencyColor(formData.urgency)}
                style={{ fontSize: "11px" }}
              >
                {formData.urgency === "very_urgent"
                  ? "SANGAT URGENT"
                  : formData.urgency === "urgent"
                  ? "URGENT"
                  : "NORMAL"}
              </Tag>
            )}
          </Flex>

          {formData.description && (
            <Text
              style={{
                fontSize: "13px",
                color: "#787C7E",
                lineHeight: "18px",
                marginBottom: "8px",
              }}
            >
              {formData.description.length > 150
                ? `${formData.description.substring(0, 150)}...`
                : formData.description}
            </Text>
          )}

          {formData.tags && formData.tags.length > 0 && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Flex wrap="wrap" gap={4}>
                {formData.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: "10px",
                      borderRadius: "10px",
                      backgroundColor: "#FF450020",
                      borderColor: "#FF4500",
                      color: "#FF4500",
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Flex>
            </>
          )}

          {formData.attachments && formData.attachments.length > 0 && (
            <Text
              style={{ fontSize: "11px", color: "#787C7E", marginTop: "4px" }}
            >
              📎 {formData.attachments.length} file lampiran
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default PreviewPanel;
