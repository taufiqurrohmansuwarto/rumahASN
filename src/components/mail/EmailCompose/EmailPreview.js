import { Box, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPaperclip } from "@tabler/icons-react";
import { Tag } from "antd";

const EmailPreview = ({ subject, recipients, content, attachments = [] }) => {
  return (
    <Paper p="sm" withBorder radius="sm" bg="gray.0">
      <Stack gap="xs">
        <Group gap="xs">
          <Text size="xs" fw={500} w={50}>Subjek:</Text>
          <Text size="xs">{subject || "-"}</Text>
        </Group>

        <Group gap="xs" align="flex-start">
          <Text size="xs" fw={500} w={50}>Kepada:</Text>
          <Group gap={4}>
            {recipients?.to?.length > 0 ? (
              recipients.to.map((r) => <Tag key={r.value}>{r.label}</Tag>)
            ) : (
              <Text size="xs" c="dimmed">-</Text>
            )}
          </Group>
        </Group>

        {recipients?.cc?.length > 0 && (
          <Group gap="xs" align="flex-start">
            <Text size="xs" fw={500} w={50}>CC:</Text>
            <Group gap={4}>
              {recipients.cc.map((r) => <Tag key={r.value}>{r.label}</Tag>)}
            </Group>
          </Group>
        )}

        <Divider my={4} />

        <Box
          p="xs"
          bg="white"
          style={{ borderRadius: 4, minHeight: 100, border: "1px solid #e9ecef" }}
        >
          {content ? (
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{content}</Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              Belum ada pesan
            </Text>
          )}
        </Box>

        {attachments?.length > 0 && (
          <Group gap={4}>
            <IconPaperclip size={12} />
            {attachments.map((f, i) => (
              <Tag key={i}>{f.filename || f.file_name || f.name}</Tag>
            ))}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export default EmailPreview;
