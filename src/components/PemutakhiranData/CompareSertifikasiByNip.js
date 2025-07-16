import { getRwSertifikasiByNipMaster } from "@/services/master.services";
import { riwayatSertifikasiByNip } from "@/services/siasn-services";
import { ReloadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Divider, Flex, Table, Typography } from "antd";
import CreateSertifikasiSIASN from "./CreateSertifikasiSIASN";
import UploadDokumen from "./UploadDokumen";

const CompareSertifikasiByNip = ({ nip }) => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["sertifikasi", nip],
    queryFn: () => riwayatSertifikasiByNip(nip),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const {
    data: dataMaster,
    isLoading: isLoadingMaster,
    isFetching: isFetchingMaster,
    refetch: refetchMaster,
  } = useQuery({
    queryKey: ["sertifikasi-master", nip],
    queryFn: () => getRwSertifikasiByNipMaster(nip),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const columnsMaster = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.file_kompetensi && (
              <a href={row?.file_kompetensi} target="_blank" rel="noreferrer">
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "Tanggal SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (_, row) => {
        return (
          <>
            {row?.jft?.name} {row?.jft?.jenjang_jab}
          </>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <>
            <CreateSertifikasiSIASN nip={nip} row={row} type="transfer" />
          </>
        );
      },
    },
  ];

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[1680] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1680]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Jenis Sertifikasi",
      dataIndex: "jenisSertifikasiNama",
    },
    {
      title: "Nama Sertifikasi",
      dataIndex: "namaSertifikasi",
    },
    {
      title: "No. Sertifikat",
      dataIndex: "noSertifikat",
    },
    {
      title: "Tgl. Sertifikat",
      dataIndex: "tanggalSertifikat",
    },
    {
      title: "Masa Berlaku Mulai",
      dataIndex: "masaBerlakuSertMulai",
    },
    {
      title: "Masa Berlaku Selesai",
      dataIndex: "masaBerlakuSertSelesai",
    },
    {
      title: "Gelar depan Sertifikat",
      dataIndex: "gelarDepanSert",
    },
    {
      title: "Gelar belakang Sertifikat",
      dataIndex: "gelarBelakangSert",
    },
    {
      title: "Lembaga Sertifikasi",
      dataIndex: "lembagaSertifikasiNama",
    },
    {
      title: "Sumber",
      dataIndex: "sumber",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <>
            <UploadDokumen
              id={row?.id}
              idRefDokumen={"1680"}
              invalidateQueries={["sertifikasi", nip]}
              nama="Sertifikasi"
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <CreateSertifikasiSIASN nip={nip} />
      <Table
        title={() => (
          <Flex justify="space-between" align="center">
            <Typography.Title level={5}>SIASN</Typography.Title>
            <Flex align="flex-end">
              <Button icon={<ReloadOutlined />} onClick={refetch}>
                Refresh
              </Button>
            </Flex>
          </Flex>
        )}
        loading={isLoading || isFetching}
        columns={columns}
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
      <Divider />
      <Table
        title={() => (
          <Flex justify="space-between" align="center">
            <Typography.Title level={5}>SIMASTER</Typography.Title>
            <Flex align="flex-end">
              <Button icon={<ReloadOutlined />} onClick={refetchMaster}>
                Refresh
              </Button>
            </Flex>
          </Flex>
        )}
        loading={isLoadingMaster || isFetchingMaster}
        columns={columnsMaster}
        pagination={false}
        dataSource={dataMaster}
        rowKey={(row) => row?.kompetensi_id}
      />
    </>
  );
};

export default CompareSertifikasiByNip;
