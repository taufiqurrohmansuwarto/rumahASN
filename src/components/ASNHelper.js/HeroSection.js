import {
  UserOutlined,
  StarFilled,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Typography,
  Badge,
  Divider,
} from "antd";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

const HeroSection = ({ user, stats }) => {
  const router = useRouter();

  const gotoCreateRequest = () => {
    router.push("/asn-connect/asn-helper/bantuan/buat");
  };

  const gotoHelpOthers = () => {
    router.push("/asn-connect/asn-helper/bantuan/beri");
  };

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        padding: "20px 0",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {/* Quick Action Card - Reddit Style */}
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
              {/* Status indicator - Reddit Style Vote Section */}
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
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor:
                      user?.availabilityStatus === "online"
                        ? "#52C41A"
                        : "#878A8C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserOutlined style={{ color: "white", fontSize: "12px" }} />
                </div>
              </div>

              {/* Content Section */}
              <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
                {/* User Meta */}
                <Flex align="center" gap={8} style={{ marginBottom: "4px" }}>
                  <Avatar size={20} src={user?.avatar} />
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#787C7E",
                      fontWeight: 500,
                    }}
                  >
                    {user?.name}
                  </Text>
                  <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                  <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                    {user?.title}
                  </Text>
                  {user?.isHelper && (
                    <>
                      <span style={{ color: "#787C7E", fontSize: "12px" }}>
                        •
                      </span>
                      <Badge
                        color="#FF4500"
                        text={
                          <Text style={{ fontSize: "11px", fontWeight: 600 }}>
                            {user?.helperLevel === "expert"
                              ? "EXPERT"
                              : "HELPER"}
                          </Text>
                        }
                      />
                    </>
                  )}
                </Flex>

                {/* Welcome Message */}
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#1A1A1B",
                    fontWeight: 500,
                    marginBottom: "8px",
                    lineHeight: "18px",
                  }}
                >
                  Ada <strong>12 ASN</strong> yang butuh bantuanmu hari ini
                </Text>

                {/* Action Buttons */}
                <Flex gap={8}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={gotoCreateRequest}
                    style={{
                      backgroundColor: "#FF4500",
                      borderColor: "#FF4500",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: "28px",
                      padding: "0 12px",
                    }}
                  >
                    Minta Bantuan
                  </Button>
                  <Button
                    size="small"
                    icon={<HeartOutlined />}
                    onClick={gotoHelpOthers}
                    style={{
                      borderColor: "#EDEFF1",
                      color: "#787C7E",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: "28px",
                      padding: "0 12px",
                    }}
                  >
                    Beri Bantuan
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Stats Card - Reddit Style */}
          <Card
            style={{
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
                <TrophyOutlined style={{ fontSize: 16, color: "#FF4500" }} />
              </div>

              {/* Stats Content */}
              <Flex style={{ flex: 1, padding: "12px 16px" }}>
                <Row gutter={[24, 8]} style={{ width: "100%" }}>
                  <Col span={6}>
                    <Flex vertical align="center">
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#FF4500",
                          lineHeight: 1,
                        }}
                      >
                        {stats?.totalHelpsThisWeek || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#787C7E",
                          textAlign: "center",
                        }}
                      >
                        Bantuan
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={6}>
                    <Flex vertical align="center">
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#52C41A",
                          lineHeight: 1,
                        }}
                      >
                        {stats?.activeHelpersNow || 0}
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#787C7E",
                          textAlign: "center",
                        }}
                      >
                        Online
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={6}>
                    <Flex vertical align="center">
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#1890FF",
                          lineHeight: 1,
                        }}
                      >
                        {stats?.avgResponseTime || "0m"}
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#787C7E",
                          textAlign: "center",
                        }}
                      >
                        Respon
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={6}>
                    <Flex vertical align="center">
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#FA8C16",
                          lineHeight: 1,
                        }}
                      >
                        {stats?.successRate || 0}%
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#787C7E",
                          textAlign: "center",
                        }}
                      >
                        Sukses
                      </Text>
                    </Flex>
                  </Col>
                </Row>
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
