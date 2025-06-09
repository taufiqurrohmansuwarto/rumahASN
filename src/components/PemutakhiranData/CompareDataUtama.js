import { dataUtamaSimaster } from "@/services/master.services";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import {
  FilePdfOutlined,
  ReloadOutlined,
  DiffOutlined,
  AlertOutlined,
  DownloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Table as TableAntd,
  Tag,
  Typography,
  Flex,
  Alert,
  Tooltip,
  message,
} from "antd";
import TextSensor from "../TextSensor";

const { Title, Text } = Typography;

const LoadingSkeleton = ({ minHeight = "120px" }) => (
  <Card
    style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      border: "1px solid #EDEFF1",
      borderRadius: "4px",
      marginBottom: "8px",
    }}
    bodyStyle={{ padding: 0 }}
  >
    <Flex>
      <div
        style={{
          width: "40px",
          backgroundColor: "#F8F9FA",
          borderRight: "1px solid #EDEFF1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight,
        }}
      >
        <Skeleton.Avatar size={16} />
      </div>
      <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
        <Skeleton.Input style={{ width: "40%" }} active size="small" />
        <Skeleton
          paragraph={{ rows: 2, width: ["100%", "80%"] }}
          active
          title={false}
        />
      </Flex>
    </Flex>
  </Card>
);

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
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handleDownload}
          style={{
            backgroundColor: "#FF4500",
            borderColor: "#FF4500",
            borderRadius: "20px",
            fontWeight: 600,
            height: "32px",
            fontSize: "12px",
          }}
        >
          Unduh SPMT
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
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handleDownload}
          style={{
            backgroundColor: "#FF4500",
            borderColor: "#FF4500",
            borderRadius: "20px",
            fontWeight: 600,
            height: "32px",
            fontSize: "12px",
          }}
        >
          Unduh SK
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

const DetailInformasi = ({ data }) => {
  const detailData = [
    { label: "Tempat Lahir", value: data?.tempatLahir },
    { label: "Email Government", value: data?.emailGov, sensitive: true },
    { label: "Agama", value: data?.agama },
    { label: "Status Perkawinan", value: data?.statusPerkawinan },
    { label: "Alamat", value: data?.alamat },
    { label: "No. HP", value: data?.noHp },
    { label: "No. Telepon", value: data?.noTelp },
    { label: "TMT CPNS", value: data?.tmtCpns },
    { label: "TMT PNS", value: data?.tmtPns },
    { label: "Masa Kerja", value: data?.masaKerja },
    { label: "Pangkat Awal", value: data?.pangkatAwal },
    { label: "Golongan Awal", value: data?.golRuangAwal },
    { label: "Golongan Akhir", value: data?.golRuangAkhir },
    { label: "TMT Golongan Akhir", value: data?.tmtGolAkhir },
    { label: "TMT Jabatan", value: data?.tmtJabatan },
    { label: "Eselon", value: data?.eselon },
    {
      label: "Gaji Pokok",
      value: data?.gajiPokok
        ? `Rp ${parseFloat(data.gajiPokok).toLocaleString("id-ID")}`
        : "",
    },
    { label: "Tahun Lulus", value: data?.tahunLulus },
    { label: "Kartu ASN", value: data?.kartuAsn, sensitive: true },
    { label: "Kelas Jabatan", value: data?.kelas_jabatan },
    { label: "No. NPWP", value: data?.noNpwp, sensitive: true },
    { label: "Tanggal NPWP", value: data?.tglNpwp },
    { label: "No. BPJS", value: data?.bpjs, sensitive: true },
    { label: "No. Taspen", value: data?.noTaspen },
  ];

  return (
    <Card
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "8px",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        {/* Icon Section */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            borderRight: "1px solid #EDEFF1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <UserOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, padding: "12px" }}>
          <Title level={5} style={{ marginBottom: "16px", color: "#1A1A1B" }}>
            👤 Detail Informasi Kepegawaian
          </Title>

          <Row gutter={[16, 8]}>
            {detailData.map(
              (item, index) =>
                item.value && (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <div style={{ marginBottom: "12px" }}>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#787C7E",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#1A1A1B",
                          fontWeight: 500,
                          display: "block",
                        }}
                      >
                        {item.sensitive ? (
                          <TextSensor text={item.value} />
                        ) : (
                          item.value
                        )}
                      </Text>
                    </div>
                  </Col>
                )
            )}
          </Row>
        </div>
      </Flex>
    </Card>
  );
};

function CompareDataUtama() {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: dataSimaster,
    isLoading: isLoadingDataSimaster,
    refetch: refetchSimaster,
    isFetching: isFetchingSimaster,
  } = useQuery(["data-utama-simaster"], () => dataUtamaSimaster(), {
    refetchOnWindowFocus: false,
  });

  const handleRefetch = () => {
    refetch();
    refetchSimaster();
    message.info("Memuat ulang data perbandingan...");
  };

  const columns = [
    {
      title: "Komparasi",
      key: "komparasi",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Row>
            <Col span={24}>
              <Text
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1A1A1B",
                  textDecoration: "underline",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                {record?.label}
              </Text>
              <Text
                style={{ fontSize: "12px", color: "#1A1A1B", display: "block" }}
              >
                SIASN
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#787C7E",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                {record?.siasn}
              </Text>
              <Text
                style={{ fontSize: "12px", color: "#1A1A1B", display: "block" }}
              >
                MASTER
              </Text>
              <Text
                style={{ fontSize: "11px", color: "#787C7E", display: "block" }}
              >
                {record?.master}
              </Text>
              <div style={{ marginTop: "8px" }}>
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

  const isLoadingAny = isLoading || isLoadingDataSimaster;
  const isFetchingAny = isFetching || isFetchingSimaster;

  if (isLoadingAny) {
    return (
      <div
        style={{
          backgroundColor: "#DAE0E6",
          minHeight: "100vh",
          padding: "16px",
        }}
      >
        <LoadingSkeleton minHeight="80px" />
        <LoadingSkeleton minHeight="120px" />
        <LoadingSkeleton minHeight="60px" />
        <LoadingSkeleton minHeight="400px" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
      {/* Header */}
      <Card
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section */}
          <div
            style={{
              width: "40px",
              backgroundColor: "#F8F9FA",
              borderRight: "1px solid #EDEFF1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80px",
            }}
          >
            <DiffOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
          </div>

          {/* Header Content */}
          <div style={{ flex: 1, padding: "12px" }}>
            <Flex justify="space-between" align="center">
              <div>
                <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
                  Perbandingan Data SIASN vs SIMASTER
                </Title>
                <Text style={{ color: "#787C7E", fontSize: "14px" }}>
                  Validasi dan komparasi data kepegawaian dari kedua sistem
                </Text>
              </div>
              <Tooltip title="Muat ulang data perbandingan">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={isFetchingAny}
                  onClick={handleRefetch}
                  style={{
                    color: "#787C7E",
                    border: "1px solid #EDEFF1",
                    borderRadius: "4px",
                  }}
                >
                  {isFetchingAny ? "Memuat..." : "Refresh"}
                </Button>
              </Tooltip>
            </Flex>
          </div>
        </Flex>
      </Card>

      {/* Alert Section */}
      {isFetchingAny ? (
        <LoadingSkeleton minHeight="120px" />
      ) : (
        <Card
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Flex>
            {/* Icon Section */}
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
              }}
            >
              <AlertOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, padding: "12px" }}>
              <Alert
                type="warning"
                showIcon
                message="Perhatian Penting"
                description="Jika ada perbedaan NIP, Nama, dan Tanggal Lahir antara SIASN dan SIMASTER silahkan melakukan perbaikan elemen tersebut ke BKD Provinsi Jawa Timur"
                style={{
                  backgroundColor: "#FFF7E6",
                  border: "1px solid #FFD591",
                  borderRadius: "4px",
                }}
              />
            </div>
          </Flex>
        </Card>
      )}

      {/* Download Section */}
      {isFetchingAny ? (
        <LoadingSkeleton minHeight="60px" />
      ) : (
        <Card
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Flex>
            {/* Icon Section */}
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60px",
              }}
            >
              <DownloadOutlined
                style={{ color: "#FF4500", fontSize: "16px" }}
              />
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, padding: "12px" }}>
              <Flex gap={8}>
                <FileSPMT data={data} />
                <FileSK data={data} />
              </Flex>
            </div>
          </Flex>
        </Card>
      )}

      {/* Table Section */}
      {isFetchingAny ? (
        <LoadingSkeleton minHeight="400px" />
      ) : (
        <Card
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Flex>
            {/* Icon Section */}
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              <DiffOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, padding: "12px" }}>
              <Title
                level={5}
                style={{ marginBottom: "16px", color: "#1A1A1B" }}
              >
                📊 Hasil Perbandingan Data
              </Title>

              <TableAntd
                rowKey={(row) => row?.id}
                columns={columns}
                dataSource={dataTabel(data, dataSimaster)}
                pagination={false}
                style={{
                  backgroundColor: "#FFFFFF",
                }}
                className="reddit-table"
              />
            </div>
          </Flex>
        </Card>
      )}

      {/* Detail Information Section */}
      {isFetchingAny ? (
        <LoadingSkeleton minHeight="400px" />
      ) : (
        <DetailInformasi data={data} />
      )}

      <style jsx global>{`
        .reddit-table .ant-table {
          border: 1px solid #edeff1;
          border-radius: 4px;
        }

        .reddit-table .ant-table-thead > tr > th {
          background-color: #f8f9fa;
          color: #1a1a1b;
          font-weight: 600;
          border-bottom: 1px solid #edeff1;
        }

        .reddit-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #edeff1;
          color: #1a1a1b;
        }

        .reddit-table .ant-table-tbody > tr:hover > td {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

export default CompareDataUtama;
