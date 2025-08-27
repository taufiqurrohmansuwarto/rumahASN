import { Typography } from "antd";

const { Title, Text } = Typography;

function ASNConnectHeader() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
        padding: "48px 0",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(255, 69, 0, 0.3)",
        marginBottom: "24px",
        borderRadius: "12px",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3Ccircle cx='22' cy='22' r='1'/%3E%3Ccircle cx='52' cy='52' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.6,
        }}
      />

      {/* Content Container */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Title
              level={1}
              style={{
                margin: 0,
                color: "white",
                fontSize: "36px",
                fontWeight: 800,
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              ASN Connect
            </Title>
          </div>

          <Text
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.95)",
              display: "block",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            Platform Kolaborasi ASN Jawa Timur
          </Text>

          <Text
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.8)",
              display: "block",
            }}
          >
            🤝 Saling Bantu • 💡 Berbagi Ide • 🚀 Berinovasi Bersama
          </Text>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "120px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "80px",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "200px",
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "300px",
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.09)",
          backdropFilter: "blur(10px)",
        }}
      />
    </div>
  );
}

export default ASNConnectHeader;
