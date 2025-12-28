import { Stack, Text, Group } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { Card, Tag, message } from "antd";

/**
 * TargetStyleFeedback - Shows feedback based on target user preferences
 */
const TargetStyleFeedback = ({ target, feedback }) => {
  if (!feedback) return null;

  const targetName = feedback?.target_name || target?.user_name || "Target";
  const complianceScore = feedback?.compliance_score;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Disalin!");
  };

  return (
    <Card
      size="small"
      style={{
        marginTop: 12,
        background: "#fafafa",
        border: "1px solid #e8e8e8",
      }}
      styles={{
        header: { minHeight: 40, padding: "8px 12px" },
        body: { padding: 12 },
      }}
      title={
        <Group justify="space-between" align="center">
          <Text size="xs" fw={600}>
            Preferensi: {targetName}
          </Text>
          {complianceScore !== undefined && (
            <Tag
              color={
                complianceScore >= 80
                  ? "success"
                  : complianceScore >= 60
                  ? "warning"
                  : "error"
              }
            >
              {complianceScore}%
            </Tag>
          )}
        </Group>
      }
    >
      <Stack gap={8}>
        {/* Custom Rules Check */}
        {feedback.custom_rules_check?.length > 0 && (
          <Stack gap={4}>
            {feedback.custom_rules_check.map((rule, idx) => (
              <Group key={idx} gap={6} align="center">
                <span>
                  {rule.status === "terpenuhi"
                    ? "✅"
                    : rule.status === "sebagian"
                    ? "⚠️"
                    : "❌"}
                </span>
                <Text size="xs">{rule.rule}</Text>
                {rule.missing_element && (
                  <Text size="xs" c="red">
                    ({rule.missing_element})
                  </Text>
                )}
              </Group>
            ))}
          </Stack>
        )}

        {/* Forbidden Words & Terms to Replace */}
        {(feedback.forbidden_words_found?.length > 0 ||
          feedback.terms_to_replace?.length > 0) && (
          <div
            style={{
              padding: 8,
              background: "#fff",
              borderRadius: 4,
            }}
          >
            <Text size="xs" fw={600} c="dimmed" mb={4}>
              GANTI:
            </Text>
            <Stack gap={2}>
              {feedback.forbidden_words_found?.map((item, idx) => (
                <Group key={`fw-${idx}`} gap={4} align="center">
                  <Text size="xs" td="line-through" c="red">
                    {item.word}
                  </Text>
                  <span>→</span>
                  <Text
                    size="xs"
                    c="green"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCopy(item.replacement)}
                  >
                    {item.replacement}
                  </Text>
                  <IconCopy
                    size={10}
                    style={{ color: "#999", cursor: "pointer" }}
                    onClick={() => handleCopy(item.replacement)}
                  />
                </Group>
              ))}
              {feedback.terms_to_replace?.map((item, idx) => (
                <Group key={`tr-${idx}`} gap={4} align="center">
                  <Text size="xs" td="line-through" c="orange">
                    {item.original}
                  </Text>
                  <span>→</span>
                  <Text
                    size="xs"
                    c="blue"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCopy(item.preferred)}
                  >
                    {item.preferred}
                  </Text>
                  <IconCopy
                    size={10}
                    style={{ color: "#999", cursor: "pointer" }}
                    onClick={() => handleCopy(item.preferred)}
                  />
                </Group>
              ))}
            </Stack>
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions?.length > 0 && (
          <Stack gap={6}>
            {feedback.suggestions.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: 8,
                  background: "#fff",
                  borderRadius: 4,
                  border: "1px solid #f0f0f0",
                }}
              >
                {item.original_sentence && item.suggested_sentence ? (
                  <Stack gap={4}>
                    <Text size="xs" td="line-through" c="dimmed">
                      {item.original_sentence}
                    </Text>
                    <Group
                      gap={4}
                      align="center"
                      style={{
                        padding: "4px 8px",
                        background: "#f6ffed",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                      onClick={() => handleCopy(item.suggested_sentence)}
                    >
                      <Text size="xs" c="green" style={{ flex: 1 }}>
                        {item.suggested_sentence}
                      </Text>
                      <IconCopy size={12} style={{ color: "#52c41a" }} />
                    </Group>
                  </Stack>
                ) : item.issue ? (
                  <Text size="xs">{item.issue}</Text>
                ) : null}
              </div>
            ))}
          </Stack>
        )}

        {/* Overall Note */}
        {feedback.overall_note && (
          <Text size="xs" c="dimmed" mt={4}>
            {feedback.overall_note}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default TargetStyleFeedback;
