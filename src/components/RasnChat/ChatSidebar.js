import { useChatStats, useMentionCount, useUnreadCounts } from "@/hooks/useRasnChat";
import { Button } from "antd";
import { Stack, Text, Divider, Group, Badge, UnstyledButton, Box } from "@mantine/core";
import { IconPlus, IconAt, IconPhone, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/router";
import ChannelList from "./ChannelList";

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

const ChatSidebar = ({ onCreateChannel }) => {
  const router = useRouter();
  const { pathname } = router;
  const { data: stats } = useChatStats();
  const { data: mentionData } = useMentionCount();

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
      <Box style={{ flex: 1, overflow: "auto" }} px={6}>
        <Group justify="space-between" px={4} mb={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            CHANNELS
          </Text>
          <Text size="xs" c="dimmed">
            {stats?.channels || 0}
          </Text>
        </Group>
        <ChannelList />
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
