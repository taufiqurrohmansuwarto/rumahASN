import { Group, Text } from "@mantine/core";

/**
 * DetailItem - Reusable component for displaying label-value pairs
 * Following CekPertek.js pattern
 */
const DetailItem = ({ icon: Icon, label, value, valueColor }) => (
  <Group gap={8} align="flex-start" mb={8} wrap="nowrap">
    {Icon && (
      <div style={{ marginTop: 2 }}>
        <Icon size={16} color="#6b7280" />
      </div>
    )}
    <div style={{ flex: 1 }}>
      <Text size="xs" c="dimmed" mb={2}>
        {label}
      </Text>
      <Text size="sm" fw={500} style={{ color: valueColor || "#1f2937" }}>
        {value || "-"}
      </Text>
    </div>
  </Group>
);

export default DetailItem;
