import { Text, Group, Box } from "@mantine/core";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconBulb,
  IconCheck,
  IconCopy,
  IconArrowRight,
} from "@tabler/icons-react";
import { Tag, Tooltip, message } from "antd";

// Severity config
const SEVERITY_CONFIG = {
  critical: {
    color: "red",
    icon: IconAlertTriangle,
    label: "FORMAT",
    bgColor: "#fef2f2",
    borderColor: "#ef4444",
    textColor: "#dc2626",
  },
  major: {
    color: "orange",
    icon: IconAlertCircle,
    label: "PENULISAN",
    bgColor: "#fffbeb",
    borderColor: "#f59e0b",
    textColor: "#d97706",
  },
  minor: {
    color: "gold",
    icon: IconAlertCircle,
    label: "MINOR",
    bgColor: "#fefce8",
    borderColor: "#eab308",
    textColor: "#ca8a04",
  },
  suggestion: {
    color: "blue",
    icon: IconBulb,
    label: "SARAN",
    bgColor: "#eff6ff",
    borderColor: "#3b82f6",
    textColor: "#2563eb",
  },
};

const IssueCard = ({ issue }) => {
  const config = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.minor;

  const handleCopy = () => {
    const textToCopy = issue.suggested_text || issue.suggestion || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      message.success("Disalin!");
    }
  };

  const hasOriginal = issue.original_text || issue.issue_text;
  const hasSuggestion = issue.suggested_text || issue.suggestion;
  const originalText = issue.original_text || issue.issue_text || "";
  const suggestedText = issue.suggested_text || issue.suggestion || "";

  return (
    <Box
      style={{
        padding: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      {/* Header: Tag + Rule Reference */}
      <Group gap={8} align="center" mb={8}>
        <Tag
          color={config.color}
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 4,
          }}
        >
          {config.label}
        </Tag>
        {issue.rule_reference && (
          <Text size="xs" c="dimmed" style={{ fontSize: 11 }}>
            {issue.rule_reference}
          </Text>
        )}
        {issue.is_resolved && (
          <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
            <IconCheck size={10} /> Selesai
          </Tag>
        )}
      </Group>

      {/* Description */}
      {issue.description && (
        <Text size="xs" c="dark" mb={8} style={{ lineHeight: 1.5 }}>
          {issue.description}
        </Text>
      )}

      {/* Diff View: Original → Suggested */}
      {(hasOriginal || hasSuggestion) && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 6,
            padding: 10,
          }}
        >
          <Group gap={8} align="flex-start" wrap="nowrap">
            {/* Original */}
            {hasOriginal && (
              <Text
                size="xs"
                c="red"
                style={{
                  flex: 1,
                  textDecoration: "line-through",
                  opacity: 0.8,
                  wordBreak: "break-word",
                }}
              >
                {originalText}
              </Text>
            )}

            {/* Arrow */}
            {hasOriginal && hasSuggestion && (
              <IconArrowRight
                size={14}
                color="#9ca3af"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
            )}

            {/* Suggested */}
            {hasSuggestion && (
              <Group gap={4} align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                <Text
                  size="xs"
                  c="green"
                  fw={500}
                  style={{ flex: 1, wordBreak: "break-word" }}
                >
                  {suggestedText}
                </Text>
                <Tooltip title="Salin">
                  <IconCopy
                    size={14}
                    color="#6b7280"
                    style={{ cursor: "pointer", flexShrink: 0, marginTop: 2 }}
                    onClick={handleCopy}
                  />
                </Tooltip>
              </Group>
            )}
          </Group>
        </div>
      )}
    </Box>
  );
};

export { SEVERITY_CONFIG };
export default IssueCard;
