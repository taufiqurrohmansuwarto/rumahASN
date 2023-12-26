import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip } from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import { Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Row,
  Skeleton,
  Table as TableAntd,
  Tag,
  Tooltip,
} from "antd";

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
      id: "nik",
      siasn: siasn?.nik,
      master: simaster?.nik,
      label: "NIK",
      result: compareText(siasn?.nik, simaster?.nik),
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
  const { data, isLoading } = useQuery(["data-utama-siasn", nip], () =>
    dataUtamSIASNByNip(nip)
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip)
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
      dataIndex: "siasn",
      responsive: ["sm"],
    },
    {
      title: "SIMASTER",
      dataIndex: "master",
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
      <Stack>
        <Skeleton loading={isLoading || isLoadingDataSimaster}>
          <Row>
            <Col md={24}>
              <Card title="Komparasi Data Utama">
                <Tooltip title="Status Pegawai SIASN">
                  <Tag
                    style={{
                      marginBottom: 8,
                    }}
                    color="yellow"
                  >
                    {data?.kedudukanPnsNama}
                  </Tag>
                </Tooltip>
                <TableAntd
                  columns={columns}
                  dataSource={dataTabel(data, dataSimaster)}
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </Skeleton>
      </Stack>
    </div>
  );
}

export default CompareDataUtamaByNip;
