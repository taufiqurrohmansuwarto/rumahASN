import TextSensor from "@/components/TextSensor";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataRiwayatPengadaanPersonalByNip,
  dataUtamSIASNByNip,
} from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import {
  Badge,
  Box,
  Container,
  Divider,
  Group,
  Skeleton as MantineSkeleton,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconDatabase,
  IconDownload,
  IconFileText,
  IconRefresh,
  IconServer,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Anchor, Button, Col, Grid, Row } from "antd";
import CompareUbahDataByNip from "../CompareUbahDataByNip";
import InformationDetail from "../InformationDetail";
import RiwayatPengadaan from "../RiwayatPengadaan";
import CreateCPNS from "./CreateCPNS";

const FileSPMT = ({ data }) => {
  let path = {};
  try {
    path = data?.path ? JSON.parse(data.path) : {};
  } catch (e) {
    path = {};
  }

  const handleDownload = () => {
    const filePath = path?.["888"]?.object;
    if (filePath) {
      window.open(
        `/helpdesk/api/siasn/ws/download?filePath=${filePath}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      {path?.["888"]?.object && (
        <Button
          type="link"
          icon={<IconDownload size={14} />}
          onClick={handleDownload}
        >
          Unduh File SPMT
        </Button>
      )}
    </>
  );
};

const FileSK = ({ data }) => {
  let path = {};
  try {
    path = data?.path ? JSON.parse(data.path) : {};
  } catch (e) {
    path = {};
  }

  const handleDownload = () => {
    const filePath = path?.["889"]?.object;
    if (filePath) {
      window.open(
        `/helpdesk/api/siasn/ws/download?filePath=${filePath}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      {path?.["889"]?.object && (
        <Button
          type="link"
          icon={<IconDownload size={14} />}
          onClick={handleDownload}
        >
          Unduh File SK
        </Button>
      )}
    </>
  );
};

const dataTabel = (siasn, simaster) => {
  return [
    {
      id: "nama",
      siasn: siasn?.nama,
      master: simaster?.nama,
      label: "Nama",
      result: compareText(siasn?.nama, simaster?.nama),
    },
    {
      id: "nip",
      siasn: siasn?.nipBaru,
      master: simaster?.nip_baru,
      label: "NIP",
      result: compareText(siasn?.nipBaru, simaster?.nip_baru),
    },
    {
      id: "tanggal_lahir",
      siasn: siasn?.tglLahir,
      master: simaster?.tgl_lahir,
      label: "Tanggal Lahir",
      result: compareText(siasn?.tglLahir, simaster?.tgl_lahir),
    },
    {
      id: "jenis_kelamin",
      siasn: siasn?.jenisKelamin === "F" ? "Perempuan" : "Laki-laki",
      master: simaster?.jk === "P" ? "Perempuan" : "Laki-laki",
      label: "Jenis Kelamin",
      result: compareText(
        siasn?.jenisKelamin === "F" ? "Perempuan" : "Laki-laki",
        simaster?.jk === "P" ? "Perempuan" : "Laki-laki"
      ),
    },
    {
      id: "gelar_depan",
      siasn: siasn?.gelarDepan,
      master: simaster?.gelar_depan,
      label: "Gelar Depan",
      result: komparasiGelar(siasn?.gelarDepan, simaster?.gelar_depan),
    },
    {
      id: "gelar_belakang",
      siasn: siasn?.gelarBelakang,
      master: simaster?.gelar_belakang,
      label: "Gelar Belakang",
      result: komparasiGelar(siasn?.gelarBelakang, simaster?.gelar_belakang),
    },
    {
      id: "email",
      siasn: siasn?.email,
      master: simaster?.email,
      label: "Email",
      result: compareText(siasn?.email, simaster?.email),
    },
    {
      id: "no_hp",
      siasn: siasn?.noHp,
      master: simaster?.no_hp,
      label: "No HP",
      result: compareText(siasn?.noHp, simaster?.no_hp),
    },
    {
      id: "nik",
      siasn: siasn?.nik,
      master: simaster?.nik,
      label: "NIK",
      result: compareText(siasn?.nik, simaster?.nik),
    },
    {
      id: "kk",
      siasn: "",
      master: simaster?.no_kk,
      label: "KK",
      result: compareText("", simaster?.no_kk),
    },
    {
      id: "jabatan",
      siasn: siasn?.jabatanNama,
      master: simaster?.jabatan?.jabatan,
      label: "Jabatan",
      result: "cant compare",
    },
    {
      id: "pendidikan",
      siasn: siasn?.pendidikanTerakhirNama,
      master: `${simaster?.pendidikan?.jenjang} ${simaster?.pendidikan?.prodi}`,
      label: "Pendidikan",
      result: "cant compare",
    },
    {
      id: "pangkat",
      siasn: `${siasn?.pangkatAkhir}-${siasn?.golRuangAkhir}`,
      master: `${simaster?.pangkat?.pangkat}-${simaster?.pangkat?.golongan}`,
      label: "Pangkat",
      result: "cant compare",
    },
    {
      id: "instansi_induk",
      siasn: siasn?.instansiIndukNama,
      master: "",
      label: "Instansi Induk",
      result: "cant compare",
    },
    {
      id: "unit_organisasi",
      siasn: siasn?.unorNama,
      master: "",
      label: "Unit Organisasi",
      result: "cant compare",
    },
  ];
};

const TagResult = ({ record }) => {
  const id = record?.id;
  const cantCompare =
    id === "jabatan" ||
    id === "pendidikan" ||
    id === "pangkat" ||
    id === "instansi_induk" ||
    id === "unit_organisasi";

  if (cantCompare) {
    return (
      <Badge
        color="orange"
        variant="outline"
        size="sm"
        leftSection={
          <Box style={{ display: "flex", alignItems: "center" }}>
            <IconAlertTriangle size={12} />
          </Box>
        }
      >
        Bisa Jadi Sama
      </Badge>
    );
  }

  return (
    <Badge
      color={record?.result ? "green" : "red"}
      variant="outline"
      size="sm"
      leftSection={
        <Box style={{ display: "flex", alignItems: "center" }}>
          {record?.result ? <IconCheck size={12} /> : <IconX size={12} />}
        </Box>
      }
    >
      {record?.result ? "Sama" : "Tidak Sama"}
    </Badge>
  );
};

function CompareDataUtamaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const {
    data: riwayatPengadaan,
    isLoading: isLoadingRiwayatPengadaan,
    refetch: refetchRiwayatPengadaan,
  } = useQuery(
    ["riwayat-pengadaan", nip],
    () => dataRiwayatPengadaanPersonalByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const breakPoint = Grid.useBreakpoint();

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const ComparisonCard = ({ record }) => {
    const renderValue = (value, type) => {
      if (
        record?.id === "nik" ||
        record?.id === "tanggal_lahir" ||
        record?.id === "email" ||
        record?.id === "no_hp" ||
        record?.id === "kk"
      ) {
        return <TextSensor text={value} />;
      }
      return (
        <Text size="xs" c={value ? "dark" : "dimmed"} truncate>
          {value || "-"}
        </Text>
      );
    };

    return (
      <Box
        p="xs"
        style={{
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text size="xs" fw={500} style={{ minWidth: "100px", flexShrink: 0 }}>
            {record?.label}
          </Text>

          <Group spacing="xs" style={{ flex: 1 }} wrap="nowrap">
            <Box style={{ flex: 1 }}>
              <Group spacing={2} mb={2}>
                <IconServer size={10} color="#1c7ed6" />
                <Text size="xs" c="blue" fw={500}>
                  SIASN
                </Text>
              </Group>
              {renderValue(record?.siasn, "siasn")}
            </Box>

            <Divider orientation="vertical" />

            <Box style={{ flex: 1 }}>
              <Group spacing={2} mb={2}>
                <IconDatabase size={10} color="#37b24d" />
                <Text size="xs" c="green" fw={500}>
                  MASTER
                </Text>
              </Group>
              {renderValue(record?.master, "master")}
            </Box>
          </Group>

          <Box style={{ flexShrink: 0 }}>
            <TagResult record={record} />
          </Box>
        </Group>
      </Box>
    );
  };

  return (
    <Container size="xl" p={0}>
      <MantineSkeleton visible={isLoading || isLoadingDataSimaster}>
        <Row gutter={[16, 16]}>
          <Col md={20} xs={24}>
            <Stack spacing="md">
              <Paper p="md" radius="md" withBorder id="komparasi-data">
                <Group spacing="xs" mb="md">
                  <IconFileText size={16} color="gray" />
                  <Text size="sm" fw={500}>
                    Komparasi Data SIMASTER dan MyASN
                  </Text>
                </Group>
                <Stack spacing="md">
                  <Group spacing="xs">
                    <FileSPMT data={data} />
                    <FileSK data={data} />
                  </Group>

                  <Divider label="Data Komparasi" labelPosition="center" />

                  <Box
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {dataTabel(data, dataSimaster).map((record, index) => (
                      <ComparisonCard key={record.id} record={record} />
                    ))}
                  </Box>
                </Stack>
              </Paper>

              <Paper p="md" radius="md" withBorder id="riwayat-pengadaan">
                <Group justify="space-between" mb="md">
                  <Group spacing="xs">
                    <IconFileText size={16} color="gray" />
                    <Text size="sm" fw={500}>
                      Riwayat Pengadaan (2022 ke Atas)
                    </Text>
                  </Group>
                  <Button
                    type="link"
                    icon={<IconRefresh size={14} />}
                    onClick={refetchRiwayatPengadaan}
                    size="small"
                  />
                </Group>
                <RiwayatPengadaan
                  type="fasilitator"
                  loading={isLoadingRiwayatPengadaan}
                  data={riwayatPengadaan}
                />
              </Paper>

              <Paper p="md" radius="md" withBorder>
                <Group spacing="xs" mb="md">
                  <IconFileText size={16} color="gray" />
                  <Text size="sm" fw={500}>
                    Ubah Data SIASN
                  </Text>
                </Group>
                <CompareUbahDataByNip />
              </Paper>

              <Paper p="md" radius="md" withBorder id="status-pegawai">
                <InformationDetail data={data} />
                <CreateCPNS nip={nip} data={data} />
              </Paper>
            </Stack>
          </Col>
          <Col md={4} xs={24}>
            {breakPoint.md && (
              <Anchor
                offsetTop={70}
                items={[
                  {
                    key: "komparasi-data",
                    href: "#komparasi-data",
                    title: "Komparasi Data",
                  },
                  {
                    key: "Informasi MyASN",
                    href: "#status-pegawai",
                    title: "Informasi MyASN",
                    children: [
                      {
                        key: "personal-information",
                        href: "#personal-information",
                        title: "Personal",
                      },
                      {
                        key: "contact-information",
                        href: "#contact-information",
                        title: "Kontak/Ganti Email",
                      },
                      {
                        key: "professional-information",
                        href: "#professional-information",
                        title: "Professional",
                      },
                      {
                        key: "pendidikan",
                        href: "#pendidikan",
                        title: "Pendidikan",
                      },
                      {
                        key: "ASN",
                        href: "#asn",
                        title: "Informasi ASN",
                      },
                      {
                        key: "tambahan-informasi",
                        href: "#tambahan-informasi",
                        title: "Tambahan Informasi",
                      },
                      {
                        key: "dokumen-layanan",
                        href: "#dokumen-layanan",
                        title: "Dokumen Layanan",
                      },
                    ],
                  },
                ]}
              />
            )}
          </Col>
        </Row>
      </MantineSkeleton>
    </Container>
  );
}

export default CompareDataUtamaByNip;
