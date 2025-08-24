import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

const { Text, Title } = Typography;

const ContentHeader = ({ isMobile, onInfoClick }) => {
  return (
    <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
      <Flex justify="space-between" align="center">
        <div>
          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              color: "#1A1A1B",
              lineHeight: isMobile ? "1.3" : "1.4",
            }}
          >
            📋 Detail Konten Knowledge
          </Title>
          <Text
            style={{
              color: "#787C7E",
              fontSize: isMobile ? "12px" : "14px",
              lineHeight: isMobile ? "1.3" : "1.4",
            }}
          >
            Kelola konten dan status publikasi knowledge
          </Text>
        </div>
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={onInfoClick}
          title="Informasi Tim & Versi"
        >
          {!isMobile && "Informasi"}
        </Button>
      </Flex>
    </div>
  );
};

export default ContentHeader;
