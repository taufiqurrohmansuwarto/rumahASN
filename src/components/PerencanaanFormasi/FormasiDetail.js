import { getFormasiById } from "@/services/perencanaan-formasi.services";
import { Group, Paper, Stack, Text } from "@mantine/core";
import {
  IconCalendarEvent,
  IconClipboardList,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Tabs, Tag } from "antd";
import { useRouter } from "next/router";
import LampiranList from "./LampiranList";
import UsulanList from "./UsulanList";

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { color: "green", label: "Aktif" },
    nonaktif: { color: "default", label: "Nonaktif" },
  };
  const { color, label } = config[status] || config.nonaktif;
  return <Tag color={color}>{label}</Tag>;
};

// Info Badge Component - compact inline
const InfoBadge = ({ icon: Icon, label, value }) => (
  <Group gap={4} wrap="nowrap">
    <Icon size={14} color="#868e96" />
    <Text size="xs" c="dimmed">
      {label}:
    </Text>
    <Text size="xs" fw={600}>
      {value || "-"}
    </Text>
  </Group>
);

function FormasiDetail({ formasiId, activeTab = "usulan" }) {
  const router = useRouter();

  // Fetch formasi detail
  const { data: formasi, isLoading } = useQuery({
    queryKey: ["perencanaan-formasi-detail", formasiId],
    queryFn: () => getFormasiById(formasiId),
    enabled: !!formasiId,
  });

  const handleTabChange = (key) => {
    router.replace(`/perencanaan/formasi/${formasiId}/${key}`);
  };

  const tabItems = [
    {
      key: "usulan",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconClipboardList size={14} />
          Formasi
        </span>
      ),
      children: <UsulanList formasiId={formasiId} formasi={formasi} />,
    },
    {
      key: "lampiran",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconPaperclip size={14} />
          Lampiran
        </span>
      ),
      children: <LampiranList formasiId={formasiId} formasi={formasi} />,
    },
  ];

  if (isLoading) {
    return (
      <Stack gap="xs">
        <Paper p="xs" radius="sm" withBorder>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Paper>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {/* Header - 1 row responsive */}
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" gap="xs" wrap="wrap">
          {/* Left: Title + Badge */}
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} size="sm">
              {formasi?.deskripsi || "Detail Formasi"}
            </Text>
            <StatusBadge status={formasi?.status} />
          </Group>

          {/* Right: Info badges */}
          <Group gap="sm" wrap="wrap">
            <InfoBadge
              icon={IconCalendarEvent}
              label="Tahun"
              value={formasi?.tahun}
            />
            <InfoBadge
              icon={IconClipboardList}
              label="Usulan"
              value={formasi?.usulan?.length || 0}
            />
            <InfoBadge
              icon={IconUser}
              label="Dibuat"
              value={formasi?.dibuatOleh?.username}
            />
          </Group>
        </Group>
      </Paper>

      {/* Tabs - Outside Card */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="small"
        type="card"
      />
    </Stack>
  );
}

export default FormasiDetail;
