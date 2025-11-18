import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getDMSProfile } from "@/services/siasn-services";
import { Text, Group, Progress, Skeleton, Alert, Box } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

const ProfilDMS = () => {
  const router = useRouter();
  const { nip } = router.query;
  const { data, isLoading } = useQuery(["dms-profile", nip], () =>
    getDMSProfile(nip)
  );

  if (isLoading) {
    return (
      <Box
        style={{
          maxWidth: 220,
          border: "1px solid #e9ecef",
          borderRadius: 6,
          padding: 12,
        }}
      >
        <Skeleton height={12} width={80} mb={4} />
        <Skeleton height={6} mb={2} />
      </Box>
    );
  }

  if (!data?.data?.data) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Info" color="blue">
        Data tidak ditemukan
      </Alert>
    );
  }

  const profile = data.data.data;
  const score = profile.skor_arsip_digital;

  // Menentukan warna berdasarkan skor
  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    if (score >= 40) return "orange";
    return "red";
  };

  const scoreColor = getScoreColor(score);

  return (
    <Box
      style={{
        maxWidth: 220,
        border: "1px solid #e9ecef",
        borderRadius: 6,
        padding: 12,
      }}
    >
      <Group spacing={8} mb={4} noWrap>
        <Text size="xs" color="dimmed">
          Skor Arsip Digital:
        </Text>
        <Text size="lg" weight={700} color={scoreColor}>
          {score}
        </Text>
      </Group>
      <Progress value={score} color={scoreColor} size="sm" radius="xl" />
    </Box>
  );
};

export default ProfilDMS;
