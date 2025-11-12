import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import PengaturanGelarByNip from "@/components/LayananSIASN/PengaturanGelarByNip";
import CekPencantumanGelar from "@/components/PemutakhiranData/Button/CekPencantumanGelar";
import CekPencantumanGelarProfesi from "@/components/PemutakhiranData/Button/CekPencantumanGelarProfesi";
import CheckFotoPersonalByNip from "@/components/PemutakhiranData/OCR/CheckFotoPersonalByNip";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  fotoByNip,
  getDataKppn,
  getPnsAllByNip,
  updateDataUtamaByNip,
  updateFotoByNip,
} from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import {
  Accordion,
  Alert,
  Badge,
  Box,
  Center,
  Group,
  LoadingOverlay,
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
  IconId,
  IconInfoCircle,
  IconMapPin,
  IconUpload,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Col,
  Popconfirm,
  Row,
  Space,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/router";
import SyncGolonganByNip from "../Sync/SyncGolonganByNip";
import SyncJabatanByNip from "../Sync/SyncJabatanByNip";
import TrackingKenaikanPangkatByNip from "./Usulan/TrackingKenaikanPangkatByNip";
import TrackingPemberhentianByNip from "./Usulan/TrackingPemberhentianByNip";
import TrackingPencantumanGelarByNip from "./Usulan/TrackingPencantumanGelarByNip";
import TrackingPenyesuaianMasaKerjaByNip from "./Usulan/TrackingPenyesuaianMasaKerjaByNip";
import TrackingPerbaikanNamaByNip from "./Usulan/TrackingPerbaikanNamaByNip";
import TrackingUsulanLainnyaByNip from "./Usulan/TrackingUsulanLainnyaByNip";

// import { patchAnomali2023 } from "@/services/anomali.services";

const EmployeeUnor = ({ data, loading, nip }) => {
  return (
    <Alert
      icon={<IconInfoCircle size={16} />}
      title="Informasi ASN Via SIASN"
      color="yellow"
      variant="light"
    >
      <Box>
        <LoadingOverlay visible={loading} />
        {data ? (
          <Box>
            <Text size="sm" mb={2}>
              <IconUser
                size={14}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {data?.nama} ({data?.nip_baru})
            </Text>
            <Text size="sm" c="dimmed" mb="xs">
              <IconBriefcase
                size={14}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {data?.jabatan_nama} - {data?.golongan_nm}
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              {data?.unor_nm}
            </Text>
            <Tracking nip={nip} />
          </Box>
        ) : (
          <Badge size="sm" color="red" variant="light">
            Tidak ditemukan di SIASN
          </Badge>
        )}
      </Box>
    </Alert>
  );
};

const EmployeeDescriptionMaster = ({ data, loading, dataSiasn }) => {
  return (
    <MantineSkeleton visible={loading}>
      <Stack spacing="lg">
        {/* Data Lokal - Tanpa Collapse */}
        <Paper p="md" radius="md" withBorder>
          <Group spacing="xs" mb="md">
            <IconFileText size={16} color="blue" />
            <Text size="sm" fw={500}>
              Data Lokal (SIMASTER)
            </Text>
          </Group>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={8}>
              <Tooltip title="Nama Lengkap Pegawai">
                <Group spacing={4} align="baseline">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Nama
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Text size="xs">{data?.nama || "-"}</Text>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24} sm={8}>
              <Tooltip title="Nomor Induk Pegawai">
                <Group spacing={4} align="baseline">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    NIP
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Text size="xs" ff="monospace">
                    {data?.nip_baru || "-"}
                  </Text>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24} sm={8}>
              <Tooltip title="Usia Pegawai">
                <Group spacing={4} align="center">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Usia
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Badge
                    size="sm"
                    color="violet"
                    variant="gradient"
                    gradient={{ from: "violet", to: "blue" }}
                  >
                    {data?.tgl_lahir ? `${getUmur(data?.tgl_lahir)}th` : "-"}
                  </Badge>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24} sm={8}>
              <Tooltip title={data?.jabatan?.jabatan || "Jabatan"}>
                <Group spacing={4} align="baseline">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Jabatan
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Text size="xs" truncate style={{ flex: 1 }}>
                    {data?.jabatan?.jabatan || "-"}
                  </Text>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24} sm={8}>
              <Tooltip title="Golongan/Pangkat">
                <Group spacing={4} align="center">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Golongan
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Badge size="sm" color="yellow" variant="dot">
                    {data?.pangkat?.golongan || "-"}
                  </Badge>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24} sm={8}>
              <Tooltip
                title={`${data?.pendidikan?.jenjang || ""} ${
                  data?.pendidikan?.prodi || ""
                } - ${data?.pendidikan?.nama_sekolah || ""}`}
              >
                <Group spacing={4} align="baseline">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Pendidikan
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Text size="xs">
                    {data?.pendidikan?.jenjang || "-"}{" "}
                    {data?.pendidikan?.prodi || ""}
                  </Text>
                </Group>
              </Tooltip>
            </Col>
            <Col xs={24}>
              <Tooltip title={data?.skpd?.detail || "Unit Kerja"}>
                <Group spacing={4} align="flex-start">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ width: "70px", flexShrink: 0 }}
                  >
                    Unit Kerja
                  </Text>
                  <Text size="xs" c="dimmed">
                    :
                  </Text>
                  <Text size="xs" style={{ flex: 1, wordBreak: "break-word" }}>
                    {data?.skpd?.detail || "-"}
                  </Text>
                </Group>
              </Tooltip>
            </Col>
          </Row>
        </Paper>

        {/* Data SIASN - Dengan Collapse */}
        <Accordion variant="separated">
          <Accordion.Item value="siasn">
            <Accordion.Control>
              <Group spacing="xs">
                <IconBuilding size={16} color="orange" />
                <Text size="sm" fw={500}>
                  Data Pusat (SIASN)
                </Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel pt="md">
              {dataSiasn ? (
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}>
                    <Tooltip title="Nama dari SIASN">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Nama
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge size="sm" color="teal" variant="outline">
                          {dataSiasn?.nama || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip title="NIK dari SIASN">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          NIK
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge
                          size="sm"
                          color="indigo"
                          variant="dot"
                          ff="monospace"
                        >
                          {dataSiasn?.nik || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip title="TMT PNS">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          TMT PNS
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge size="sm" color="cyan" variant="light">
                          {dataSiasn?.tmtPns || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip title="Golongan Ruang">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Gol. Ruang
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge
                          size="sm"
                          color="grape"
                          variant="gradient"
                          gradient={{ from: "grape", to: "pink" }}
                        >
                          {dataSiasn?.golRuangAkhir || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={16}>
                    <Tooltip title={dataSiasn?.jabatanNama || "Jabatan SIASN"}>
                      <Group spacing={4} align="baseline">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Jabatan
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Text
                          size="xs"
                          style={{ flex: 1, wordBreak: "break-word" }}
                        >
                          {dataSiasn?.jabatanNama || "-"}
                        </Text>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24}>
                    <Tooltip
                      title={`${dataSiasn?.unorIndukNama || ""} - ${
                        dataSiasn?.unorNama || ""
                      }`}
                    >
                      <Group spacing={4} align="flex-start">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Unit Kerja
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Text
                          size="xs"
                          style={{ flex: 1, wordBreak: "break-word" }}
                        >
                          {dataSiasn?.unorIndukNama && dataSiasn?.unorNama
                            ? `${dataSiasn.unorIndukNama} - ${dataSiasn.unorNama}`
                            : dataSiasn?.unorNama || "-"}
                        </Text>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip title="Kedudukan PNS">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Kedudukan
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge size="sm" color="pink" variant="light">
                          {dataSiasn?.kedudukanPnsNama || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip
                      title={`${dataSiasn?.tkPendidikanTerakhir || ""} - ${
                        dataSiasn?.pendidikanTerakhirNama || ""
                      }`}
                    >
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Pendidikan
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge size="sm" color="lime" variant="dot">
                          {dataSiasn?.tkPendidikanTerakhir &&
                          dataSiasn?.pendidikanTerakhirNama
                            ? `${dataSiasn.tkPendidikanTerakhir} - ${dataSiasn.pendidikanTerakhirNama}`
                            : dataSiasn?.tkPendidikanTerakhir || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Tooltip title="Jenjang Jabatan ASN">
                      <Group spacing={4} align="center">
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          Jenjang Jab
                        </Text>
                        <Text size="xs" c="dimmed">
                          :
                        </Text>
                        <Badge size="sm" color="orange" variant="outline">
                          {dataSiasn?.asnJenjangJabatan || "-"}
                        </Badge>
                      </Group>
                    </Tooltip>
                  </Col>
                </Row>
              ) : (
                <Text size="xs" c="dimmed">
                  Data SIASN tidak tersedia
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </MantineSkeleton>
  );
};

const EmployeeContent = ({ data, loading, nip }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateFoto, isLoading: isLoadingUpdateFoto } =
    useMutation((nip) => updateFotoByNip(nip), {
      onSuccess: () => {
        queryClient.invalidateQueries(["foto-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
        queryClient.invalidateQueries(["data-pns-all", nip]);
        message.success("Berhasil memperbarui foto");
      },
      onError: () => {
        message.error("Gagal memperbarui foto");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["foto-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
        queryClient.invalidateQueries(["data-pns-all", nip]);
      },
    });

  const handleUpdateFoto = async () => {
    await updateFoto(nip);
  };

  return (
    <Stack spacing="sm">
      {/* Status Badges - Compact */}
      <Group spacing={4} wrap="wrap">
        <StatusMaster status={data?.master?.status} />
        <StatusSIASN
          status={data?.siasn?.statusPegawai}
          kedudukanNama={data?.siasn?.kedudukanPnsNama}
        />
        <Tooltip
          title={`NIK ${data?.siasn?.validNik ? "Valid" : "Tidak Valid"}: ${
            data?.siasn?.nik || "-"
          }`}
        >
          <Badge
            color={data?.siasn?.validNik ? "lime" : "pink"}
            variant={data?.siasn?.validNik ? "light" : "outline"}
            leftSection={<IconId size={12} />}
          >
            {data?.siasn?.validNik ? "Valid" : "Invalid"}
          </Badge>
        </Tooltip>
        <Tooltip title={data?.siasn?.jenisPegawaiNama || "Jenis Pegawai"}>
          <Badge
            color="indigo"
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            leftSection={<IconUsers size={12} />}
          >
            {data?.siasn?.jenisPegawaiNama?.split(" ")[0] || "PNS"}
          </Badge>
        </Tooltip>
      </Group>

      {/* Photo Section - Compact & Centered */}
      <Center>
        <Group
          spacing="lg"
          align="center"
          style={{
            padding: "16px",
            border: "1px solid #e3f2fd",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <Stack align="center" spacing={4}>
            <Text size="xs" c="blue" fw={600}>
              Foto SIMASTER
            </Text>
            <Avatar
              src={data?.master?.foto}
              size={80}
              icon={<IconUser size={30} />}
            />
            <Text size="xs" c="dimmed">
              Database Lokal
            </Text>
          </Stack>

          <Stack align="center" spacing="xs">
            <Space>
              <CheckFotoPersonalByNip nip={nip} />
              <Button
                type="primary"
                size="small"
                onClick={handleUpdateFoto}
                loading={isLoadingUpdateFoto}
                icon={<IconUpload size={14} />}
              >
                Transfer Foto
              </Button>
            </Space>
            <Group spacing={4} wrap="wrap" justify="center">
              <SyncJabatanByNip nip={nip} />
              <SyncGolonganByNip nip={nip} />
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              Transfer & Sync Data
            </Text>
          </Stack>

          <Stack align="center" spacing={4}>
            <Text size="xs" c="orange" fw={600}>
              Foto SIASN
            </Text>
            <Avatar
              src={data?.fotoSiasn?.data}
              size={80}
              icon={<IconUser size={30} />}
            />
            <Text size="xs" c="dimmed">
              Database Pusat
            </Text>
          </Stack>
        </Group>
      </Center>

      {/* Employee Description */}
      <EmployeeDescriptionMaster
        loading={loading}
        data={data?.master}
        dataSiasn={data?.siasn}
      />
    </Stack>
  );
};

const Tracking = ({ nip }) => {
  return (
    <Group spacing="xs" wrap="wrap">
      <TrackingKenaikanPangkatByNip nip={nip} />
      <TrackingPemberhentianByNip nip={nip} />
      <TrackingPerbaikanNamaByNip nip={nip} />
      <TrackingUsulanLainnyaByNip nip={nip} />
      <TrackingPencantumanGelarByNip nip={nip} />
      <TrackingPenyesuaianMasaKerjaByNip nip={nip} />
    </Group>
  );
};

const StatusSIASN = ({ status, kedudukanNama }) => {
  return (
    <Tooltip title={`Status: ${status} - Kedudukan: ${kedudukanNama}`}>
      <Badge
        color="orange"
        variant="outline"
        leftSection={
          status === "PNS" ? <IconBuilding size={12} /> : <IconUser size={12} />
        }
      >
        {status} - {kedudukanNama?.slice(0, 10)}
      </Badge>
    </Tooltip>
  );
};

const StatusMaster = ({ status }) => {
  return (
    <Tooltip title={`Status Pegawai SIMASTER: ${status}`}>
      <Badge
        color={status === "Aktif" ? "green" : "red"}
        variant="outline"
        leftSection={
          status === "Aktif" ? <IconCheck size={12} /> : <IconX size={12} />
        }
      >
        {status}
      </Badge>
    </Tooltip>
  );
};

const Kppn = ({ id }) => {
  const router = useRouter();
  const nip = router?.query?.nip;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(
    ["data-kppn"],
    () => getDataKppn(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: update } = useMutation(
    (data) => updateDataUtamaByNip(data),
    {
      onSuccess: () => message.success("Berhasil memperbarui data"),
      onError: () => message.error("Gagal memperbarui data"),
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
      },
    }
  );

  const handleUpdate = async () => {
    const payload = {
      nip,
      data: {
        type: "KPKN",
      },
    };

    await update(payload);
  };

  const dataKppn = (kppnId) => {
    if (!kppnId || !data) return null;
    return data?.find((d) => d.id === kppnId);
  };

  // Jika tidak ada id, jangan render apapun
  if (!id) {
    return null;
  }

  const kppnData = dataKppn(id);

  return (
    <>
      {kppnData ? (
        <Popconfirm onConfirm={handleUpdate} title="Update KPPN menjadi BPKAD?">
          <Tooltip title={`KPPN: ${kppnData?.nama}`}>
            <Badge
              color="blue"
              variant="gradient"
              gradient={{ from: "blue", to: "teal" }}
              style={{ cursor: "pointer" }}
              leftSection={<IconMapPin size={12} />}
            >
              {kppnData?.nama}
            </Badge>
          </Tooltip>
        </Popconfirm>
      ) : (
        <Popconfirm onConfirm={handleUpdate} title="Update KPPN menjadi BPKAD?">
          <Tooltip title={`KPPN ID: ${id} tidak ditemukan dalam database`}>
            <Badge
              color="red"
              variant="outline"
              style={{ cursor: "pointer" }}
              leftSection={<IconMapPin size={12} />}
            >
              KPPN Tidak Ditemukan
            </Badge>
          </Tooltip>
        </Popconfirm>
      )}
    </>
  );
};

function EmployeeDetail({ nip }) {
  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataPnsAll, isLoading: isLoadingDataPns } = useQuery(
    ["data-pns-all", nip],
    () => getPnsAllByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: foto } = useQuery(["foto-by-nip", nip], () => fotoByNip(nip), {
    refetchOnWindowFocus: false,
  });

  const { data: siasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  return (
    <Paper p="sm" radius="md" withBorder>
      <Group spacing="xs" mb="sm">
        <IconUser size={16} color="blue" />
        <Text fw={600} size="md">
          Informasi Pegawai
        </Text>
      </Group>

      <Stack spacing="sm">
        <EmployeeContent
          nip={nip}
          loading={isLoadingDataSimaster}
          data={{
            master: dataSimaster,
            siasn: siasn,
            pns: dataPnsAll,
            fotoSiasn: foto,
          }}
        />

        <Group spacing="xs" wrap="wrap">
          <IPAsnByNip tahun={2024} nip={dataSimaster?.nip_baru} />
          <CekPencantumanGelar nip={nip} />
          <CekPencantumanGelarProfesi nip={nip} />
          <Kppn id={siasn?.kppnId} />
          <PengaturanGelarByNip nip={nip} />
        </Group>
      </Stack>
    </Paper>
  );
}

export default EmployeeDetail;
