import {
  MessageOutlined,
  StarFilled,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Card, Flex, Tag, Typography } from "antd";
import { useRouter } from "next/router";

const { Text } = Typography;

const AvailableHelpers = ({ helpers = [] }) => {
  const router = useRouter();

  const gotoProfile = (id) => {
    router.push(`/asn-connect/asn-helper/helper/${id}/profile`);
  };

  const startChat = (id) => {
    router.push(`/asn-connect/asn-helper/chat/${id}`);
  };

  if (!helpers.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      <Text
        style={{
          fontSize: "12px",
          color: "#787C7E",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          display: "block",
          marginBottom: "8px",
          paddingLeft: "12px",
        }}
      >
        Helper Tersedia
      </Text>

      {helpers.map((helper) => (
        <Card
          key={helper.id}
          style={{
            marginBottom: "8px",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            transition: "border-color 0.2s ease",
          }}
          bodyStyle={{ padding: 0 }}
          hoverable
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#898989";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#EDEFF1";
          }}
          onClick={() => gotoProfile(helper.id)}
        >
          <Flex>
            {/* Online Status Section */}
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
              <Badge dot status={helper.isOnline ? "success" : "default"}>
                <Avatar
                  size={24}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: helper.isOnline ? "#52C41A" : "#d9d9d9",
                  }}
                />
              </Badge>
            </div>

            {/* Content Section */}
            <Flex vertical style={{ flex: 1, padding: "8px 12px" }}>
              {/* Helper Info */}
              <Flex align="center" gap={8} style={{ marginBottom: "4px" }}>
                <Text
                  style={{
                    fontSize: "13px",
                    color: "#1A1A1B",
                    fontWeight: 600,
                  }}
                >
                  {helper.name}
                </Text>
                <Flex align="center" gap={2}>
                  <StarFilled style={{ color: "#FAAD14", fontSize: "10px" }} />
                  <Text style={{ fontSize: "11px", color: "#787C7E" }}>
                    {helper.rating}
                  </Text>
                </Flex>
              </Flex>

              {/* Expertise Tags */}
              <Flex gap={4} style={{ marginBottom: "6px" }}>
                {helper.expertise.slice(0, 2).map((exp, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: "10px",
                      margin: 0,
                      padding: "1px 6px",
                    }}
                  >
                    {exp.toUpperCase()}
                  </Tag>
                ))}
                {helper.expertise.length > 2 && (
                  <Text style={{ fontSize: "10px", color: "#787C7E" }}>
                    +{helper.expertise.length - 2} lainnya
                  </Text>
                )}
              </Flex>

              {/* Response Time & Action */}
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={4}>
                  <ThunderboltOutlined
                    style={{ fontSize: "10px", color: "#1890FF" }}
                  />
                  <Text style={{ fontSize: "11px", color: "#787C7E" }}>
                    {helper.responseTime}
                  </Text>
                </Flex>

                <Button
                  type="text"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    startChat(helper.id);
                  }}
                  style={{
                    fontSize: "10px",
                    height: "24px",
                    color: "#FF4500",
                  }}
                >
                  Chat
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      ))}
    </div>
  );
};

export default AvailableHelpers;
