import {
  createPenghargaanByNip,
  hapusPenghargaanByNip,
  penghargaanByNip,
} from "@/services/siasn-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Table, message } from "antd";
import CreatePenghargaan from "./CreatePenghargaan";

function ComparePenghargaanByNip({ nip }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["riwayat-penghargaan", nip],
    () => penghargaanByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createPenghargaanByNip(data),
    {
      onSuccess: () => message.success("Berhasil menambahkan penghargaan"),
      onSettled: () =>
        queryClient.invalidateQueries(["riwayat-penghargaan", nip]),
    }
  );

  const { mutate: hapus, isLoadsing: isLoadingHapus } = useMutation(
    (data) => hapusPenghargaanByNip(data),
    {
      onSuccess: () => message.success("Berhasil menghapus penghargaan"),
      onSettled: () =>
        queryClient.invalidateQueries(["riwayat-penghargaan", nip]),
    }
  );

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
    },
    {
      title: "Nama Penghargaan",
      dataIndex: "hargaNama",
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skDate",
    },
  ];

  return (
    <Card title="Penghargaan">
      <Table
        title={() => <CreatePenghargaan />}
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
