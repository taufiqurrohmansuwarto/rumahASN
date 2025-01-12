import { deleteRedisKeyById, getAllRedisKeys } from "@/services/redis.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Popconfirm, Table } from "antd";

function RedisManagement() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["redis"], () => getAllRedisKeys(), {});

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

  return (
    <div>
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
