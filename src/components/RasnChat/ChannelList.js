import { useMyChannels, useUnreadCounts } from "@/hooks/useRasnChat";
import { Skeleton } from "antd";
import { Stack, Text, Group, UnstyledButton, Badge } from "@mantine/core";
import { IconLock, IconHash } from "@tabler/icons-react";
import { useRouter } from "next/router";

const ChannelList = () => {
  const router = useRouter();
  const { channelId } = router.query;
  const { data: channels, isLoading } = useMyChannels();
  const { data: unreadData } = useUnreadCounts();

  const getUnreadCount = (id) => {
    return unreadData?.channels?.find((c) => c.channelId === id)?.count || 0;
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (!channels?.length) return <Text c="dimmed" size="xs" px={4}>Belum ada channel</Text>;

  return (
    <Stack gap={0}>
      {channels.map((channel) => {
        const unread = getUnreadCount(channel.id);
        const isActive = channelId === channel.id;

        return (
          <UnstyledButton
            key={channel.id}
            onClick={() => router.push(`/rasn-chat/${channel.id}`)}
            px={8}
            py={3}
            style={{
              borderRadius: 4,
              backgroundColor: isActive ? "#e6f4ff" : "transparent",
            }}
          >
            <Group gap={6} justify="space-between">
              <Group gap={6} style={{ flex: 1, minWidth: 0 }}>
                {channel.type === "private" ? (
                  <IconLock size={12} color="#666" />
                ) : (
                  <IconHash size={12} color="#666" />
                )}
                <Text
                  size="xs"
                  fw={unread > 0 ? 600 : 400}
                  truncate
                  style={{ flex: 1 }}
                >
                  {channel.name}
                </Text>
              </Group>
              {unread > 0 && (
                <Badge size="xs" color="red" variant="filled">
                  {unread > 99 ? "99+" : unread}
                </Badge>
              )}
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
};

export default ChannelList;
