import { useChatStats, useMentionCount, useOnlineUsers, useBookmarkCount } from "@/hooks/useRasnChat";
import { Button, Avatar } from "antd";
import { Stack, Text, Divider, Group, Badge, UnstyledButton, Box, Indicator } from "@mantine/core";
import { IconPlus, IconAt, IconPhone, IconUsers, IconBookmark, IconStar } from "@tabler/icons-react";
import { useRouter } from "next/router";
import ChannelList from "./ChannelList";

// Status color helper
const getStatusColor = (status) => {
  const colors = {
    online: "#22C55E", // green
    away: "#F59E0B", // yellow
    busy: "#EF4444", // red
    offline: "#9CA3AF", // gray
  };
  return colors[status] || colors.offline;
};

const NavItem = ({ icon: Icon, label, badge, active, onClick }) => (
  <UnstyledButton
    onClick={onClick}
    px={8}
    py={4}
    style={{
      borderRadius: 4,
      backgroundColor: active ? "#e6f4ff" : "transparent",
    }}
  >
    <Group gap={6} justify="space-between">
      <Group gap={6}>
        <Icon size={14} color="#666" />
        <Text size="xs">{label}</Text>
      </Group>
      {badge > 0 && (
        <Badge size="xs" color="red" variant="filled">
          {badge > 99 ? "99+" : badge}
        </Badge>
      )}
    </Group>
  </UnstyledButton>
);

// User item with online status indicator
const UserItem = ({ user, active, onClick }) => {
  const statusColor = getStatusColor(user?.presence?.status);

  return (
    <UnstyledButton
      onClick={onClick}
      px={8}
      py={4}
      style={{
        borderRadius: 4,
        backgroundColor: active ? "#e6f4ff" : "transparent",
      }}
    >
      <Group gap={8}>
        <Indicator
          inline
          size={10}
          offset={2}
          position="bottom-end"
          color={statusColor}
          withBorder
          processing={user?.presence?.status === "online"}
        >
          <Avatar src={user?.image} size={24}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
        </Indicator>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" truncate>
            {user?.username}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
};

const ChatSidebar = ({ onCreateChannel }) => {
  const router = useRouter();
  const { pathname } = router;
  const { data: stats } = useChatStats();
  const { data: mentionData } = useMentionCount();
  const { data: bookmarkData } = useBookmarkCount();
  const { data: onlineUsers } = useOnlineUsers();

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box px={8} py={6} style={{ borderBottom: "1px solid #f0f0f0" }}>
        <Group justify="space-between">
          <Text size="xs" fw={600}>RASN Chat</Text>
          <Button type="primary" size="small" icon={<IconPlus size={10} />} onClick={onCreateChannel}>
            Baru
          </Button>
        </Group>
      </Box>

      {/* Starred Section */}
      <Box px={6} py={4}>
        <Group gap={4} px={4} mb={4}>
          <IconStar size={12} color="#666" />
          <Text size={10} c="dimmed" tt="uppercase" fw={600}>
            Starred
          </Text>
        </Group>
        <Text size={10} c="dimmed" px={4}>
          Drag and drop important stuff here
        </Text>
      </Box>

      <Divider my={4} />

      {/* Navigation */}
      <Stack gap={0} px={6} py={4}>
        <NavItem
          icon={IconAt}
          label="Mentions"
          badge={mentionData?.count}
          active={pathname === "/rasn-chat/mentions"}
          onClick={() => router.push("/rasn-chat/mentions")}
        />
        <NavItem
          icon={IconBookmark}
          label="Saved Items"
          badge={bookmarkData?.count}
          active={pathname === "/rasn-chat/bookmarks"}
          onClick={() => router.push("/rasn-chat/bookmarks")}
        />
        <NavItem
          icon={IconPhone}
          label="Riwayat Call"
          active={pathname === "/rasn-chat/calls"}
          onClick={() => router.push("/rasn-chat/calls")}
        />
        <NavItem
          icon={IconUsers}
          label="Kelola Roles"
          active={pathname === "/rasn-chat/roles"}
          onClick={() => router.push("/rasn-chat/roles")}
        />
      </Stack>

      <Divider my={4} />

      {/* Channel List */}
      <Box px={6}>
        <Group justify="space-between" px={4} mb={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Channels
          </Text>
          <Text size="xs" c="dimmed">
            {stats?.channels || 0}
          </Text>
        </Group>
        <ChannelList />
      </Box>

      <Divider my={4} />

      {/* Online Users / Direct Messages Section */}
      <Box style={{ flex: 1, overflow: "auto" }} px={6}>
        <Group justify="space-between" px={4} mb={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Direct Messages
          </Text>
          {onlineUsers?.length > 0 && (
            <Badge size="xs" color="green" variant="light">
              {onlineUsers.length} online
            </Badge>
          )}
        </Group>
        <Stack gap={0}>
          {onlineUsers?.slice(0, 10).map((presence) => (
            <UserItem
              key={presence.user_id}
              user={{ ...presence.user, presence }}
              onClick={() => {
                // TODO: Open DM with user
              }}
            />
          ))}
          {(!onlineUsers || onlineUsers.length === 0) && (
            <Text size={10} c="dimmed" px={4}>
              Tidak ada user online
            </Text>
          )}
        </Stack>
      </Box>

      {/* Footer */}
      <Box px={8} py={4} style={{ borderTop: "1px solid #f0f0f0" }}>
        <Text size="xs" c="dimmed" ta="center">
          {stats?.messages || 0} pesan total
        </Text>
      </Box>
    </Stack>
  );
};

export default ChatSidebar;
