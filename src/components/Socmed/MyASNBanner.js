import { Typography, Image, Grid } from "antd";
import { UserOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const MyASNBanner = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const screens = useBreakpoint();
  
  const isAsn = session?.user?.group === "MASTER" && session?.user?.role === "USER";
  const linkGambar = "https://asndigital.bkn.go.id/images/logo-bkn.png";
  
  const getText = () => {
    if (screens.xs && !screens.sm) {
      return "ASN Digital";
    }
    return "MyASN • Integrasi & Layanan";
  };

  if (!isAsn) return null;

  return (
    <div
      onClick={() => router.push("/pemutakhiran-data/komparasi")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 12px",
        background: "#FF6600",
        borderRadius: "20px",
        border: "1px solid #E65A00",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginTop: "6px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FF5500";
        e.currentTarget.style.borderColor = "#E64A00";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#FF6600";
        e.currentTarget.style.borderColor = "#E65A00";
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)";
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          backgroundColor: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        }}
      >
        <Image
          src={linkGambar}
          alt="MyASN"
          preview={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          fallback={<UserOutlined style={{ fontSize: "16px", color: "#FF6600" }} />}
        />
      </div>
      <Text
        style={{
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          margin: 0,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      >
{getText()}
      </Text>
      <ArrowRightOutlined
        style={{
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      />
    </div>
  );
};

export default MyASNBanner;