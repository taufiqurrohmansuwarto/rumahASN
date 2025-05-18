import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataRiwayatPengadaanPersonalByNip,
  dataUtamSIASNByNip,
} from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import { Stack, Text } from "@mantine/core";
import { FilePdfOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Anchor,
  Button,
  Card,
  Col,
  Grid,
  Row,
  Skeleton,
  Space,
  Table as TableAntd,
  Tag,
} from "antd";
import InformationDetail from "../InformationDetail";
import TextSensor from "@/components/TextSensor";
import CreateCPNS from "./CreateCPNS";
import RiwayatPengadaan from "../RiwayatPengadaan";

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
        <Button type="link" icon={<FilePdfOutlined />} onClick={handleDownload}>
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
        <Button type="link" icon={<FilePdfOutlined />} onClick={handleDownload}>
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
    return <Tag color="orange">Bisa Jadi Sama</Tag>;
  }

  return (
    <Tag color={record?.result ? "green" : "red"}>
      {record?.result ? "Sama" : "Tidak Sama"}
    </Tag>
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

  const columns = [
    {
      title: "Komparasi",
      key: "komparasi",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Row>
            <Col span={24}>
              <Text fz="md" mb={8} fw="bold" td="underline">
                {record?.label}
              </Text>
              <Text fz="sm">SIASN</Text>
              <Text fz="xs" mb={4} c="dimmed">
                {record?.siasn}
              </Text>
              <Text fz="sm">MASTER</Text>
              <Text fz="xs" c="dimmed">
                {record?.master}
              </Text>
              <div
                style={{
                  marginTop: 8,
                }}
              >
                <TagResult record={record} />
              </div>
            </Col>
          </Row>
        );
      },
    },
    {
      title: "Jenis Data",
      dataIndex: "label",
      responsive: ["sm"],
    },
    {
      title: "SIASN",
      key: "siasn",
      render: (_, row) => {
        if (
          row?.id === "nik" ||
          row?.id === "tanggal_lahir" ||
          row?.id === "email" ||
          row?.id === "no_hp" ||
          row?.id === "kk"
        ) {
          return <TextSensor text={row?.siasn} />;
        } else {
          return <div>{row?.siasn}</div>;
        }
      },
      responsive: ["sm"],
    },
    {
      title: "SIMASTER",
      key: "master",
      render: (_, row) => {
        if (
          row?.id === "nik" ||
          row?.id === "tanggal_lahir" ||
          row?.id === "email" ||
          row?.id === "no_hp" ||
          row?.id === "kk"
        ) {
          return <TextSensor text={row?.master} />;
        } else {
          return <div>{row?.master}</div>;
        }
      },
      responsive: ["sm"],
    },
    {
      title: "Hasil",
      key: "result",
      responsive: ["sm"],
      render: (_, record) => <TagResult record={record} />,
    },
  ];

  return (
    <div>
      <Skeleton loading={isLoading || isLoadingDataSimaster}>
        <Row gutter={[16, 16]}>
          <Col md={20} xs={24}>
            <Row gutter={[16, 16]}>
              <Col md={24} xs={24}>
                <Card
                  title="Komparasi Data SIMASTER dan MyASN"
                  id="komparasi-data"
                >
                  <Stack>
                    <Space>
                      <FileSPMT data={data} />
                      <FileSK data={data} />
                    </Space>
                    <TableAntd
                      columns={columns}
                      dataSource={dataTabel(data, dataSimaster)}
                      pagination={false}
                    />
                  </Stack>
                </Card>
              </Col>
              <Col md={24} xs={24}>
                <Card
                  extra={
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={refetchRiwayatPengadaan}
                    />
                  }
                  title="Riwayat Pengadaan (khusus TMT 2022 ke atas)"
                  id="riwayat-pengadaan"
                >
                  <RiwayatPengadaan
                    type="fasilitator"
                    loading={isLoadingRiwayatPengadaan}
                    data={riwayatPengadaan}
                  />
                </Card>
              </Col>
              <Col md={24} xs={24}>
                <Card id="status-pegawai">
                  <InformationDetail data={data} />
                  <CreateCPNS nip={nip} data={data} />
                </Card>
              </Col>
            </Row>
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
      </Skeleton>
    </div>
  );
}

export default CompareDataUtamaByNip;
