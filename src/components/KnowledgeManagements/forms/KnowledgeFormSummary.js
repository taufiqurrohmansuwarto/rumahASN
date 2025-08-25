import { QuestionCircleOutlined } from "@ant-design/icons";
import { Flex, Form, Input, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormSummary = ({ isMobile }) => {
  return (
    <Form.Item
      name="summary"
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            📝 Ringkasan
          </Text>
          <Tooltip
            title="Tuliskan ringkasan singkat konten Anda dalam 1-2 kalimat. Ringkasan ini akan ditampilkan di halaman daftar artikel sebagai preview untuk membantu pembaca memahami inti konten sebelum membacanya secara lengkap."
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
        { required: true, message: "Ringkasan harus diisi!" },
        { max: 300, message: "Ringkasan maksimal 300 karakter!" },
        { min: 20, message: "Ringkasan minimal 20 karakter!" },
      ]}
      style={{ marginBottom: isMobile ? "16px" : "20px" }}
    >
      <Input.TextArea
        rows={3}
        placeholder="Tuliskan ringkasan singkat konten Anda yang menjelaskan poin-poin utama dalam 1-2 kalimat..."
        style={{
          borderRadius: "6px",
          fontSize: isMobile ? "13px" : "14px",
          resize: "none",
        }}
        showCount
        maxLength={300}
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

export default KnowledgeFormSummary;