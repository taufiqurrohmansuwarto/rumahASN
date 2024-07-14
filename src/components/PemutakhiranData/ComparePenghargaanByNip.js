import {
  createPenghargaanByNip,
  hapusPenghargaanByNip,
  penghargaanByNip,
} from "@/services/siasn-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Divider,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import CreatePenghargaan from "./CreatePenghargaan";
import { DeleteOutlined } from "@ant-design/icons";
import UploadDokumen from "./UploadDokumen";

function ComparePenghargaanByNip({ nip }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["riwayat-penghargaan-nip", nip],
    () => penghargaanByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createPenghargaanByNip(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || error?.message);
      },
      onSettled: () =>
        queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]),
    }
  );

  const { mutateAsync: hapus, isLoadsing: isLoadingHapus } = useMutation(
    (data) => hapusPenghargaanByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus penghargaan");
        queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || error?.message);
      },
      onSettled: () =>
        queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]),
    }
  );

  const handleHapus = async (id) => {
    const payload = {
      nip,
      id,
    };
    await hapus(payload);
  };

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[892] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[892]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Nama Penghargaan",
      dataIndex: "hargaNama",
      responsive: ["sm"],
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
      responsive: ["sm"],
    },
    {
      title: "Tanggal SK",
      dataIndex: "skDate",
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => {
        return (
          <Space direction="horizontal">
            <Popconfirm
              title="Apakah anda yakin ingin menghapus penghargaan ini?"
              onConfirm={async () => await handleHapus(text?.ID)}
            >
              <Tooltip title="Hapus">
                <a>
                  <DeleteOutlined />
                </a>
              </Tooltip>
            </Popconfirm>
            <Divider type="vertical" />
            <UploadDokumen
              id={text?.ID}
              idRefDokumen={"892"}
              invalidateQueries={["riwayat-penghargaan-nip", nip]}
              nama="Penghargaan"
            />
          </Space>
        );
      },
    },
  ];

  return (
    <Card title="Penghargaan">
      <Table
        title={() => (
          <CreatePenghargaan
            loading={isLoadingCreate}
            nip={nip}
            onSubmit={create}
          />
        )}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default ComparePenghargaanByNip;
