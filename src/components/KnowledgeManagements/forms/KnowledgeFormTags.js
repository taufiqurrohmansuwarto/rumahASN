import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Tag, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormTags = ({ 
  isMobile, 
  tags, 
  setTags, 
  inputValue, 
  setInputValue 
}) => {
  const handleAddTag = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Tags
          </Text>
          <Tooltip
            title="Tambahkan kata kunci yang relevan untuk memudahkan pencarian. Gunakan 3-5 tags yang spesifik. Contoh: 'prosedur', 'panduan', 'cuti', 'HR'. Tekan Enter atau klik + untuk menambah tag."
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
    >
      <div>
        {tags.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            {tags.map((tag, index) => (
              <Tag
                key={index}
                closable
                color="#FF4500"
                style={{
                  margin: "2px",
                  borderRadius: "4px",
                  fontSize: isMobile ? "11px" : "12px",
                }}
                onClose={() => handleRemoveTag(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}
        <Input
          placeholder="Tambah tag..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleAddTag}
          style={{
            borderRadius: "6px",
            fontSize: isMobile ? "12px" : "13px",
          }}
          suffix={
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={handleAddTag}
              size="small"
              style={{ color: "#FF4500" }}
            />
          }
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
      </div>
    </Form.Item>
  );
};

export default KnowledgeFormTags;