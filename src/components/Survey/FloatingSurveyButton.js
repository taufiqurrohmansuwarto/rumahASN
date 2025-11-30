import { CloseOutlined } from "@ant-design/icons";
import { Card, Button, Typography, Space } from "antd";
import { useState } from "react";

const { Text } = Typography;

const FloatingSurveyButton = () => {
  const [visible, setVisible] = useState(true);
  const SURVEY_URL = "https://forms.gle/KvUiMwBZeRCVprDx6";

  const handleClick = () => {
    window.open(SURVEY_URL, "_blank");
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        width: 260,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text strong style={{ fontSize: 13 }}>
            Punya waktu 2 menit?
          </Text>
          <CloseOutlined
            style={{ fontSize: 12, cursor: "pointer", color: "#999" }}
            onClick={handleDismiss}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Ceritakan pengalaman Anda mengurus layanan kepegawaian
        </Text>
        <Button type="primary" size="small" block onClick={handleClick}>
          Isi Survei
        </Button>
      </Space>
    </Card>
  );
};

export default FloatingSurveyButton;
