import {
  deleteRwSertifikasiPersonal,
  getRwSertifikasiPersonal,
} from "@/services/siasn-services";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  message,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import CreateSertifikasiPersonal from "./CreateSertifikasiPersonal";
import UploadDokumen from "./UploadDokumen";

const CompareSertifikasi = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["sertifikasi-personal"],
    queryFn: () => getRwSertifikasiPersonal(),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const { mutateAsync: hapusSertifikasi } = useMutation({
    mutationFn: (id) => deleteRwSertifikasiPersonal(id),
    onSuccess: () => {
      message.success("Sertifikasi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
    },
    onError: (error) => {
      message.error(error?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
    },
  });

  const handleHapus = (row) => {
    Modal.confirm({
      title: "Hapus Sertifikasi",
      content: "Apakah anda yakin ingin menghapus sertifikasi ini?",
      onOk: async () => hapusSertifikasi(row?.id),
    });
  };

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
                invalidateQueries={["sertifikasi-personal"]}
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
      <CreateSertifikasiPersonal />
      <Table
        pagination={false}
        title={() => (
          <Flex justify="space-between" align="center">
            <Typography.Title level={5}>Data SIASN</Typography.Title>
            <Flex align="flex-end">
              <Button type="text" icon={<ReloadOutlined />} onClick={refetch}>
                Refresh
              </Button>
            </Flex>
          </Flex>
        )}
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data}
      />
    </>
  );
};

export default CompareSertifikasi;
