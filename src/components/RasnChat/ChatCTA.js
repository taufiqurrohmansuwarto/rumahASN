import { useChatStats, useOnlineUsers } from "@/hooks/useRasnChat";
import { Card, Button } from "antd";
import { Group, Text, Stack, Avatar, Box } from "@mantine/core";
import {
  IconMessages,
  IconUsers,
  IconCircleFilled,
  IconArrowRight,
} from "@tabler/icons-react";
import { useRouter } from "next/router";

/**
 * ChatCTA - Call to Action component untuk menarik minat pengguna
 * Menampilkan jumlah channel dan pengguna aktif
 *
 * Props:
 * - variant: "card" | "banner" | "compact" (default: "card")
 * - showButton: boolean (default: true)
 * - onNavigate: function (optional, default navigates to /rasn-chat)
 */
const ChatCTA = ({ variant = "card", showButton = true, onNavigate }) => {
  const router = useRouter();
  const { data: stats } = useChatStats();
  const { data: onlineUsers } = useOnlineUsers();

  const channelCount = stats?.channels || 0;
  const onlineCount = onlineUsers?.length || 0;

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      router.push("/rasn-chat");
    }
  };

  // Compact variant - inline badge style
  if (variant === "compact") {
    return (
      <Group
        gap="md"
        onClick={handleNavigate}
        style={{ cursor: "pointer" }}
      >
        <Group gap={4}>
          <IconMessages size={16} color="#1890ff" />
          <Text size="sm" fw={500}>{channelCount} Channel</Text>
        </Group>
        <Group gap={4}>
          <IconCircleFilled size={8} color="#52c41a" />
          <Text size="sm" fw={500}>{onlineCount} Online</Text>
        </Group>
      </Group>
    );
  }

  // Banner variant - horizontal strip
  if (variant === "banner") {
    return (
      <Box
        p="sm"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 8,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="lg">
            <Group gap={6}>
              <IconMessages size={20} color="#fff" />
              <Text size="sm" fw={600} c="white">
                {channelCount} Channel Aktif
              </Text>
            </Group>
            <Group gap={6}>
              <IconCircleFilled size={10} color="#52c41a" />
              <Text size="sm" fw={600} c="white">
                {onlineCount} Pengguna Online
              </Text>
            </Group>
          </Group>
          {showButton && (
            <Button
              type="primary"
              ghost
              size="small"
              onClick={handleNavigate}
              style={{ borderColor: "#fff", color: "#fff" }}
            >
              Gabung Sekarang
              <IconArrowRight size={14} style={{ marginLeft: 4 }} />
            </Button>
          )}
        </Group>
      </Box>
    );
  }

  // Default card variant
  return (
    <Card
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: 12,
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconMessages size={24} color="#fff" />
          <Text size="lg" fw={700} c="white">
            RASN Chat
          </Text>
        </Group>

        <Text size="sm" c="rgba(255,255,255,0.9)">
          Bergabung dengan komunitas ASN Jawa Timur untuk berdiskusi dan berbagi informasi.
        </Text>

        <Group gap="xl">
          <Stack gap={2}>
            <Text size="xl" fw={700} c="white">
              {channelCount}
            </Text>
            <Text size="xs" c="rgba(255,255,255,0.8)">
              Channel
            </Text>
          </Stack>
          <Stack gap={2}>
            <Group gap={4}>
              <Text size="xl" fw={700} c="white">
                {onlineCount}
              </Text>
              <IconCircleFilled size={10} color="#52c41a" />
            </Group>
            <Text size="xs" c="rgba(255,255,255,0.8)">
              Online Sekarang
            </Text>
          </Stack>
        </Group>

        {/* Online users preview */}
        {onlineUsers && onlineUsers.length > 0 && (
          <Group gap={4}>
            <Avatar.Group spacing={4}>
              {onlineUsers.slice(0, 5).map((presence) => (
                <Avatar
                  key={presence.user_id}
                  src={presence.user?.image}
                  size={28}
                  radius="xl"
                  style={{ border: "2px solid #fff" }}
                >
                  {presence.user?.username?.[0]?.toUpperCase()}
                </Avatar>
              ))}
            </Avatar.Group>
            {onlineUsers.length > 5 && (
              <Text size="xs" c="rgba(255,255,255,0.8)">
                +{onlineUsers.length - 5} lainnya
              </Text>
            )}
          </Group>
        )}

        {showButton && (
          <Button
            type="primary"
            size="large"
            onClick={handleNavigate}
            style={{
              backgroundColor: "#fff",
              color: "#667eea",
              border: "none",
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Mulai Mengobrol
            <IconArrowRight size={16} style={{ marginLeft: 8 }} />
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default ChatCTA;
