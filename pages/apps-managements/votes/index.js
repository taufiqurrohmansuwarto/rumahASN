import Layout from "@/components/Layout";
import { readAllPolling } from "@/services/polls.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Table } from "antd";
import { useRouter } from "next/router";

function Votes() {
  const router = useRouter();
  const handleCreate = () => router.push(`/apps-managements/votes/create`);

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
        <Button
          onClick={() => router.push(`/apps-managements/votes/${id}/update`)}
        >
          Update
        </Button>
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
