import { usePinnedMessages, useTogglePinMessage } from "@/hooks/useRasnChat";
import { Skeleton, Button, Popconfirm } from "antd";
import { Stack, Text, Group, Avatar, Paper, Box } from "@mantine/core";
import { IconPin, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const PinnedMessages = ({ channelId }) => {
  const { data: pinned, isLoading } = usePinnedMessages(channelId);
  const togglePin = useTogglePinMessage();

  const handleUnpin = (messageId) => {
    togglePin.mutate({ channelId, messageId });
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  
  if (!pinned?.length) {
    return (
      <Box ta="center" py="xl">
        <IconPin size={32} color="#d9d9d9" />
        <Text c="dimmed" mt="sm">Tidak ada pesan yang di-pin</Text>
        <Text size="xs" c="dimmed">Pin pesan penting agar mudah ditemukan</Text>
      </Box>
    );
  }

  return (
    <Stack gap="xs">
      {pinned.map((item) => (
        <Paper key={item.id} p="sm" withBorder>
          <Group align="flex-start" gap="sm">
            <Avatar src={item.message?.user?.image} size="sm" radius="xl">
              {item.message?.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs">
                <Text size="xs" fw={600}>{item.message?.user?.username}</Text>
                <Text size="xs" c="dimmed">{dayjs(item.message?.created_at).format("DD MMM HH:mm")}</Text>
              </Group>
              <Text size="sm" mt={2} style={{ whiteSpace: "pre-wrap" }}>
                {item.message?.content}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Di-pin oleh {item.pinner?.username} • {dayjs(item.pinned_at).fromNow()}
              </Text>
            </Box>
            <Popconfirm
              title="Unpin pesan ini?"
              onConfirm={() => handleUnpin(item.message_id)}
              okText="Ya"
              cancelText="Batal"
            >
              <Button
                type="text"
                size="small"
                icon={<IconX size={14} />}
                loading={togglePin.isLoading}
              />
            </Popconfirm>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default PinnedMessages;
