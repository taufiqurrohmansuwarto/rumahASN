import {
  ClockCircleOutlined,
  CommentOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const RecentHelpRequests = ({ requests = [] }) => {
  const router = useRouter();

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case "dokumen":
        return "📄";
      case "regulasi":
        return "📋";
      case "teknis":
        return "⚙️";
      case "keuangan":
        return "💰";
      default:
        return "❓";
    }
  };

  const gotoDetail = (id) => {
    router.push(`/asn-connect/asn-helper/bantuan/${id}/detail`);
  };

  if (!requests.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      {requests.map((request) => (
        <Card
          key={request.id}
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
          onClick={() => gotoDetail(request.id)}
        >
          <Flex>
            {/* Category Icon Section */}
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
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                {getCategoryIcon(request.category)}
              </div>
            </div>

            {/* Content Section */}
            <Flex vertical style={{ flex: 1, padding: "8px 12px" }}>
              {/* Request Meta */}
              <Flex align="center" gap={6} style={{ marginBottom: "4px" }}>
                <Avatar size={16} icon={<UserOutlined />} />
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#787C7E",
                    fontWeight: 500,
                  }}
                >
                  {request.requesterName}
                </Text>
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                  {request.location}
                </Text>
                <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                  {request.timeAgo}
                </Text>
              </Flex>

              {/* Title */}
              <Text
                style={{
                  fontSize: "14px",
                  color: "#1A1A1B",
                  fontWeight: 500,
                  marginBottom: "4px",
                  lineHeight: "18px",
                }}
              >
                {request.title}
              </Text>

              {/* Tags */}
              <Flex align="center" gap={8} style={{ marginBottom: "4px" }}>
                <Tag
                  color={getUrgencyColor(request.urgency)}
                  style={{ fontSize: "11px", margin: 0 }}
                >
                  {request.urgency === "very_urgent"
                    ? "SANGAT URGENT"
                    : request.urgency === "urgent"
                    ? "URGENT"
                    : "NORMAL"}
                </Tag>
                <Tag style={{ fontSize: "11px", margin: 0 }}>
                  {request.category.toUpperCase()}
                </Tag>
              </Flex>

              {/* Status */}
              <Flex align="center" gap={8}>
                <Badge
                  status={
                    request.status === "waiting_for_help"
                      ? "processing"
                      : "success"
                  }
                  text={
                    <Text style={{ fontSize: "11px", color: "#787C7E" }}>
                      {request.status === "waiting_for_help"
                        ? "Menunggu bantuan"
                        : "Sedang dibantu"}
                    </Text>
                  }
                />
              </Flex>
            </Flex>
          </Flex>
        </Card>
      ))}
    </div>
  );
};

export default RecentHelpRequests;
