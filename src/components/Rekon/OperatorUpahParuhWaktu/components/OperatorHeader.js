import { TeamOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { Text } from "@mantine/core";

const { Title } = Typography;

export const OperatorHeader = () => {
  return (
    <div
      style={{
        background: "#FF4500",
        color: "white",
        padding: "24px",
        textAlign: "center",
        borderRadius: "12px 12px 0 0",
        margin: "-24px -24px 0 -24px",
      }}
    >
      <TeamOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
      <Title level={3} style={{ color: "white", margin: 0 }}>
        Operator Upah Paruh Waktu
      </Title>
      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
        Kelola operator yang dapat mengelola upah pegawai paruh waktu
      </Text>
    </div>
  );
};

