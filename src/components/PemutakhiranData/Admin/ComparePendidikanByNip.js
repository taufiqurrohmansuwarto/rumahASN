import HapusUsulanPendidikan from "@/components/Admin/UsulanSIASN/HapusUsulanPendidikan";
import UbahUsulanPendidikan from "@/components/Admin/UsulanSIASN/UbahUsulanPendidikan";
import { createUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { rwPendidikanMasterByNip } from "@/services/master.services";
import { dataPendidikanByNip } from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Text as MantineText,
  Stack,
} from "@mantine/core";
import { IconBook, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  message,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const CompareDataPendidikanSIMASTER = ({ nip }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, refetch } = useQuery(
    ["riwayat-pendidikan-simaster-by-nip", nip],
    () => rwPendidikanMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const getAkreditasiColor = (akreditasi) => {
    switch (akreditasi?.toUpperCase()) {
      case "A":
        return "green";
      case "B":
        return "blue";
      case "C":
        return "orange";
      default:
        return "default";
    }
  };

  const getIPKColor = (ipk) => {
    if (ipk >= 3.5) return "green";
    if (ipk >= 3.0) return "blue";
    if (ipk >= 2.5) return "orange";
    return "red";
  };

  const columns = [
    {
      title: "Pendidikan",
      dataIndex: "jenjang",
      key: "jenjang",
      width: isMobile ? 100 : 150,
      render: (jenjang) => (
          <MantineText size="sm" fw={500}>
            {jenjang}
          </MantineText>
      ),
    },
    {
      title: "Sekolah",
      dataIndex: "nama_sekolah",
      key: "nama_sekolah",
      width: isMobile ? 180 : 250,
      render: (nama_sekolah, record) => (
        <div>
          <Tooltip title={nama_sekolah}>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {nama_sekolah}
            </MantineText>
          </Tooltip>
          {record?.fakultas && (
            <MantineText size="xs" c="dimmed">
              {record.fakultas}
            </MantineText>
          )}
          {record?.prodi && (
            <MantineText size="xs" c="blue">
              {record.prodi}
            </MantineText>
          )}
        </div>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: "Prestasi",
            key: "prestasi",
            width: 120,
            render: (_, record) => (
              <div>
                {record?.ipk && (
                  <MantineBadge size="sm" color={getIPKColor(record.ipk)}>
                    IPK: {record.ipk}
                  </MantineBadge>
                )}
                {record?.akreditasi && (
                  <MantineBadge
                    size="sm"
                    color={getAkreditasiColor(record.akreditasi)}
                    style={{ marginTop: 4 }}
                  >
                    {record.akreditasi}
                  </MantineBadge>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      title: "Tahun",
      dataIndex: "tahun_lulus",
      key: "tahun_lulus",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (tahun_lulus, record) => (
        <div style={{ textAlign: "center" }}>
          <MantineBadge size="sm" color="green">
            {tahun_lulus}
          </MantineBadge>
          {record?.tgl_ijazah && !isMobile && (
            <MantineText size="xs" c="dimmed" style={{ marginTop: 4 }}>
              {dayjs(record.tgl_ijazah).format("DD/MM/YYYY")}
            </MantineText>
          )}
        </div>
      ),
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: isMobile ? 100 : 140,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record?.file_ijazah_url && (
            <a href={record.file_ijazah_url} target="_blank" rel="noreferrer">
              <Button size="small" type="link">
                Ijazah
              </Button>
            </a>
          )}
          {record?.file_nilai_url && (
            <a href={record.file_nilai_url} target="_blank" rel="noreferrer">
              <Button size="small" type="link">
                Transkrip
              </Button>
            </a>
          )}
        </Space>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: "No. Ijazah",
            dataIndex: "no_ijazah",
            key: "no_ijazah",
            width: 150,
            render: (no_ijazah) => (
              <Tooltip title={no_ijazah}>
                <MantineText size="xs" c="dimmed" lineClamp={1}>
                  {no_ijazah}
                </MantineText>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      title={null}
      columns={columns}
      dataSource={data}
      loading={isLoading}
      pagination={false}
      scroll={{ x: isMobile ? 600 : 800 }}
      size={isMobile ? "small" : "middle"}
      rowClassName={(record, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark"
      }
    />
  );
};

const ComparePendidikanByNip = ({ nip }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const router = useRouter();

  const { data, isLoading, refetch, isFetching } = useQuery(
    ["riwayat-pendidikan-by-nip", nip],
    () => dataPendidikanByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: session } = useSession();

  const { mutate: createUsulan, isLoading: isCreatingUsulan } = useMutation(
    (data) => createUsulanPeremajaanPendidikan(data),
    {
      onSuccess: () => {
        message.success("sukses");
      },
    }
  );

  const handleCreatUsulan = (row) => {
    const payload = {
      nip: router?.query?.nip,
      usulan_pendidikan_id: row?.id,
    };
    createUsulan(payload);
  };

  const columns = [
    {
      title: "Pendidikan",
      dataIndex: "pendidikanNama",
      key: "pendidikanNama",
      width: isMobile ? 120 : 180,
      render: (pendidikanNama, record) => (
        <div>
          <Tooltip title={pendidikanNama}>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {pendidikanNama}
            </MantineText>
          </Tooltip>
          <MantineText size="xs" c="dimmed">
            {record?.tkPendidikanNama} ({record?.tkPendidikanId})
          </MantineText>
        </div>
      ),
    },
    {
      title: "Sekolah",
      dataIndex: "namaSekolah",
      key: "namaSekolah",
      width: isMobile ? 150 : 220,
      render: (namaSekolah, record) => (
        <div>
          <Tooltip title={namaSekolah}>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {namaSekolah}
            </MantineText>
          </Tooltip>
          <Space size="small">
            {record?.gelarDepan && (
              <MantineBadge size="sm" color="orange" tt="none">
                {record.gelarDepan}
              </MantineBadge>
            )}
            {record?.gelarBelakang && (
              <MantineBadge size="sm" color="orange" tt="none">
                {record.gelarBelakang}
              </MantineBadge>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Tahun",
      dataIndex: "tahunLulus",
      key: "tahunLulus",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (tahunLulus, record) => (
        <div style={{ textAlign: "center" }}>
          <MantineBadge size="sm" color="green">
            {tahunLulus}
          </MantineBadge>
          {record?.tglLulus && !isMobile && (
            <MantineText size="xs" c="dimmed" style={{ marginTop: 4 }}>
              {record.tglLulus}
            </MantineText>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (_, record) => {
        const isPertama = record?.isPendidikanPertama === "1";
        return (
          <MantineBadge size="sm" color={isPertama ? "green" : "blue"}>
            {isPertama ? "Pertama" : "Lanjutan"}
          </MantineBadge>
        );
      },
    },
    {
      title: "Dokumen",
      key: "dokumen",
      width: isMobile ? 100 : 140,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record?.path?.[1173] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[1173].dok_uri}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="small" type="link">
                Ijazah
              </Button>
            </a>
          )}
          {record?.path?.[1174] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[1174].dok_uri}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="small" type="link">
                Transkrip
              </Button>
            </a>
          )}
          {record?.path?.[867] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[867].dok_uri}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="small" type="link">
                SK Gelar
              </Button>
            </a>
          )}
        </Space>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: "No. Ijazah",
            dataIndex: "nomorIjasah",
            key: "nomorIjasah",
            width: 150,
            render: (nomorIjasah) => (
              <Tooltip title={nomorIjasah}>
                <MantineText size="xs" c="dimmed" lineClamp={1}>
                  {nomorIjasah}
                </MantineText>
              </Tooltip>
            ),
          },
        ]
      : []),
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      render: (_, row) => {
        return (
          <>
            {session?.user?.current_role === "admin" && (
              <Space direction="horizontal">
                <UbahUsulanPendidikan row={row} />
                <HapusUsulanPendidikan row={row} />
              </Space>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Card>
        {/* Header Section */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <IconBook size={20} color="#FF4500" />
            <Title level={4} style={{ margin: 0 }}>
              Komparasi Pendidikan
            </Title>
          </Space>
          <MantineText size="xs" c="dimmed">
            Perbandingan data pendidikan SIASN dan SIMASTER
          </MantineText>
        </div>

        {/* Content Section */}
        <div>
          <Stack>
            <Flex justify="space-between" align="center">
              <Space>
                <MantineText fw={600} size="sm">
                  SIASN
                </MantineText>
                <MantineBadge size="sm" variant="light" color="orange">
                  {data?.length || 0}
                </MantineBadge>
              </Space>
              <Button
                size="small"
                icon={<IconRefresh size={16} />}
                onClick={() => refetch()}
                loading={isLoading || isFetching}
              >
                Refresh
              </Button>
            </Flex>

            <Table
              title={null}
              pagination={false}
              columns={columns}
              dataSource={data}
              loading={isLoading || isFetching}
              rowKey={(row) => row?.id}
              scroll={{ x: isMobile ? 600 : 800 }}
              size={isMobile ? "small" : "middle"}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
              }
            />

            <Divider />

            <Space>
              <MantineText fw={600} size="sm">
                SIMASTER
              </MantineText>
              <MantineText size="xs" c="dimmed">
                Data master pendidikan
              </MantineText>
            </Space>

            <CompareDataPendidikanSIMASTER nip={nip} />
          </Stack>
        </div>
      </Card>
    </div>
  );
};

export default ComparePendidikanByNip;
