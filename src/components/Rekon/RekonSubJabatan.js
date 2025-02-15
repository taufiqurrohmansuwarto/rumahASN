import {
  getSubJabatanSiasn,
  syncSubJabatanSiasn,
} from "@/services/rekon.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Table } from "antd";

const useRekonSubJabatan = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["rekon-sub-jabatan"],
    queryFn: getSubJabatanSiasn,
  });

  return { data, isLoading, error };
};

const useSyncSubJabatan = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading, error } = useMutation(
    () => syncSubJabatanSiasn(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["rekon-sub-jabatan"],
        });
        message.success("Data berhasil disinkronisasi");
      },
      onError: () => {
        message.error("Gagal menyinkronisasi data");
      },
    }
  );

  return { mutate, isLoading, error };
};

const RekonSubJabatan = () => {
  const { data, isLoading, error } = useRekonSubJabatan();
  const {
    mutate,
    isLoading: isSyncLoading,
    error: syncError,
  } = useSyncSubJabatan();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => mutate()}
        loading={isSyncLoading}
        disabled={isSyncLoading}
      >
        Sync
      </Button>
      <Table
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        dataSource={data?.data}
        columns={columns}
      />
    </div>
  );
};

export default RekonSubJabatan;
