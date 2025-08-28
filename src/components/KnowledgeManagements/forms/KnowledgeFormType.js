import { QuestionCircleOutlined } from "@ant-design/icons";
import { Flex, Form, Radio, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormType = ({ isMobile }) => {
  const typeOptions = [
    {
      label: "📝 Teks",
      value: "teks",
      description: "Konten berupa artikel, panduan, atau tulisan"
    },
    {
      label: "🖼️ Gambar", 
      value: "gambar",
      description: "Konten berupa infografik, diagram, atau gambar"
    },
    {
      label: "🎥 Video",
      value: "video", 
      description: "Konten berupa video tutorial, presentasi, atau webinar"
    },
    {
      label: "🎵 Audio",
      value: "audio",
      description: "Konten berupa podcast, rekaman, atau audio pembelajaran"
    }
  ];

  return (
    <Form.Item
      name="type"
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Jenis Konten
          </Text>
          <Tooltip
            title="Pilih jenis konten sesuai dengan format utama yang akan dibagikan. Ini akan membantu pengguna menemukan konten yang sesuai dengan kebutuhan mereka."
            placement="top"
          >
            <QuestionCircleOutlined
              style={{
                color: "#FF4500",
                fontSize: "12px",
                cursor: "help",
              }}
            />
          </Tooltip>
        </Flex>
      }
      rules={[
        { required: true, message: "Jenis konten harus dipilih!" }
      ]}
      initialValue="teks"
    >
      <Radio.Group
        style={{ width: "100%" }}
        optionType="button"
        buttonStyle="solid"
        size={isMobile ? "small" : "middle"}
      >
        <Flex 
          direction={isMobile ? "vertical" : "horizontal"} 
          gap={isMobile ? "8px" : "12px"}
          wrap={!isMobile}
        >
          {typeOptions.map((option) => (
            <Tooltip
              key={option.value}
              title={option.description}
              placement="top"
            >
              <Radio.Button
                value={option.value}
                style={{
                  borderRadius: "6px",
                  border: "1px solid #d9d9d9",
                  transition: "all 0.2s ease",
                  flex: isMobile ? 1 : "none",
                  minWidth: isMobile ? "auto" : "120px",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#FF4500";
                  e.target.style.boxShadow = "0 0 0 2px rgba(255, 69, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  if (!e.target.classList.contains('ant-radio-button-checked')) {
                    e.target.style.borderColor = "#d9d9d9";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {option.label}
              </Radio.Button>
            </Tooltip>
          ))}
        </Flex>
      </Radio.Group>
    </Form.Item>
  );
};

export default KnowledgeFormType;