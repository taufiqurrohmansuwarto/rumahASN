import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { readAllPolling, removePooling } from "@/services/polls.services";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, Space, Table, message } from "antd";
import Head from "next/head";
import Link from "next/link";
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
          <Button
            onClick={() => router.push(`/apps-managements/votes/${id}/detail`)}
          >
            Detail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Polilng</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Polling</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Rumah ASN - Polling"
      >
        <Card>
          <Button
            style={{
              marginBottom: 16,
            }}
            onClick={handleCreate}
            type="primary"
            icon={<PlusOutlined />}
          >
            Polling Baru
          </Button>
          <Table
            pagination={false}
            columns={columns}
            dataSource={data}
            loading={isLoading}
            rowKey={(row) => row?.id}
          />
        </Card>
      </PageContainer>
    </>
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
