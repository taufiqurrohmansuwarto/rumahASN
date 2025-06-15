import { unsubscribeTicket } from "@/services/index";
import { BellOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Typography, Grid } from "antd";
import { useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

function Unsubscribe({ id }) {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      buttonSize: isMobile ? "small" : "middle",
    };
  }, [screens.md]);

  const { mutate, isLoading } = useMutation((data) => unsubscribeTicket(data), {
    onSuccess: () => {
      message.success("🔕 Berhasil berhenti berlangganan");
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
    onError: () => message.error("❌ Gagal berhenti berlangganan"),
  });

  const handleClick = () => {
    if (isLoading) return;
    mutate(id);
  };

  return (
    <div style={{ width: "100%" }}>
      <Button
        icon={<BellOutlined />}
        loading={isLoading}
        onClick={handleClick}
        size={responsiveConfig.buttonSize}
        style={{
          width: "100%",
          background: "#fff2f0",
          borderColor: "#ffccc7",
          color: "#cf1322",
          fontWeight: 600,
          borderRadius: 6,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#cf1322";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#cf1322";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff2f0";
          e.currentTarget.style.color = "#cf1322";
          e.currentTarget.style.borderColor = "#ffccc7";
        }}
      >
        {isLoading ? "⏳ Membatalkan..." : "🔕 Berhenti Berlangganan"}
      </Button>
      <Text
        type="secondary"
        style={{
          fontSize: responsiveConfig.isMobile ? 10 : 11,
          marginTop: 6,
          display: "block",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        🚫 Tidak akan menerima notifikasi lagi
      </Text>
    </div>
  );
}

export default Unsubscribe;
