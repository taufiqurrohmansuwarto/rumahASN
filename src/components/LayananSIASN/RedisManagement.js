import {
  deleteRedisKeyById,
  getAllRedisKeys,
  deleteAllRedisKeys,
} from "@/services/redis.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, message, Popconfirm, Table } from "antd";

const useDeleteAllRedisKeys = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => deleteAllRedisKeys(), {
    onSuccess: () => {
      message.success("Data berhasil dihapus");
      queryClient.invalidateQueries(["redis"]);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["redis"]);
    },
  });
  return { mutate, isLoading };
};

function RedisManagement() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery(
    ["redis"],
    () => getAllRedisKeys(),
    {}
  );

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    (key) => deleteRedisKeyById(key),
    {
      onSuccess: () => {
        message.success("Data berhasil dihapus");
        queryClient.invalidateQueries(["redis"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["redis"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleDelete = async (key) => {
    await mutateAsync(key);
  };

  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <Popconfirm
            title="Apakah anda yakin ingin menghapus data ini?"
            onConfirm={() => handleDelete(row?.key)}
            okText="Hapus"
            cancelText="Batal"
          >
            <a>Hapus</a>
          </Popconfirm>
        );
      },
    },
  ];

  const { mutate: mutateDeleteAll, isLoading: isDeletingAll } =
    useDeleteAllRedisKeys();

  const handleDeleteAll = () => {
    mutateDeleteAll();
  };

  return (
    <div>
      <Flex justify="end" gap={8}>
        <Button type="primary" onClick={() => refetch()}>
          Refresh
        </Button>
        <Button
          type="primary"
          onClick={handleDeleteAll}
          loading={isDeletingAll}
        >
          Hapus Semua
        </Button>
      </Flex>
      <Table
        pagination={false}
        loading={isLoading}
        rowKey={(row) => row?.key}
        columns={columns}
        dataSource={data}
      />
    </div>
  );
}

export default RedisManagement;
