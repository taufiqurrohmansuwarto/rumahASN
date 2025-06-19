import { Alert, Card, Col, Empty, Row, Space, Typography, Button } from "antd";
import { useRouter } from "next/router";
import {
  BankOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

function LayananKeuanganLandingPage() {
  const router = useRouter();

  const cardStyle = {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  };

  const hoverStyle = {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
            color: "white",
          }}
        >
          <Title
            level={1}
            style={{
              color: "white",
              fontSize: "3rem",
              fontWeight: "700",
              marginBottom: "16px",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Layanan Keuangan ASN
          </Title>
          <Text
            style={{
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.9)",
              display: "block",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Solusi keuangan terpercaya dengan bunga kompetitif khusus untuk
            Aparatur Sipil Negara
          </Text>
        </div>

        {/* Benefits Banner */}
        <Row gutter={[24, 24]} style={{ marginBottom: "48px" }}>
          <Col span={24}>
            <Card
              style={{
                ...cardStyle,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Row gutter={[32, 16]} align="middle">
                <Col xs={24} md={8} style={{ textAlign: "center" }}>
                  <SafetyOutlined
                    style={{
                      fontSize: "2rem",
                      color: "#667eea",
                      marginBottom: "8px",
                    }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0, color: "#1a202c" }}>
                      Terpercaya
                    </Title>
                    <Text type="secondary">Diawasi OJK</Text>
                  </div>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: "center" }}>
                  <ClockCircleOutlined
                    style={{
                      fontSize: "2rem",
                      color: "#667eea",
                      marginBottom: "8px",
                    }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0, color: "#1a202c" }}>
                      Proses Cepat
                    </Title>
                    <Text type="secondary">3-7 hari kerja</Text>
                  </div>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: "center" }}>
                  <BankOutlined
                    style={{
                      fontSize: "2rem",
                      color: "#667eea",
                      marginBottom: "8px",
                    }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0, color: "#1a202c" }}>
                      Bunga Kompetitif
                    </Title>
                    <Text type="secondary">Khusus ASN</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Bank Cards */}
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              style={cardStyle}
              bodyStyle={{ padding: "32px" }}
              cover={
                <div
                  style={{
                    height: "200px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      alt="Bank Jatim"
                      src="https://siasn.bkd.jatimprov.go.id:9000/public/logo-bank-jatim.png"
                      style={{ height: "60px", objectFit: "contain" }}
                    />
                  </div>
                </div>
              }
              onClick={() =>
                router.push("/layanan-keuangan/bank-jatim/produk/kkb")
              }
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, hoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, cardStyle);
              }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Title level={3} style={{ margin: 0, color: "#1a202c" }}>
                    Bank Jatim
                  </Title>
                  <Text type="secondary">Partner keuangan terpercaya</Text>
                </div>

                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <Text>
                      KPR hingga <strong>5 Milyar</strong>
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <Text>
                      Multiguna hingga <strong>500 Juta</strong>
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <Text>
                      Proses cepat <strong>3-7 hari</strong>
                    </Text>
                  </div>
                </Space>

                <Button
                  type="primary"
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "8px",
                    height: "48px",
                    fontWeight: "600",
                  }}
                  block
                >
                  Ajukan Sekarang
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              style={{
                ...cardStyle,
                opacity: 0.7,
                cursor: "not-allowed",
              }}
            >
              <div
                style={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                  }}
                >
                  <BankOutlined
                    style={{ fontSize: "2rem", color: "#64748b" }}
                  />
                </div>
                <Title
                  level={4}
                  style={{ color: "#64748b", marginBottom: "8px" }}
                >
                  Partner Lainnya
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Segera hadir untuk melayani Anda
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              style={{
                ...cardStyle,
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "white",
              }}
            >
              <div
                style={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "32px",
                }}
              >
                <Title
                  level={3}
                  style={{ color: "white", marginBottom: "16px" }}
                >
                  Butuh Bantuan?
                </Title>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: "24px",
                    fontSize: "16px",
                  }}
                >
                  Tim customer service kami siap membantu Anda 24/7
                </Text>
                <Button
                  size="large"
                  style={{
                    background: "white",
                    color: "#f59e0b",
                    border: "none",
                    borderRadius: "8px",
                    height: "48px",
                    fontWeight: "600",
                    minWidth: "160px",
                  }}
                >
                  Hubungi Kami
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default LayananKeuanganLandingPage;
