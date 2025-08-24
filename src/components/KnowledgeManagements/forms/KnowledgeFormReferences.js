import { 
  DeleteOutlined, 
  LinkOutlined, 
  PlusOutlined, 
  QuestionCircleOutlined 
} from "@ant-design/icons";
import { Button, Flex, Form, Input, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormReferences = ({ isMobile }) => {
  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            🔗 Referensi
          </Text>
          <Tooltip
            title="Tambahkan referensi atau sumber terkait yang mendukung konten Anda. Bisa berupa link website, dokumen, atau sumber lainnya."
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
      style={{ marginBottom: isMobile ? "16px" : "20px" }}
    >
      <Form.List name="references">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "12px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    rules={[
                      {
                        required: true,
                        message: "Judul referensi harus diisi!",
                      },
                    ]}
                    style={{ marginBottom: "8px" }}
                  >
                    <Input
                      placeholder="Judul referensi"
                      style={{
                        fontSize: isMobile ? "12px" : "13px",
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "url"]}
                    rules={[
                      {
                        required: true,
                        message: "URL referensi harus diisi!",
                      },
                      {
                        type: "url",
                        message: "Format URL tidak valid!",
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder="https://example.com"
                      prefix={<LinkOutlined />}
                      style={{
                        fontSize: isMobile ? "12px" : "13px",
                      }}
                    />
                  </Form.Item>
                </div>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => remove(name)}
                  style={{
                    color: "#ff4d4f",
                    marginTop: "4px",
                  }}
                  size="small"
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{
                width: "100%",
                borderColor: "#FF4500",
                color: "#FF4500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fff2e8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Tambah Referensi
            </Button>
          </>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default KnowledgeFormReferences;