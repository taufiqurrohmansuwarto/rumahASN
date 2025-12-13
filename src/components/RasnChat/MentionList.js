import { useMyMentions, useMarkMentionAsRead } from "@/hooks/useRasnChat";
import { Skeleton } from "antd";
import { Stack, Text, Group, Avatar, Paper, Badge, Box } from "@mantine/core";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const MentionList = () => {
  const router = useRouter();
  const { data, isLoading } = useMyMentions({ page: 1, limit: 50 });
  const markAsRead = useMarkMentionAsRead();

  const mentions = data?.results || [];

  const handleClick = async (mention) => {
    if (!mention.is_read) await markAsRead.mutateAsync(mention.id);
    router.push(`/rasn-chat/${mention.message?.channel_id}`);
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  
  if (!mentions.length) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed">Tidak ada mention</Text>
        <Text size="xs" c="dimmed">Anda akan melihat notifikasi ketika seseorang @mention Anda</Text>
      </Box>
    );
  }

  return (
    <Stack gap="xs">
      {mentions.map((mention) => (
        <Paper
          key={mention.id}
          p="sm"
          withBorder
          onClick={() => handleClick(mention)}
          style={{
            cursor: "pointer",
            backgroundColor: mention.is_read ? "transparent" : "#f6ffed",
            borderLeft: mention.is_read ? undefined : "3px solid #52c41a",
          }}
        >
          <Group align="flex-start" gap="sm">
            <Avatar src={mention.message?.user?.image} size="sm" radius="xl">
              {mention.message?.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs">
                <Text size="xs" fw={600}>{mention.message?.user?.username}</Text>
                <Text size="xs" c="dimmed">di #{mention.message?.channel?.name}</Text>
              </Group>
              <Text size="sm" lineClamp={2} mt={2}>{mention.message?.content}</Text>
              <Text size="xs" c="dimmed" mt={4}>{dayjs(mention.created_at).fromNow()}</Text>
            </Box>
            {!mention.is_read && <Badge size="xs" color="green">Baru</Badge>}
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default MentionList;
