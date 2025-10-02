import CheckTTE from "@/components/EsignBKD/CheckTTE";
import { useDocuments, usePendingRequests } from "@/hooks/esign-bkd";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconFileText,
  IconShieldCheck,
  IconBell,
} from "@tabler/icons-react";
import { Card as AntdCard } from "antd";
import { useRouter } from "next/router";
import { Card, Text, Group, Stack, Alert, Title } from "@mantine/core";

function EsignBkdDashboard() {
  const router = useRouter();

  // Get total documents
  const { data: allDocs, isLoading: docsLoading } = useDocuments({ limit: 1 });
  const { data: signedDocs, isLoading: signedLoading } = useDocuments({
    status: "signed",
    limit: 1,
  });
  const { data: rejectedDocs, isLoading: rejectedLoading } = useDocuments({
    status: "rejected",
    limit: 1,
  });

  // Get pending actions (yang harus dilakukan user)
  const { data: pendingActions, isLoading: pendingLoading } =
    usePendingRequests({ limit: 1 });

  const navigateTo = (path) => {
    router.push(`/esign-bkd${path}`);
  };

  const totalDocs = allDocs?.pagination?.total || 0;
  const totalSigned = signedDocs?.pagination?.total || 0;
  const totalRejected = rejectedDocs?.pagination?.total || 0;
  const totalPending = pendingActions?.pagination?.total || 0;

  return (
    <AntdCard
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FF4500",
          color: "white",
          padding: 20,
          textAlign: "center",
          borderRadius: "12px 12px 0 0",
          margin: "-24px -24px 0 -24px",
        }}
      >
        <IconShieldCheck size={20} style={{ marginBottom: 6 }} />
        <Title order={3} style={{ color: "white", margin: 0, fontSize: 18 }}>
          Dashboard E-Sign BKD
        </Title>
        <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Kelola dokumen elektronik dan tanda tangan digital BKD
        </Text>
      </div>

      <Stack gap="md" mt="md">
        {/* CheckTTE Component */}
        <CheckTTE />

        {/* Alert Aksi Pending - PALING PENTING */}
        {totalPending > 0 && (
          <Alert
            icon={<IconBell size={16} />}
            title="Aksi Diperlukan"
            color="yellow"
            variant="light"
            styles={{
              message: { fontSize: 14 },
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="sm">
                Anda memiliki <strong>{totalPending}</strong> dokumen yang perlu ditindaklanjuti
              </Text>
              <Text
                size="sm"
                fw={600}
                c="yellow.7"
                onClick={() => navigateTo("/pending")}
                style={{ cursor: "pointer" }}
              >
                Lihat →
              </Text>
            </Group>
          </Alert>
        )}

        {/* Stats - 1 Row */}
        <Group grow gap="xs">
          <Card
            padding="md"
            radius="md"
            onClick={() => navigateTo("/pending")}
            style={{
              cursor: "pointer",
              background: "#fff9e6",
              border: "2px solid #faad14",
            }}
          >
            <Group gap="xs" justify="space-between">
              <Text size="xs" fw={600} c="#faad14">
                Aksi Diperlukan
              </Text>
              <Group gap={6}>
                <IconAlertTriangle size={18} color="#faad14" />
                <Text size="xl" fw={700} c="#faad14">
                  {totalPending}
                </Text>
              </Group>
            </Group>
          </Card>

          <Card
            padding="md"
            radius="md"
            withBorder
            onClick={() => navigateTo("/documents")}
            style={{ cursor: "pointer" }}
          >
            <Group gap="xs" justify="space-between">
              <Text size="xs" c="dimmed">
                Total Dokumen
              </Text>
              <Group gap={6}>
                <IconFileText size={16} color="#1890ff" />
                <Text size="lg" fw={600}>
                  {totalDocs}
                </Text>
              </Group>
            </Group>
          </Card>

          <Card
            padding="md"
            radius="md"
            withBorder
            onClick={() => navigateTo("/documents?status=signed")}
            style={{ cursor: "pointer" }}
          >
            <Group gap="xs" justify="space-between">
              <Text size="xs" c="dimmed">
                Ditandatangani
              </Text>
              <Group gap={6}>
                <IconCircleCheck size={16} color="#52c41a" />
                <Text size="lg" fw={600}>
                  {totalSigned}
                </Text>
              </Group>
            </Group>
          </Card>

          <Card
            padding="md"
            radius="md"
            withBorder
            onClick={() => navigateTo("/documents?status=rejected")}
            style={{ cursor: "pointer" }}
          >
            <Group gap="xs" justify="space-between">
              <Text size="xs" c="dimmed">
                Ditolak
              </Text>
              <Group gap={6}>
                <IconCircleX size={16} color="#f5222d" />
                <Text size="lg" fw={600}>
                  {totalRejected}
                </Text>
              </Group>
            </Group>
          </Card>
        </Group>
      </Stack>
    </AntdCard>
  );
}

export default EsignBkdDashboard;
