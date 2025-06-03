import { landingData } from "@/services/index";
import { StarOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Badge,
  Card,
  Carousel,
  Col,
  Flex,
  Rate,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { useRef } from "react";

const { Title, Text } = Typography;

export default function UserRating() {
  const { data, isLoading } = useQuery(["landing"], () => landingData(), {
    refetchOnWindowFocus: false,
  });

  const carouselRef = useRef(null);

  // Auto play settings
  const carouselSettings = {
    autoplay: true,
    autoplaySpeed: 8000,
    dots: true,
    infinite: true,
    speed: 500,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: "64px 24px",
          backgroundColor: "#FAFAFB",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map((item) => (
              <Col xs={24} sm={12} lg={8} key={item}>
                <Card style={{ borderRadius: "16px" }}>
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "64px 24px",
        backgroundColor: "#FAFAFB",
        minHeight: "60vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <Flex justify="center" style={{ marginBottom: "16px" }}>
            <Badge
              count="Testimoni Rumah ASN"
              style={{
                backgroundColor: "#6366F1",
                fontSize: "14px",
                fontWeight: 600,
                padding: "8px 20px",
                height: "auto",
                borderRadius: "20px",
              }}
            />
          </Flex>

          <Title
            level={1}
            style={{
              margin: "0 0 16px 0",
              color: "#1F2937",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 42px)",
              lineHeight: "1.2",
            }}
          >
            Testi Mantul Rumah ASN: Asli dari Pengguna, No Debat!
          </Title>

          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto 24px auto",
              position: "relative",
            }}
          >
            <Text
              style={{
                color: "#6B7280",
                fontSize: "18px",
                lineHeight: "28px",
                display: "block",
              }}
            >
              Mau tau gimana pengalaman teman-teman lain pas pakai Rumah ASN?
              Cus cek Testi Mantul kita! Di sini, kamu bisa lihat dan baca
              testimoni asli dari pengguna. Jangan cuma denger, cobain sendiri!
            </Text>
            <div
              style={{
                content: '""',
                display: "block",
                backgroundColor: "#6366F1",
                width: "60px",
                height: "4px",
                borderRadius: "2px",
                margin: "24px auto 0 auto",
              }}
            />
          </div>
        </div>

        {/* Carousel Section */}
        <div style={{ position: "relative" }}>
          <Carousel ref={carouselRef} {...carouselSettings}>
            {data?.hasil?.map((d) => {
              return (
                <div key={d?.key}>
                  {d?.data?.length && (
                    <div style={{ padding: "0 12px" }}>
                      <Row gutter={[24, 24]}>
                        {d?.data?.map((item) => (
                          <Col xs={24} sm={12} lg={8} key={item?.id}>
                            <Card
                              style={{
                                borderRadius: "20px",
                                border: "1px solid #E5E7EB",
                                backgroundColor: "white",
                                transition: "all 0.3s ease",
                                cursor: "default",
                                height: "100%",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                              }}
                              bodyStyle={{
                                padding: "32px",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                              hoverable
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-8px)";
                                e.currentTarget.style.boxShadow =
                                  "0 12px 32px rgba(0, 0, 0, 0.12)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0, 0, 0, 0.05)";
                              }}
                            >
                              <Space
                                direction="vertical"
                                size={20}
                                style={{ width: "100%", height: "100%" }}
                              >
                                {/* User Info */}
                                <Flex
                                  direction="vertical"
                                  align="center"
                                  gap={16}
                                >
                                  <div style={{ position: "relative" }}>
                                    <Avatar
                                      src={item?.customer?.image}
                                      size={80}
                                      icon={<UserOutlined />}
                                      style={{
                                        border: "4px solid #F3F4F6",
                                        boxShadow:
                                          "0 4px 12px rgba(0, 0, 0, 0.1)",
                                      }}
                                    />
                                    <div
                                      style={{
                                        position: "absolute",
                                        bottom: "-2px",
                                        right: "-2px",
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: "#22C55E",
                                        border: "3px solid white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <StarOutlined
                                        style={{
                                          color: "white",
                                          fontSize: "10px",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div style={{ textAlign: "center" }}>
                                    <Text
                                      strong
                                      style={{
                                        color: "#1F2937",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        display: "block",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      {item?.customer?.username}
                                    </Text>

                                    <Rate
                                      disabled
                                      defaultValue={5}
                                      style={{
                                        color: "#F59E0B",
                                        fontSize: "16px",
                                      }}
                                    />
                                  </div>
                                </Flex>

                                {/* Testimonial */}
                                <div
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      position: "relative",
                                      padding: "20px",
                                      backgroundColor: "#F8FAFC",
                                      borderRadius: "16px",
                                      border: "1px solid #E2E8F0",
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: "-8px",
                                        left: "24px",
                                        width: "16px",
                                        height: "16px",
                                        backgroundColor: "#F8FAFC",
                                        border: "1px solid #E2E8F0",
                                        borderBottom: "none",
                                        borderRight: "none",
                                        transform: "rotate(45deg)",
                                      }}
                                    />
                                    <Text
                                      style={{
                                        color: "#4B5563",
                                        fontSize: "15px",
                                        lineHeight: "24px",
                                        fontStyle: "italic",
                                        textAlign: "center",
                                      }}
                                    >
                                      &ldquo;{item?.requester_comment}&rdquo;
                                    </Text>
                                  </div>
                                </div>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </div>
              );
            })}
          </Carousel>

          {/* Custom Carousel Navigation Styling */}
          <style jsx global>{`
            .ant-carousel .ant-carousel-dots {
              bottom: -40px;
            }
            .ant-carousel .ant-carousel-dots li button {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #d1d5db;
              border: none;
              transition: all 0.3s ease;
            }
            .ant-carousel
              .ant-carousel-dots
              li.ant-carousel-dots-active
              button {
              background: #6366f1;
              width: 24px;
              border-radius: 6px;
            }
            .ant-carousel .ant-carousel-dots li:hover button {
              background: #9ca3af;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
