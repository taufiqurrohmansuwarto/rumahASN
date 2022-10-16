import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Divider, message, Popconfirm, Space, Table } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { deleteTicket, getAllTickets } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

const Tickets = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
  });

  const queryClient = useQueryClient();

  const { mutate: hapus } = useMutation((data) => deleteTicket(data), {
    onSettled: () => {
      queryClient.invalidateQueries("tickets");
    },
    onSuccess: () => {
      message.success("Berhasil menghapus tiket");
    },
    onError: () => {
      message.error("Gagal menghapus tiket");
    },
  });

  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["user-tickets", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  const handleRemove = (id) => {
    hapus(id);
  };

  const columns = [
    {
      title: "Judul",
      key: "title",
      dataIndex: "title",
    },
    { title: "Deskripsi", key: "description", dataIndex: "description" },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => {
        return (
          <Space>
            <a>Detail</a>
            <Divider type="vertical" />
            <a>Update</a>
            <Divider type="vertical" />
            <Popconfirm
              onConfirm={() => handleRemove(record?.id)}
              title="Apakah anda yakin ingin menghapus?"
            >
              <a>Hapus</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer title="Tiket" subTitle="Daftar Tiket">
      <Button onClick={createTicket}>Buat</Button>
      <Table
        pagination={{
          total: data?.total,
          defaultCurrent: 1,
          defaultPageSize: 50,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} tiket`,
          onChange: (page, limit) => {
            setQuery({
              page,
              limit,
            });
          },
        }}
        columns={columns}
        rowKey={(row) => row?.id}
        loading={isLoading}
        dataSource={data?.results}
      />
    </PageContainer>
  );
};

// add layout
Tickets.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Tickets.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Tickets;
