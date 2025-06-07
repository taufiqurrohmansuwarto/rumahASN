import { Input, Typography, Flex } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

const ContentEditor = ({
  value,
  onChange,
  placeholder,
  maxLength = 1000,
  minLength = 20,
  error,
}) => {
  const characterCount = value ? value.length : 0;
  const isOverLimit = characterCount > maxLength;
  const isUnderMin = characterCount < minLength && characterCount > 0;

  return (
    <div style={{ marginBottom: "20px" }}>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1A1A1B",
          display: "block",
          marginBottom: "8px",
        }}
      >
        Deskripsi Detail {error && <Text type="danger">*</Text>}
      </Text>

      <TextArea
        rows={4}
        placeholder={placeholder || "Jelaskan masalah Anda secara detail..."}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          borderColor: error ? "#ff4d4f" : undefined,
        }}
      />

      <Flex justify="space-between" align="center" style={{ marginTop: "8px" }}>
        <div>
          {error && (
            <Text type="danger" style={{ fontSize: "12px" }}>
              {error}
            </Text>
          )}
          {isUnderMin && !error && (
            <Text type="warning" style={{ fontSize: "12px" }}>
              Minimal {minLength} karakter
            </Text>
          )}
        </div>

        <Text
          style={{
            fontSize: "12px",
            color: isOverLimit ? "#ff4d4f" : "#787C7E",
          }}
        >
          {characterCount}/{maxLength}
        </Text>
      </Flex>
    </div>
  );
};

export default ContentEditor;
