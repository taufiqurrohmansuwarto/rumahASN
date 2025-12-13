import { useCallHistory } from "@/hooks/useRasnChat";
import { Skeleton } from "antd";
import { Stack, Text, Group, Avatar, Badge, Box, Paper } from "@mantine/core";
import { IconPhone, IconVideo } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("id");

const formatDuration = (seconds) => {
  if (!seconds) return "-";
  const d = dayjs.duration(seconds, "seconds");
  if (d.hours() > 0) {
    return `${d.hours()}j ${d.minutes()}m`;
  }
  return `${d.minutes()}m ${d.seconds()}d`;
};

const CallHistory = ({ channelId }) => {
  const { data, isLoading } = useCallHistory(channelId, { page: 1, limit: 20 });
  const calls = data?.results || [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  
  if (!calls.length) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed">Belum ada riwayat panggilan</Text>
      </Box>
    );
  }

  return (
    <Stack gap="xs">
      {calls.map((call) => (
        <Paper key={call.id} withBorder p="sm">
          <Group gap="sm">
            <Avatar
              size="sm"
              radius="xl"
              color={call.call_type === "video" ? "blue" : "green"}
            >
              {call.call_type === "video" ? <IconVideo size={14} /> : <IconPhone size={14} />}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {call.title || (call.call_type === "video" ? "Video Call" : "Voice Call")}
                </Text>
                <Badge
                  size="xs"
                  color={call.status === "active" ? "green" : "gray"}
                  variant="light"
                >
                  {call.status === "active" ? "Berlangsung" : "Selesai"}
                </Badge>
              </Group>
              <Group gap="xs" mt={2}>
                <Text size="xs" c="dimmed">
                  Dimulai oleh {call.starter?.username}
                </Text>
                <Text size="xs" c="dimmed">•</Text>
                <Text size="xs" c="dimmed">
                  {dayjs(call.started_at).format("DD MMM HH:mm")}
                </Text>
                {call.duration && (
                  <>
                    <Text size="xs" c="dimmed">•</Text>
                    <Text size="xs" c="dimmed">Durasi: {formatDuration(call.duration)}</Text>
                  </>
                )}
                {call.max_participants > 0 && (
                  <>
                    <Text size="xs" c="dimmed">•</Text>
                    <Text size="xs" c="dimmed">{call.max_participants} peserta</Text>
                  </>
                )}
              </Group>
            </Box>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default CallHistory;
