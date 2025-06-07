import { Card, Flex, Radio, Space, Typography } from "antd";

const { Text } = Typography;

const UrgencyPicker = ({
  urgencyLevels,
  selectedUrgency,
  onUrgencyChange,
  error,
  compact = false,
}) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "very_urgent":
        return "#ff4d4f";
      case "urgent":
        return "#fa8c16";
      default:
        return "#52c41a";
    }
  };

  if (compact) {
    return (
      <Select
        placeholder="Pilih urgency"
        value={selectedUrgency}
        onChange={onUrgencyChange}
        style={{ width: "100%" }}
        size="large"
        status={error ? "error" : ""}
      >
        {urgencyLevels?.map((level) => (
          <Select.Option key={level.id} value={level.id}>
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getUrgencyColor(level.id),
                }}
              />
              {level.name}
            </Flex>
          </Select.Option>
        ))}
      </Select>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1A1A1B",
          display: "block",
          marginBottom: "12px",
        }}
      >
        Tingkat Urgency {error && <Text type="danger">*</Text>}
      </Text>

      <Radio.Group
        style={{ width: "100%" }}
        value={selectedUrgency}
        onChange={(e) => onUrgencyChange(e.target.value)}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {urgencyLevels?.map((level) => (
            <Card
              key={level.id}
              size="small"
              hoverable
              style={{
                border: "1px solid #EDEFF1",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: "12px 16px" }}
              className="urgency-card"
            >
              <Radio
                value={level.id}
                style={{
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <Flex vertical>
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: getUrgencyColor(level.id),
                      }}
                    >
                      {level.name}
                    </Text>
                    <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                      {level.description}
                    </Text>
                  </Flex>
                </Flex>
              </Radio>
            </Card>
          ))}
        </Space>
      </Radio.Group>

      {error && (
        <Text type="danger" style={{ fontSize: "12px", marginTop: "4px" }}>
          {error}
        </Text>
      )}
    </div>
  );
};

export default UrgencyPicker;
