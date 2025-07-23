import HapusUsulanPendidikan from "@/components/Admin/UsulanSIASN/HapusUsulanPendidikan";
import UbahUsulanPendidikan from "@/components/Admin/UsulanSIASN/UbahUsulanPendidikan";
import { createUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { rwPendidikanMasterByNip } from "@/services/master.services";
import { dataPendidikanByNip } from "@/services/siasn-services";
import {
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  ReloadOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Grid,
  message,
  Space,
  Table,
  Tag,
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
      title: (
        <Space>
          <BookOutlined />
          <Text strong>Pendidikan</Text>
        </Space>
      ),
      dataIndex: "jenjang",
      key: "jenjang",
      width: isMobile ? 100 : 150,
      render: (jenjang, record) => (
        <Flex align="center" gap={8}>
          <Avatar
            size={isMobile ? 28 : 32}
            style={{ backgroundColor: "#1890ff" }}
            icon={<BookOutlined />}
          />
          <Flex vertical gap={2}>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {jenjang}
            </Text>
            <Text
              style={{
                fontSize: isMobile ? "9px" : "11px",
                color: "#666",
              }}
            >
              Kode: {record?.kode_jenjang}
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <BankOutlined />
          <Text strong>Sekolah</Text>
        </Space>
      ),
      dataIndex: "nama_sekolah",
      key: "nama_sekolah",
      width: isMobile ? 180 : 250,
      render: (nama_sekolah, record) => (
        <Flex vertical gap={2}>
          <Tooltip title={nama_sekolah}>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                color: "#1a1a1a",
              }}
              ellipsis
            >
              {nama_sekolah}
            </Text>
          </Tooltip>
          {record?.fakultas && (
            <Text
              style={{
                fontSize: isMobile ? "9px" : "11px",
                color: "#666",
              }}
            >
              {record.fakultas}
            </Text>
          )}
          {record?.prodi && (
            <Tag
              color="blue"
              style={{
                fontSize: isMobile ? "9px" : "10px",
                marginTop: 2,
              }}
            >
              {record.prodi}
            </Tag>
          )}
        </Flex>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: (
              <Space>
                <TrophyOutlined />
                <Text strong>Prestasi</Text>
              </Space>
            ),
            key: "prestasi",
            width: 120,
            render: (_, record) => (
              <Flex vertical gap={4}>
                {record?.ipk && (
                  <Tag color={getIPKColor(record.ipk)}>IPK: {record.ipk}</Tag>
                )}
                {record?.akreditasi && (
                  <Tag color={getAkreditasiColor(record.akreditasi)}>
                    Akreditasi: {record.akreditasi}
                  </Tag>
                )}
              </Flex>
            ),
          },
        ]
      : []),
    {
      title: (
        <Space>
          <CalendarOutlined />
          <Text strong>Tahun</Text>
        </Space>
      ),
      dataIndex: "tahun_lulus",
      key: "tahun_lulus",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (tahun_lulus, record) => (
        <Flex vertical gap={2} align="center">
          <Tag color="green" style={{ fontSize: isMobile ? "9px" : "11px" }}>
            {tahun_lulus}
          </Tag>
          {record?.tgl_ijazah && !isMobile && (
            <Text
              style={{
                fontSize: "9px",
                color: "#999",
              }}
            >
              {dayjs(record.tgl_ijazah).format("DD/MM/YYYY")}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          <Text strong>Dokumen</Text>
        </Space>
      ),
      key: "dokumen",
      width: isMobile ? 100 : 140,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record?.file_ijazah_url && (
            <a
              href={record.file_ijazah_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "10px" : "12px",
                color: "#1890ff",
              }}
            >
              <FileTextOutlined />
              {isMobile ? "Ijazah" : "Ijazah"}
            </a>
          )}
          {record?.file_nilai_url && (
            <a
              href={record.file_nilai_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "10px" : "12px",
                color: "#52c41a",
              }}
            >
              <DownloadOutlined />
              {isMobile ? "Nilai" : "Transkrip"}
            </a>
          )}
        </Space>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: (
              <Space>
                <IdcardOutlined />
                <Text strong>No. Ijazah</Text>
              </Space>
            ),
            dataIndex: "no_ijazah",
            key: "no_ijazah",
            width: 150,
            render: (no_ijazah) => (
              <Tooltip title={no_ijazah}>
                <Text
                  code
                  style={{
                    fontSize: "11px",
                    backgroundColor: "#f5f5f5",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {no_ijazah}
                </Text>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  const expandedRowRender = (record) => {
    return (
      <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
        <Descriptions.Item
          label={
            <Space>
              <BookOutlined /> Jenjang
            </Space>
          }
        >
          <Tag color="blue">
            {record?.jenjang} (Kode: {record?.kode_jenjang})
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BankOutlined /> Nama Sekolah
            </Space>
          }
        >
          <Text strong>{record?.nama_sekolah}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BookOutlined /> Program Studi
            </Space>
          }
        >
          <Text>{record?.prodi}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BankOutlined /> Fakultas
            </Space>
          }
        >
          <Text>{record?.fakultas}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <TrophyOutlined /> Akreditasi
            </Space>
          }
        >
          <Tag color={getAkreditasiColor(record?.akreditasi)}>
            {record?.akreditasi}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <TrophyOutlined /> IPK
            </Space>
          }
        >
          <Tag color={getIPKColor(record?.ipk)}>{record?.ipk}</Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Tahun Lulus
            </Space>
          }
        >
          <Tag color="green">{record?.tahun_lulus}</Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Tanggal Ijazah
            </Space>
          }
        >
          <Text>
            {record?.tgl_ijazah
              ? dayjs(record.tgl_ijazah).format("DD MMMM YYYY")
              : "-"}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <IdcardOutlined /> No. Ijazah
            </Space>
          }
        >
          <Text code>{record?.no_ijazah}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CheckCircleOutlined /> Status
            </Space>
          }
        >
          <Badge
            status={record?.aktif === "Y" ? "success" : "error"}
            text={record?.aktif === "Y" ? "Aktif" : "Tidak Aktif"}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Terakhir Edit
            </Space>
          }
        >
          <Text type="secondary">
            {record?.tgl_edit
              ? dayjs(record.tgl_edit).format("DD MMMM YYYY")
              : "-"}
            {record?.jam_edit && ` ${record.jam_edit}`}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <GlobalOutlined /> ID
            </Space>
          }
        >
          <Text code>#{record?.id}</Text>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <Table
      title={() => (
        <Space>
          <Avatar
            size={24}
            style={{ backgroundColor: "#52c41a" }}
            icon={<BookOutlined />}
          />
          <Title level={5} style={{ margin: 0 }}>
            SIMASTER
          </Title>
          <Badge
            count={data?.length || 0}
            style={{ backgroundColor: "#52c41a" }}
          />
        </Space>
      )}
      columns={columns}
      dataSource={data}
      loading={isLoading}
      pagination={false}
      scroll={{ x: isMobile ? 600 : 800 }}
      size={isMobile ? "small" : "middle"}
      rowClassName={(record, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark"
      }
      expandable={{
        expandedRowRender,
        rowExpandable: () => true,
      }}
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
      title: (
        <Space>
          <BookOutlined />
          <Text strong>Pendidikan</Text>
        </Space>
      ),
      dataIndex: "pendidikanNama",
      key: "pendidikanNama",
      width: isMobile ? 120 : 180,
      render: (pendidikanNama, record) => (
        <Flex align="center" gap={8}>
          <Avatar
            size={isMobile ? 28 : 32}
            style={{ backgroundColor: "#ff4500" }}
            icon={<BookOutlined />}
          />
          <Flex vertical gap={2}>
            <Tooltip title={pendidikanNama}>
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "13px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
                ellipsis
              >
                {pendidikanNama}
              </Text>
            </Tooltip>
            <Text
              style={{
                fontSize: isMobile ? "9px" : "11px",
                color: "#666",
              }}
            >
              {record?.tkPendidikanNama} ({record?.tkPendidikanId})
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <BankOutlined />
          <Text strong>Sekolah</Text>
        </Space>
      ),
      dataIndex: "namaSekolah",
      key: "namaSekolah",
      width: isMobile ? 150 : 220,
      render: (namaSekolah, record) => (
        <Flex vertical gap={2}>
          <Tooltip title={namaSekolah}>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                color: "#1a1a1a",
              }}
              ellipsis
            >
              {namaSekolah}
            </Text>
          </Tooltip>
          <Space>
            {record?.gelarBelakang && (
              <Tag
                color="orange"
                style={{
                  fontSize: isMobile ? "9px" : "10px",
                }}
              >
                {record.gelarBelakang}
              </Tag>
            )}
            {record?.gelarDepan && (
              <Tag
                color="orange"
                style={{ fontSize: isMobile ? "9px" : "10px" }}
              >
                {record?.gelarDepan}
              </Tag>
            )}
          </Space>
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          <Text strong>Tahun</Text>
        </Space>
      ),
      dataIndex: "tahunLulus",
      key: "tahunLulus",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (tahunLulus, record) => (
        <Flex vertical gap={2} align="center">
          <Tag color="green" style={{ fontSize: isMobile ? "9px" : "11px" }}>
            {tahunLulus}
          </Tag>
          {record?.tglLulus && !isMobile && (
            <Text
              style={{
                fontSize: "9px",
                color: "#999",
              }}
            >
              {record.tglLulus}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined />
          <Text strong>Status</Text>
        </Space>
      ),
      key: "status",
      width: isMobile ? 80 : 100,
      align: "center",
      render: (_, record) => {
        const isPertama = record?.isPendidikanPertama === "1";
        return (
          <Tag
            color={isPertama ? "green" : "blue"}
            style={{
              fontSize: isMobile ? "9px" : "11px",
              borderRadius: "12px",
              padding: "2px 8px",
            }}
          >
            {isPertama ? "Pertama" : "Lanjutan"}
          </Tag>
        );
      },
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          <Text strong>Dokumen</Text>
        </Space>
      ),
      key: "dokumen",
      width: isMobile ? 100 : 140,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record?.path?.[1173] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[1173].dok_uri}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "10px" : "12px",
                color: "#1890ff",
              }}
            >
              <FileTextOutlined />
              {isMobile ? "Ijazah" : "Ijazah"}
            </a>
          )}
          {record?.path?.[1174] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[1174].dok_uri}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "10px" : "12px",
                color: "#52c41a",
              }}
            >
              <DownloadOutlined />
              {isMobile ? "Nilai" : "Transkrip"}
            </a>
          )}
          {record?.path?.[867] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record.path[867].dok_uri}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: isMobile ? "10px" : "12px",
                color: "#ff4500",
              }}
            >
              <TrophyOutlined />
              {isMobile ? "SK" : "SK Gelar"}
            </a>
          )}
        </Space>
      ),
    },
    ...(!isMobile
      ? [
          {
            title: (
              <Space>
                <IdcardOutlined />
                <Text strong>No. Ijazah</Text>
              </Space>
            ),
            dataIndex: "nomorIjasah",
            key: "nomorIjasah",
            width: 150,
            render: (nomorIjasah) => (
              <Tooltip title={nomorIjasah}>
                <Text
                  code
                  style={{
                    fontSize: "11px",
                    backgroundColor: "#f5f5f5",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {nomorIjasah}
                </Text>
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

  const expandedRowRender = (record) => {
    return (
      <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
        <Descriptions.Item
          label={
            <Space>
              <UserOutlined /> NIP Baru
            </Space>
          }
        >
          <Text code copyable>
            {record?.nipBaru}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <UserOutlined /> NIP Lama
            </Space>
          }
        >
          <Text code>{record?.nipLama || "-"}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BookOutlined /> Tingkat Pendidikan
            </Space>
          }
        >
          <Tag color="blue">
            {record?.tkPendidikanNama} ({record?.tkPendidikanId})
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BookOutlined /> Nama Pendidikan
            </Space>
          }
        >
          <Text strong>{record?.pendidikanNama}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <BankOutlined /> Nama Sekolah
            </Space>
          }
        >
          <Text strong>{record?.namaSekolah}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <IdcardOutlined /> Nomor Ijazah
            </Space>
          }
        >
          <Text code copyable>
            {record?.nomorIjasah}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Tahun Lulus
            </Space>
          }
        >
          <Tag color="green">{record?.tahunLulus}</Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Tanggal Lulus
            </Space>
          }
        >
          <Text>{record?.tglLulus}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CheckCircleOutlined /> Status Pendidikan
            </Space>
          }
        >
          <Badge
            status={record?.isPendidikanPertama === "1" ? "success" : "default"}
            text={
              record?.isPendidikanPertama === "1"
                ? "Pendidikan Pertama"
                : "Pendidikan Lanjutan"
            }
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <TrophyOutlined /> Gelar Depan
            </Space>
          }
        >
          <Text>{record?.gelarDepan || ""}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <TrophyOutlined /> Gelar Belakang
            </Space>
          }
        >
          <Text strong>{record?.gelarBelakang || "-"}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <TrophyOutlined /> Gelar Lengkap
            </Space>
          }
        >
          <Text strong>
            {record?.gelarDepan ? `${record.gelarDepan} ` : ""}
            {record?.gelarBelakang ? record.gelarBelakang : ""}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <GlobalOutlined /> ID Pendidikan
            </Space>
          }
        >
          <Text code>{record?.pendidikanId}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <GlobalOutlined /> ID PNS
            </Space>
          }
        >
          <Text code>{record?.idPns}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <GlobalOutlined /> ID Record
            </Space>
          }
        >
          <Text code>{record?.id}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Created At
            </Space>
          }
        >
          <Text type="secondary">{record?.createdAt || ""}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <CalendarOutlined /> Updated At
            </Space>
          }
        >
          <Text type="secondary">{record?.updatedAt || ""}</Text>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <div
              style={{
                width: isMobile ? "32px" : "40px",
                height: isMobile ? "32px" : "40px",
                backgroundColor: "#FF4500",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              />
            </div>
            <Title
              level={isMobile ? 5 : 4}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              📚 Komparasi Pendidikan
            </Title>
          </Space>
        }
        style={{
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Stack>
          <Table
            title={() => (
              <Flex justify="space-between" align="center">
                <Space>
                  <Avatar
                    size={24}
                    style={{ backgroundColor: "#ff4500" }}
                    icon={<BookOutlined />}
                  />
                  <Title level={5} style={{ margin: 0 }}>
                    SIASN
                  </Title>
                  <Badge
                    count={data?.length || 0}
                    style={{ backgroundColor: "#ff4500" }}
                  />
                </Space>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                >
                  Refresh
                </Button>
              </Flex>
            )}
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
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
            }}
          />
          <Divider />
          <CompareDataPendidikanSIMASTER nip={nip} />
        </Stack>
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "8px 6px" : "12px 8px"} !important;
          font-size: ${isMobile ? "11px" : "13px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "6px 4px" : "8px 6px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-expand-icon-col {
          width: 30px !important;
        }

        .ant-table-row-expand-icon {
          color: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-table-row-expand-icon:hover {
          background-color: #fff7e6 !important;
        }

        .ant-descriptions-item-label {
          font-weight: 600 !important;
          color: #1a1a1a !important;
        }

        .ant-descriptions-bordered .ant-descriptions-item-label {
          background-color: #f8f9fa !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 4px 12px rgba(255, 69, 0, 0.1) !important;
        }

        .ant-badge-count {
          border-radius: 10px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          line-height: 18px !important;
        }

        @media (max-width: 768px) {
          .ant-table-container {
            font-size: 11px !important;
          }

          .ant-descriptions-item-content {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ComparePendidikanByNip;
