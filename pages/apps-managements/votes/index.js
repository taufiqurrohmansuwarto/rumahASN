import Layout from "@/components/Layout";
import UserPolls from "@/components/Polls/UserPolls";
import { readAllPolling, removePooling } from "@/services/polls.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Space, Table, message } from "antd";
import { useRouter } from "next/router";

function Votes() {
  const router = useRouter();
  const handleCreate = () => router.push(`/apps-managements/votes/create`);

  const queryClient = useQueryClient();

  const { mutate, isLoading: loadingRemove } = useMutation(
    (data) => removePooling(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("votes-admins");
        message.success("Berhasil menghapus voting!");
      },
      onError: () => {
        message.error("Gagal menghapus voting!");
      },
    }
  );

  const handleRemove = (id) => {
    mutate(id);
  };

  const { data, isLoading } = useQuery(
    ["votes-admins"],
    () => readAllPolling(),
    {}
  );

  const columns = [
    { title: "Pertanyaan", dataIndex: "question" },
    { title: "Mulai Pada", dataIndex: "start_date" },
    { title: "Berakhir Pada", dataIndex: "end_date" },
    {
      title: "Aksi",
      dataIndex: "id",
      render: (id) => (
        <Space>
          <Button
            onClick={() => router.push(`/apps-managements/votes/${id}/update`)}
          >
            Update
          </Button>
          <Button onClick={() => handleRemove(id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button onClick={handleCreate}>Create</Button>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
      <UserPolls />
    </div>
  );
}

Votes.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Votes.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Votes;
