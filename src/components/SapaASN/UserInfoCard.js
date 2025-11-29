import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBriefcase,
  IconBuilding,
  IconHash,
  IconUser,
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
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <InfoItem icon={IconUser} label="Nama" value={user?.name} />
        <InfoItem icon={IconHash} label="NIP" value={user?.nip} />
        <InfoItem icon={IconBriefcase} label="Jabatan" value={user?.jabatan} />
        <InfoItem icon={IconBuilding} label="Perangkat Daerah" value={user?.perangkatDaerah} />
      </SimpleGrid>
    </Paper>
  );
};

// Compact version for accordion
export const UserInfoCompact = ({ user }) => (
  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
    <InfoItem icon={IconUser} label="Nama" value={user?.name} />
    <InfoItem icon={IconHash} label="NIP" value={user?.nip} />
    <InfoItem icon={IconBriefcase} label="Jabatan" value={user?.jabatan} />
    <InfoItem icon={IconBuilding} label="Perangkat Daerah" value={user?.perangkatDaerah} />
  </SimpleGrid>
);

export default UserInfoCard;

