import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import EmployeeDetail from "@/components/PemutakhiranData/Admin/EmployeeDetail";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { patchAnomali2023 } from "@/services/anomali.services";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Group,
  Avatar as MantineAvatar,
  Skeleton as MantineSkeleton,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBriefcase,
  IconBuilding,
  IconCheck,
  IconFileText,
  IconInfoCircle,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox, Form, Input, Modal, Tooltip, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Komponen untuk mengubah status anomali
 * @param {Object} props - Properti komponen
 * @param {Object} props.data - Data anomali
 * @param {boolean} props.open - Status modal terbuka
 * @param {Function} props.onCancel - Fungsi untuk menutup modal
 */
const ChangeStatusAnomali = ({ data, open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const nip = router.query.nip;
  const queryClient = useQueryClient();

  // Mutasi untuk memperbarui data anomali
  const { mutate: update, isLoading } = useMutation({
    mutationFn: patchAnomali2023,
    onSuccess: () => {
      message.success("Berhasil memperbarui data");
      onCancel();
    },
    onError: () => {
      message.error("Gagal memperbarui data");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
    },
  });

  // Mengisi form dengan data yang ada
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        is_repaired: data?.is_repaired,
        description: data?.description,
      });
    }
  }, [data, form]);

  // Handler untuk submit form
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      update({
        id: data?.id,
        data: {
          is_repaired: values.is_repaired,
          description: values.description,
          reset: values.reset,
        },
      });
    } catch (error) {
      console.log("Form validation error:", error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Perbaikan Anomali"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Stack spacing="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Harap diperhatikan"
          color="red"
          variant="filled"
        >
          Pastikan Data Jabatan Terakhir di SIASN menggunakan awalan UPT jika di
          sekolah. Jangan di beri tanda cek sebelum diperbaiki
        </Alert>
        <Form layout="vertical" form={form}>
          <Form.Item
            valuePropName="checked"
            name="is_repaired"
            label="Sudah diperbaiki?"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item valuePropName="checked" name="reset" label="Lepas">
            <Checkbox />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Stack>
    </Modal>
  );
};

/**
 * Komponen untuk menampilkan biodata pegawai
 * @param {Object} props - Properti komponen
 * @param {Object} props.data - Data pegawai dari SIMASTER
 * @param {boolean} props.loading - Status loading data
 * @param {boolean} props.isLoadingDataPns - Status loading data PNS
 * @param {Object} props.dataPnsAll - Data PNS
 * @param {Object} props.siasn - Data dari SIASN
 */
const EmployeeBio = ({
  data,
  loading,
  isLoadingDataPns,
  dataPnsAll,
  siasn,
}) => {
  const [open, setOpen] = useState(false);
  const [anomali, setAnomali] = useState(null);

  const handleOpen = (anomali) => {
    setAnomali(anomali);
    setOpen(true);
  };

  const handleClose = () => {
    setAnomali(null);
    setOpen(false);
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <ChangeStatusAnomali data={anomali} open={open} onCancel={handleClose} />
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 2 }}>
          <Flex justify="center">
            <MantineAvatar
              size={90}
              radius="xl"
              src={data?.foto}
              alt={data?.nama}
            >
              <IconUser size={40} />
            </MantineAvatar>
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 10 }}>
          <Stack spacing="sm">
            <Group spacing="xs" wrap="wrap">
              {/* Status dari SIMASTER */}
              <Tooltip label="Status Pegawai dari SIMASTER">
                <Badge
                  color={data?.status === "Aktif" ? "green" : "red"}
                  variant="filled"
                  leftSection={<IconUser size={12} />}
                >
                  {data?.status === "Aktif"
                    ? "Pegawai Aktif"
                    : "Pegawai Non Aktif"}
                </Badge>
              </Tooltip>

              {/* Status dari SIASN */}
              <Tooltip label="Status Pegawai dari SIASN">
                <Badge
                  color="yellow"
                  variant="filled"
                  leftSection={<IconBriefcase size={12} />}
                >
                  {siasn?.kedudukanPnsNama}
                </Badge>
              </Tooltip>

              {/* Daftar anomali */}
              {data?.anomali?.length > 0 && (
                <>
                  {data.anomali.map((d) => (
                    <ActionIcon
                      key={d?.id}
                      variant="filled"
                      color={d?.is_repaired ? "green" : "red"}
                      size="lg"
                      radius="md"
                      onClick={() => handleOpen(d)}
                      style={{ cursor: "pointer" }}
                    >
                      <Tooltip label={d?.jenis_anomali_nama}>
                        {d?.is_repaired ? (
                          <IconCheck size={14} />
                        ) : (
                          <IconX size={14} />
                        )}
                      </Tooltip>
                    </ActionIcon>
                  ))}
                </>
              )}
            </Group>

            {/* Informasi pegawai */}
            <Box>
              <Text size="lg" fw={600} mb={4}>
                {data?.nama} - {data?.nip_baru}
              </Text>
              <Group spacing={4} align="center">
                <IconBriefcase size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  {data?.jabatan?.jabatan}
                </Text>
              </Group>
              <Group spacing={4} align="center" mt={2}>
                <IconBuilding size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  {data?.skpd?.detail}
                </Text>
              </Group>
            </Box>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Informasi ASN */}
      <Box mt="md">
        <MantineSkeleton visible={isLoadingDataPns}>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Informasi ASN"
            color="yellow"
            variant="light"
          >
            <Stack spacing={4}>
              <Text size="sm">
                {dataPnsAll?.nama} ({dataPnsAll?.nip_baru}) -{" "}
                {dataPnsAll?.unor_nm}
              </Text>
              <Text size="sm" c="dimmed">
                {dataPnsAll?.jabatan_nama}
              </Text>
            </Stack>
          </Alert>
        </MantineSkeleton>
      </Box>

      {/* Komponen IP ASN */}
      <Box mt="md">
        <IPAsnByNip tahun={2023} nip={data?.nip_baru} />
      </Box>
    </Paper>
  );
};

/**
 * Komponen utama halaman detail pegawai
 * Menampilkan informasi lengkap pegawai dari SIMASTER dan SIASN
 */
const RekonPegawaiDetail = () => {
  const router = useRouter();
  const { nip } = router?.query;

  // Query untuk data SIMASTER
  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery({
    queryKey: ["data-utama-simaster-by-nip", nip],
    queryFn: () => dataUtamaMasterByNip(nip),
    enabled: !!nip,
  });

  return (
    <Container size="xl" p={0}>
      <MantineSkeleton visible={isLoadingDataSimaster}>
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
      </MantineSkeleton>
    </Container>
  );
};

export default RekonPegawaiDetail;
