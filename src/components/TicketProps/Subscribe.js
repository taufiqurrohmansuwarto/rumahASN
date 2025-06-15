import { subscribeTicket } from "@/services/index";
import { BellOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Typography, message, Grid } from "antd";
import { useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text } = Typography;

function Subscribe({ id }) {
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

  const { mutate, isLoading } = useMutation((data) => subscribeTicket(data), {
    onSuccess: () => {
      message.success("🔔 Berhasil berlangganan notifikasi");
      queryClient.invalidateQueries(["publish-ticket", id]);
    },
    onError: () => message.error("❌ Gagal berlangganan tiket"),
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
          background: "#f6ffed",
          borderColor: "#b7eb8f",
          color: "#389e0d",
          fontWeight: 600,
          borderRadius: 6,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#389e0d";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#389e0d";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f6ffed";
          e.currentTarget.style.color = "#389e0d";
          e.currentTarget.style.borderColor = "#b7eb8f";
        }}
      >
        {isLoading ? "⏳ Berlangganan..." : "🔔 Berlangganan"}
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
        💬 Dapatkan notifikasi untuk komentar baru
      </Text>
    </div>
  );
}

export default Subscribe;
