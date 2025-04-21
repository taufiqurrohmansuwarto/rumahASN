import React from "react";
import { Card, Typography, Button, Space, Row, Col, Image } from "antd";
import { FormOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Kuesioner = () => {
  return (
    <Row justify="center" align="middle" style={{ padding: "40px 0" }}>
      <Col xs={24} sm={20} md={18} lg={16}>
        <Card
          hoverable
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
            background: "linear-gradient(to bottom right, #ffffff, #f0f7ff)",
            border: "1px solid #e6f7ff",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Title
                level={2}
                style={{
                  marginBottom: 12,
                  color: "#1890ff",
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #1890ff, #36cfc9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Survei Penggunaan AI Pegawai Pemprov Jatim
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Kami sangat menghargai pendapat Anda untuk meningkatkan layanan
                kami
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <Image
                src="https://siasn.bkd.jatimprov.go.id:9000/public/kuesioner-ai.jpeg"
                alt="Kuesioner AI"
                style={{
                  maxWidth: "100%",
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease",
                }}
                preview={false}
                className="survey-image"
              />
            </div>

            <div style={{ textAlign: "center", padding: "0 16px" }}>
              <Text style={{ fontSize: 16, lineHeight: 1.6, color: "#555" }}>
                Luangkan waktu sejenak untuk berbagi pengalaman dan saran Anda
                melalui survei singkat ini. Tanggapan Anda sangat berharga bagi
                kami untuk terus meningkatkan kualitas layanan.
              </Text>
            </div>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Button
                type="primary"
                size="large"
                icon={<FormOutlined />}
                href="https://bit.ly/SurveiPenggunaanAIPegawaiPemprovJatim"
                target="_blank"
                style={{
                  borderRadius: 8,
                  padding: "0 36px",
                  height: 52,
                  fontSize: 16,
                  fontWeight: 600,
                  background: "linear-gradient(90deg, #1890ff, #36cfc9)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                  transition: "all 0.3s ease",
                }}
                className="survey-button"
              >
                Isi Survei Sekarang
              </Button>
            </div>
          </Space>
        </Card>
      </Col>
      <style jsx global>{`
        .survey-image:hover {
          transform: scale(1.02);
        }
        .survey-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
        }
      `}</style>
    </Row>
  );
};

export default Kuesioner;
