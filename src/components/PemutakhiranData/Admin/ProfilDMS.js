import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getDMSProfile } from "@/services/siasn-services";
import { ActionIcon, Badge, Group, Skeleton } from "@mantine/core";
import { IconArchive, IconRefresh } from "@tabler/icons-react";
import { Tooltip } from "antd";

const ProfilDMS = () => {
  const router = useRouter();
  const { nip } = router.query;
  const { data, isLoading, isFetching, refetch } = useQuery(
    ["dms-profile", nip],
    () => getDMSProfile(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return <Skeleton height={22} width={80} radius="xl" />;
  }

  if (!data || data.skor_arsip_digital == null) {
    return null;
  }

  const score = data.skor_arsip_digital;

  // Menentukan warna berdasarkan skor
  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    if (score >= 40) return "orange";
    return "red";
  };

  const scoreColor = getScoreColor(score);

  return (
    <Group gap={4}>
      <Tooltip title={`Skor Arsip Digital: ${score}`}>
        <Badge
          color={scoreColor}
          variant="light"
          leftSection={
            <IconArchive
              size={12}
              style={{ display: "flex", alignItems: "center" }}
            />
          }
        >
          DMS: {score}
        </Badge>
      </Tooltip>
      <Tooltip title="Refresh DMS">
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          onClick={refetch}
          loading={isFetching}
        >
          <IconRefresh size={12} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export default ProfilDMS;
