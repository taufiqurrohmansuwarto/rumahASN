import { Typography } from "antd";

const { Title, Text } = Typography;

const KnowledgeFormHeader = ({ 
  isMobile, 
  initialData, 
  customTitle, 
  customSubtitle 
}) => {
  return (
    <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
      <Title
        level={isMobile ? 5 : 4}
        style={{
          margin: 0,
          color: "#1A1A1B",
          lineHeight: isMobile ? "1.3" : "1.4",
        }}
      >
        📚{" "}
        {customTitle || (initialData
          ? "Edit ASNPedia"
          : "Buat ASNPedia Baru")}
      </Title>
      <Text
        style={{
          color: "#787C7E",
          fontSize: isMobile ? "12px" : "14px",
          lineHeight: isMobile ? "1.3" : "1.4",
        }}
      >
        {customSubtitle || (initialData
          ? "Perbarui konten ASNPedia yang sudah ada"
          : "Kelola dan bagikan pengetahuan melalui ASNPedia untuk pengembangan organisasi")}
      </Text>
    </div>
  );
};

export default KnowledgeFormHeader;