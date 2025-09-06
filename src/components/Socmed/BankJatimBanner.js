import { Typography, Image } from "antd";
import { BankOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const { Text } = Typography;

const BankJatimBanner = () => {
  const router = useRouter();
  const { data: session } = useSession();
  
  const isAsn = session?.user?.group === "MASTER" && session?.user?.role === "USER";
  const linkGambar = "https://siasn.bkd.jatimprov.go.id:9000/public/logo-bank-jatim.png";

  if (!isAsn) return null;

  return (
    <div
      onClick={() => router.push("/layanan-keuangan/bank-jatim/produk/kkb")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)",
        borderRadius: "20px",
        border: "1px solid rgba(220, 38, 38, 0.8)",
        backdropFilter: "blur(10px)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginTop: "6px",
        boxShadow: "0 2px 12px rgba(220, 38, 38, 0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
        e.currentTarget.style.borderColor = "#dc2626";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(220, 38, 38, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)";
        e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.8)";
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(220, 38, 38, 0.2)";
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          backgroundColor: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.2)",
        }}
      >
        <Image
          src={linkGambar}
          alt="Bank Jatim"
          preview={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          fallback={<BankOutlined style={{ fontSize: "16px", color: "#dc2626" }} />}
        />
      </div>
      <Text
        style={{
          color: "white",
          fontSize: "14px",
          fontWeight: 600,
          margin: 0,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      >
        Bank Jatim • Simulasi & Kredit
      </Text>
      <ArrowRightOutlined
        style={{
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      />
    </div>
  );
};

export default BankJatimBanner;