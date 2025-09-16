import React from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { QuestionCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;

const CTAQuestion = ({
  title = "Ada Pertanyaan Seputar Kepegawaian?",
  description = "Tim ahli Rumah ASN siap membantu menjawab segala pertanyaan Anda seputar dunia kepegawaian. Dari regulasi terbaru hingga prosedur administratif.",
  buttonText = "Ajukan Pertanyaan",
  variant = "default" // default, compact, floating
}) => {
  const router = useRouter();

  const handlePertanyan = () => {
    router.push(`/tickets/create`);
  };

  if (variant === "compact") {
    return (
      <div
        style={{
          padding: "16px",
          background: "linear-gradient(135deg, #ff7a45 0%, #ff4500 100%)",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "24px"
        }}
      >
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <QuestionCircleOutlined style={{ color: "white", fontSize: "18px" }} />
            <Text strong style={{ color: "white", fontSize: "15px" }}>
              Butuh Bantuan Kepegawaian?
            </Text>
          </div>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<MessageOutlined />}
            onClick={handlePertanyan}
            style={{
              borderColor: "white",
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#ff4500";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.color = "white";
            }}
          >
            Tanya Sekarang
          </Button>
        </Space>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          maxWidth: "300px"
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            border: "1px solid #ff7a45"
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff7a45, #ff4500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <QuestionCircleOutlined style={{ color: "white", fontSize: "16px" }} />
              </div>
              <Title level={5} style={{ margin: 0, color: "#262626" }}>
                Perlu Bantuan?
              </Title>
            </div>

            <Text type="secondary" style={{ fontSize: "13px", lineHeight: 1.5 }}>
              Tim ahli siap membantu pertanyaan kepegawaian Anda
            </Text>

            <Button
              type="primary"
              block
              icon={<MessageOutlined />}
              onClick={handlePertanyan}
              style={{
                background: "linear-gradient(135deg, #ff7a45, #ff4500)",
                borderColor: "#ff4500",
                borderRadius: "6px",
                fontWeight: 500
              }}
            >
              Ajukan Pertanyaan
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  // Default variant
  return (
    <Card
      style={{
        background: "linear-gradient(135deg, #fff7f0 0%, #fff2e8 100%)",
        border: "1px solid #ffd8bf",
        borderRadius: "12px",
        marginBottom: "24px",
        overflow: "hidden"
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff7a45, #ff4500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 12px rgba(255, 69, 0, 0.3)"
              }}
            >
              <QuestionCircleOutlined style={{ color: "white", fontSize: "24px" }} />
            </div>

            <Title level={3} style={{ margin: "0 0 8px 0", color: "#262626" }}>
              {title}
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                display: "block",
                maxWidth: "500px",
                margin: "0 auto"
              }}
            >
              {description}
            </Text>
          </div>

          {/* Features */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "24px",
            margin: "8px 0"
          }}>
            <div style={{ textAlign: "center", minWidth: "140px" }}>
              <div style={{
                color: "#ff4500",
                fontSize: "18px",
                marginBottom: "4px"
              }}>
                ⚡
              </div>
              <Text strong style={{ fontSize: "13px", color: "#595959" }}>
                Respon Cepat
              </Text>
            </div>
            <div style={{ textAlign: "center", minWidth: "140px" }}>
              <div style={{
                color: "#ff4500",
                fontSize: "18px",
                marginBottom: "4px"
              }}>
                👨‍💼
              </div>
              <Text strong style={{ fontSize: "13px", color: "#595959" }}>
                Tim Ahli
              </Text>
            </div>
            <div style={{ textAlign: "center", minWidth: "140px" }}>
              <div style={{
                color: "#ff4500",
                fontSize: "18px",
                marginBottom: "4px"
              }}>
                🎯
              </div>
              <Text strong style={{ fontSize: "13px", color: "#595959" }}>
                Solusi Akurat
              </Text>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<MessageOutlined />}
              onClick={handlePertanyan}
              style={{
                background: "linear-gradient(135deg, #ff7a45, #ff4500)",
                borderColor: "#ff4500",
                borderRadius: "8px",
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontSize: "15px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(255, 69, 0, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 69, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 69, 0, 0.3)";
              }}
            >
              {buttonText}
            </Button>

            <div style={{ marginTop: "12px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                💡 Gratis dan tidak perlu registrasi tambahan
              </Text>
            </div>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default CTAQuestion;