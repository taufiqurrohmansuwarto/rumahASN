import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { readAllPolling, removePooling } from "@/services/polls.services";
import { formatDateLL } from "@/utils/client-utils";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Divider,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
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
        router.push("/apps-managements/votes");
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
    {
      title: "Mulai Pada",
      key: "start_date",
      render: (row) => formatDateLL(row.start_date),
    },
    {
      title: "Berakhir Pada",
      key: "end_date",
      render: (row) => formatDateLL(row.end_date),
    },
    {
      title: "Aksi",
      dataIndex: "id",
      render: (id) => (
        <Space>
          <a
            onClick={() => router.push(`/apps-managements/votes/${id}/detail`)}
          >
            Detail
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => router.push(`/apps-managements/votes/${id}/update`)}
          >
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin menghapus voting ini?"
            onConfirm={() => handleRemove(id)}
          >
            <a>Hapus</a>
          </Popconfirm>
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
