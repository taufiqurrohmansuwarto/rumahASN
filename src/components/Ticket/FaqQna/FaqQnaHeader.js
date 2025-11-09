import { QuestionCircleOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { Typography } from "antd";

const { Title } = Typography;

function FaqQnaHeader() {
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
      <QuestionCircleOutlined
        style={{ fontSize: "24px", marginBottom: "8px" }}
      />
      <Title level={3} style={{ color: "white", margin: 0 }}>
        FAQ QnA
      </Title>
      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "12px" }}>
        Kelola pertanyaan dan jawaban FAQ
      </Text>
    </div>
  );
}

export default FaqQnaHeader;

