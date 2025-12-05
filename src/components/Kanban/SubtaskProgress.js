import { Progress, Group, Text } from "@mantine/core";
import { IconSubtask } from "@tabler/icons-react";

function SubtaskProgress({ total, completed, showText = true }) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);
  const color = percentage === 100 ? "green" : percentage > 50 ? "blue" : "gray";

  return (
    <Group gap={6} wrap="nowrap">
      <IconSubtask size={12} color="#868e96" />
      <Progress
        value={percentage}
        size="xs"
        color={color}
        style={{ flex: 1, minWidth: 40 }}
      />
      {showText && (
        <Text size="xs" c="dimmed">
          {completed}/{total}
        </Text>
      )}
    </Group>
  );
}

export default SubtaskProgress;

