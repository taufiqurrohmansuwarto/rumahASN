import EmployeeDetail from "@/components/PemutakhiranData/Admin/EmployeeDetail";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { Alert, Flex, Paper, Stack, Text } from "@mantine/core";
import { IconFileText, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, message } from "antd";
import { useRouter } from "next/router";

/**
 * Komponen utama halaman detail pegawai
 * Menampilkan informasi lengkap pegawai dari SIMASTER dan SIASN
 */
const RekonPegawaiDetail = () => {
  const router = useRouter();
  const { nip } = router?.query;

  // Query untuk data SIMASTER dengan error handling
  const {
    data: dataSimaster,
    isLoading: isLoadingDataSimaster,
    error,
    isError,
  } = useQuery({
    queryKey: ["data-utama-simaster-by-nip", nip],
    queryFn: () => dataUtamaMasterByNip(nip),
    enabled: !!nip,
    staleTime: 60000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (err) => {
      message.error("Gagal memuat data pegawai");
      console.error("Error loading data:", err);
    },
  });

  // Error state
  if (isError) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Alert color="red" title="Error" icon={<IconX size={16} />}>
          <Stack spacing="xs">
            <Text size="sm">
              Gagal memuat data pegawai. Silakan refresh halaman atau coba
              beberapa saat lagi.
            </Text>
            {error?.message && (
              <Text size="xs" c="dimmed">
                Detail: {error.message}
              </Text>
            )}
          </Stack>
        </Alert>
      </Paper>
    );
  }

  return (
    <Skeleton loading={isLoadingDataSimaster} active>
      {dataSimaster ? (
        <Stack spacing="md">
          <EmployeeDetail nip={nip} />
          <Paper p="md" radius="md" withBorder>
            <SiasnTab nip={nip} />
          </Paper>
        </Stack>
      ) : (
        <Paper p="xl" radius="md" withBorder>
          <Flex direction="column" align="center" justify="center" h={200}>
            <IconFileText size={48} color="gray" />
            <Text size="lg" c="dimmed" mt="md">
              Data tidak ditemukan
            </Text>
          </Flex>
        </Paper>
      )}
    </Skeleton>
  );
};

export default RekonPegawaiDetail;
