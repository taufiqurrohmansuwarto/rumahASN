import {
  ApiOutlined,
  CommentOutlined,
  DatabaseOutlined,
  LoginOutlined,
  SoundOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Card, Col, Flex, Row, Space, Typography } from "antd";
import Kuesioner from "./Public/Kuesioner";

const { Title, Text } = Typography;

export const MOCKDATA = [
  {
    icon: CommentOutlined,
    title: "Forum Kepegawaian",
    description:
      "Fitur Forum Kepegawaian Rumah ASN memungkinkan pengguna berdiskusi langsung dengan pejabat BKD tentang kepegawaian.",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  {
    icon: StarOutlined,
    title: "Penilaian Layanan",
    description:
      "Fitur Penilaian Layanan memungkinkan pengguna memberikan feedback untuk meningkatkan layanan BKD Provinsi Jawa Timur.",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    icon: SoundOutlined,
    title: "Podcast",
    description:
      "Fitur Podcast Rumah ASN menyajikan topik menarik seputar kepegawaian dari pejabat dan staf BKD secara informatif dan menyenangkan.",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  {
    icon: DatabaseOutlined,
    title: "Integrasi Sistem SIASN",
    description:
      "Fitur Integrasi Sistem memudahkan pengguna melacak layanan kepegawaian seperti pensiun, perbaikan nama/NIP, dan kenaikan pangkat.",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    icon: LoginOutlined,
    title: "Single Sign-On",
    description:
      "Fitur Single Sign-On mempermudah akses Rumah ASN dengan akun Gmail untuk masyarakat umum atau SSO Kepegawaian bagi pegawai Pemprov Jawa Timur.",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  {
    icon: SafetyCertificateOutlined,
    title: "Webinar Series",
    description:
      "Fitur Webinar Rumah ASN menyajikan edukasi terstruktur dengan sertifikat TTE yang valid, memberikan kemudahan dan kepercayaan bagi peserta.",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  {
    icon: VideoCameraOutlined,
    title: "Coaching & Mentoring",
    description:
      "Pelatihan virtual kepegawaian daerah di platform digital menghadirkan diskusi mendalam dengan ahli BKD untuk memudahkan informasi dan meningkatkan pelayanan.",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    icon: ApiOutlined,
    title: "ASN Updates",
    description:
      "Fitur ini seperti Facebook atau Twitter, tapi khusus untuk ASN. Update status informatif, bagikan pengalaman, atau info yang bisa memotivasi rekan ASN. Tetap profesional, ya!",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  {
    icon: TeamOutlined,
    title: "ASN Discussions",
    description:
      "Siap diskusi seru dan fokus? Fitur ini menghadirkan tema menarik dari BKD, seperti strategi kerja hingga perkembangan di sektor pemerintahan, untuk diskusi konstruktif dan ide-ide cemerlang.",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
];

const Feature = ({
  icon: Icon,
  title,
  description,
  color,
  bgColor,
  borderColor,
}) => {
  return (
    <Card
      style={{
        borderRadius: "16px",
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        transition: "all 0.3s ease",
        cursor: "default",
        height: "100%",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      bodyStyle={{
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
      }}
    >
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <Icon style={{ color: "white", fontSize: "20px" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <Title
            level={5}
            style={{
              margin: "0 0 12px 0",
              color: "#1F2937",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            {title}
          </Title>
          <Text
            style={{
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: "20px",
              display: "block",
            }}
          >
            {description}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

const Features = ({ title, description, data = MOCKDATA }) => {
  const features = data.map((feature, index) => (
    <Col xs={24} sm={12} lg={8} key={index}>
      <Feature {...feature} />
    </Col>
  ));

  return (
    <div
      style={{
        backgroundColor: "#FAFAFB",
        padding: "64px 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "64px", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ marginBottom: "24px" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#6366F1",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                padding: "8px 24px",
                borderRadius: "50px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              Fitur Unggulan
            </span>
          </div>

          {/* Title with Gradient */}
          <div style={{ marginBottom: "24px" }}>
            <Title
              level={1}
              style={{
                margin: 0,
                background: "linear-gradient(135deg, #1F2937 0%, #6366F1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 900,
                fontSize: "clamp(32px, 6vw, 48px)",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              {title || "Inovasi Digital untuk Kepegawaian Modern"}
            </Title>
          </div>

          {/* Subtitle */}
          <div style={{ marginBottom: "32px" }}>
            <Text
              style={{
                color: "#4B5563",
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "30px",
                maxWidth: "700px",
                margin: "0 auto",
                display: "block",
              }}
            >
              {description ||
                "Solusi terintegrasi untuk transformasi digital kepegawaian yang efisien dan modern"}
            </Text>
          </div>

          {/* Decorative Elements */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            {/* Main accent line */}
            <div
              style={{
                width: "80px",
                height: "4px",
                background: "linear-gradient(90deg, #6366F1, #22C55E)",
                borderRadius: "2px",
                margin: "0 auto",
                position: "relative",
              }}
            />

            {/* Side dots */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: "120px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#6366F1",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>

          {/* Stats or additional info */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              flexWrap: "wrap",
              marginTop: "40px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Text
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#6366F1",
                  display: "block",
                  lineHeight: "1",
                }}
              >
                9+
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginTop: "4px",
                }}
              >
                Fitur Utama
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <Text
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#22C55E",
                  display: "block",
                  lineHeight: "1",
                }}
              >
                24/7
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginTop: "4px",
                }}
              >
                Akses Digital
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <Text
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#F59E0B",
                  display: "block",
                  lineHeight: "1",
                }}
              >
                100%
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginTop: "4px",
                }}
              >
                Terintegrasi
              </Text>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <Row gutter={[24, 24]}>{features}</Row>
      </div>
    </div>
  );
};

export default Features;
