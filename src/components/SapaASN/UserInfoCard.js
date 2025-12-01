import { Avatar, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBriefcase,
  IconBuilding,
  IconHash,
  IconUser,
  IconBadge,
} from "@tabler/icons-react";

const InfoItem = ({ icon: Icon, label, value }) => (
  <Group gap="sm" align="flex-start" wrap="nowrap">
    <Icon size={18} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
    <Stack gap={2}>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={600}>{value || "-"}</Text>
    </Stack>
  </Group>
);

const UserInfoCard = ({ user, title = "Data Pribadi", showTitle = true }) => {
  return (
    <Paper p="md" radius="md" withBorder>
      {showTitle && (
        <Text size="sm" fw={600} c="orange" mb="md">{title}</Text>
      )}
      <Group gap="md" align="flex-start" mb="md">
        <Avatar src={user?.image} size={64} radius="xl" color="blue">
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Stack gap={2}>
          <Text size="md" fw={600}>{user?.name || "-"}</Text>
          <Text size="sm" c="dimmed">{user?.nip || "-"}</Text>
          {user?.statusKepegawaian && (
            <Text size="xs" c="blue">{user?.statusKepegawaian}</Text>
          )}
        </Stack>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <InfoItem icon={IconBriefcase} label="Jabatan" value={user?.jabatan} />
        <InfoItem icon={IconBuilding} label="Perangkat Daerah" value={user?.perangkatDaerah} />
      </SimpleGrid>
    </Paper>
  );
};

// Compact version for accordion
export const UserInfoCompact = ({ user }) => (
  <Stack gap="sm">
    <Group gap="sm" align="center">
      <Avatar src={user?.image} size={40} radius="xl" color="blue">
        {user?.name?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Stack gap={0}>
        <Text size="sm" fw={600}>{user?.name || "-"}</Text>
        <Text size="xs" c="dimmed">{user?.nip || "-"}</Text>
      </Stack>
    </Group>
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
      <InfoItem icon={IconBriefcase} label="Jabatan" value={user?.jabatan} />
      <InfoItem icon={IconBuilding} label="Perangkat Daerah" value={user?.perangkatDaerah} />
    </SimpleGrid>
  </Stack>
);

export default UserInfoCard;

