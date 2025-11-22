import {
  deleteRedisKeyById,
  getAllRedisKeys,
  deleteAllRedisKeys,
  getRedisKeyById,
} from "@/services/redis.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, message, Popconfirm, Table, Modal } from "antd";
import { JsonInput } from "@mantine/core";
import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";

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
  const [selectedKey, setSelectedKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery(
    ["redis"],
    () => getAllRedisKeys(),
    {
      refetchInterval: 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const { data: detailData, isLoading: isLoadingDetail } = useQuery(
    ["redis-detail", selectedKey],
    () => getRedisKeyById(selectedKey),
    {
      enabled: !!selectedKey && isModalOpen,
      refetchOnWindowFocus: false,
    }
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

  const handleViewDetail = (key) => {
    setSelectedKey(key);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKey(null);
  };

  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: "70%",
      ellipsis: true,
    },
    {
      title: "Aksi",
      key: "aksi",
      width: "30%",
      render: (_, row) => {
        return (
          <Flex gap={4}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(row?.key)}
            />
            <Popconfirm
              title="Apakah anda yakin ingin menghapus data ini?"
              onConfirm={() => handleDelete(row?.key)}
              okText="Hapus"
              cancelText="Batal"
            >
              <Button size="small" danger>
                Hapus
              </Button>
            </Popconfirm>
          </Flex>
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
      <Flex justify="end" gap={8} style={{ marginBottom: 16 }}>
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
        size="small"
        tableLayout="fixed"
      />

      <Modal
        title={`Detail Redis Key: ${selectedKey || ""}`}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {isLoadingDetail ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Memuat data...
          </div>
        ) : (
          <JsonInput
            value={JSON.stringify(detailData, null, 2)}
            readOnly
            autosize
            minRows={10}
            maxRows={25}
            formatOnBlur
            styles={{
              input: {
                fontSize: "13px",
                fontFamily: "monospace",
              },
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default RedisManagement;
