import { QuestionCircleOutlined } from "@ant-design/icons";
import { Flex, Form, Input, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormTitle = ({ isMobile }) => {
  return (
    <Form.Item
      name="title"
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Judul
          </Text>
          <Tooltip
            title="Buat judul yang jelas, spesifik, dan mudah dipahami. Gunakan kata kunci yang relevan untuk memudahkan pencarian. Contoh: 'Panduan Lengkap Pengajuan Cuti Tahunan'"
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
        { required: true, message: "Judul harus diisi!" },
        { max: 255, message: "Judul maksimal 255 karakter!" },
      ]}
    >
      <Input
        placeholder="Masukkan judul konten yang jelas dan informatif"
        style={{
          borderRadius: "6px",
          fontSize: isMobile ? "13px" : "14px",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#FF4500";
          e.target.style.boxShadow =
            "0 0 0 2px rgba(255, 69, 0, 0.2)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#d9d9d9";
          e.target.style.boxShadow = "none";
        }}
      />
    </Form.Item>
  );
};

export default KnowledgeFormTitle;