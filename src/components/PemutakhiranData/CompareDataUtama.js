import { dataUtamaSimaster } from "@/services/master.services";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import { FilePdfOutlined } from "@ant-design/icons";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Table as TableAntd,
  Tag,
} from "antd";
import TextSensor from "../TextSensor";

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

function CompareDataUtama() {
  const { data, isLoading } = useQuery(["data-utama-siasn"], () =>
    dataUtamaSIASN()
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster"],
    () => dataUtamaSimaster()
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
          row?.id === "email"
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
          row?.id === "email"
        ) {
          return <TextSensor text={row?.siasn} />;
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
    <Card>
      <Stack>
        <Skeleton loading={isLoading || isLoadingDataSimaster}>
          <Alert icon={<IconAlertCircle />} title="Perhatian" color="red">
            Jika ada perbedaan NIP, Nama, dan Tanggal Lahir antara SIASN dan
            SIMASTER silahkan melakukan perbaikan elemen tersebut ke BKD
            Provinsi Jawa Timur
          </Alert>
          <Space>
            <FileSPMT data={data} />
            <FileSK data={data} />
          </Space>
          <TableAntd
            rowKey={(row) => row?.id}
            columns={columns}
            dataSource={dataTabel(data, dataSimaster)}
            pagination={false}
          />
        </Skeleton>
      </Stack>
    </Card>
  );
}

export default CompareDataUtama;
