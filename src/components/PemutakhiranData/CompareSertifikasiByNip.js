import { getRwSertifikasiByNipMaster } from "@/services/master.services";
import {
  deleteSertifikasiByNip,
  riwayatSertifikasiByNip,
} from "@/services/siasn-services";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Modal,
  Button,
  Divider,
  Flex,
  message,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import CreateSertifikasiSIASN from "./CreateSertifikasiSIASN";
import UploadDokumen from "./UploadDokumen";

const CompareSertifikasiByNip = ({ nip }) => {
  const queryClient = useQueryClient();
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

  const {
    mutateAsync: hapusSertifikasi,
    isLoading: isLoadingHapusSertifikasi,
  } = useMutation((data) => deleteSertifikasiByNip(data), {
    onSuccess: () => {
      message.success("Sertifikasi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["sertifikasi", nip],
      });
    },
  });

  const handleHapus = (row) => {
    Modal.confirm({
      title: "Hapus Sertifikasi",
      content: "Apakah anda yakin ingin menghapus sertifikasi ini?",
      onOk: async () => await hapusSertifikasi({ nip, id: row?.id }),
    });
  };

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
          <Space>
            {row?.path?.[1683] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1683]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
            {row?.path?.[1680] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1680]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </Space>
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
          <Space>
            <Tooltip title="Hapus Sertifikasi">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => handleHapus(row)}
              />
            </Tooltip>
            <Tooltip title="Sisipkan Dokumen">
              <UploadDokumen
                id={row?.id}
                idRefDokumen={"1683"}
                invalidateQueries={["sertifikasi", nip]}
                nama="Sertifikasi"
              />
            </Tooltip>
          </Space>
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
            <Typography.Title level={5}>SIMASTER</Typography.Title>
            <Flex align="flex-end">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={refetchMaster}
              >
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
      <Divider />
      <Table
        title={() => (
          <Flex justify="space-between" align="center">
            <Typography.Title level={5}>SIASN</Typography.Title>
            <Flex align="flex-end">
              <Button type="text" icon={<ReloadOutlined />} onClick={refetch}>
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
    </>
  );
};

export default CompareSertifikasiByNip;
