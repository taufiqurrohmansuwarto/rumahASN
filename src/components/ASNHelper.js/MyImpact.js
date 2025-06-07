import {
  TrophyOutlined,
  StarFilled,
  ThunderboltOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography } from "antd";

const { Text } = Typography;

const MyImpact = ({ impact }) => {
  if (!impact) {
    return null;
  }

  const impactStats = [
    {
      label: "Bantuan Bulan Ini",
      value: impact.helpsGivenThisMonth,
      color: "#FF4500",
      icon: <TrophyOutlined />,
    },
    {
      label: "Rating Rata-rata",
      value: impact.averageRating,
      color: "#FAAD14",
      icon: <StarFilled />,
    },
    {
      label: "Waktu Respon",
      value: impact.responseTime,
      color: "#1890FF",
      icon: <ThunderboltOutlined />,
    },
  ];

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
        {/* Icon Section */}
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
          <LoadingOutlined style={{ fontSize: 16, color: "#52C41A" }} />
        </div>

        {/* Content Section */}
        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          {/* Header */}
          <Text
            style={{
              fontSize: "12px",
              color: "#1A1A1B",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Impact Anda
          </Text>

          {/* Stats Grid */}
          <Row gutter={[16, 8]} style={{ marginBottom: "12px" }}>
            {impactStats.map((stat, index) => (
              <Col span={8} key={index}>
                <Flex vertical align="center">
                  <div style={{ color: stat.color, fontSize: "12px" }}>
                    {stat.icon}
                  </div>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: stat.color,
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "#787C7E",
                      textAlign: "center",
                    }}
                  >
                    {stat.label}
                  </Text>
                </Flex>
              </Col>
            ))}
          </Row>

          {/* Badge Progress */}
          <div
            style={{
              padding: "8px",
              backgroundColor: "#F8F9FA",
              borderRadius: "4px",
              border: "1px solid #EDEFF1",
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: "4px" }}
            >
              <Text
                style={{ fontSize: "11px", color: "#1A1A1B", fontWeight: 600 }}
              >
                Progress ke{" "}
                {impact.badgeProgress.next.replace("_", " ").toUpperCase()}
              </Text>
              <Text style={{ fontSize: "11px", color: "#787C7E" }}>
                {impact.badgeProgress.progress}%
              </Text>
            </Flex>
            <Progress
              percent={impact.badgeProgress.progress}
              size="small"
              strokeColor="#52C41A"
              showInfo={false}
            />
          </div>
        </Flex>
      </Flex>
    </Card>
  );
};

export default MyImpact;
