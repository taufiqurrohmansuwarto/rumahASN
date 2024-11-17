import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { deletePodcast, getPodcast } from "@/services/index";
import { CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Popconfirm,
  Row,
  Table,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function Podcast() {
  const queryClient = useQueryClient();

  const { mutate: remove } = useMutation((data) => deletePodcast(data), {
    onMutate: () => {
      message.loading({
        content: "Menghapus podcast...",
        key: "remove",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["podcasts"]);
      message.success({
        content: "Berhasil menghapus podcast",
        key: "remove",
        duration: 2,
      });
    },
    onError: () => {
      message.error({
        content: "Gagal menghapus podcast",
        key: "remove",
        duration: 2,
      });
    },
  });

  const router = useRouter();

  const gotoCreate = () => {
    router.push("/apps-managements/podcasts/create");
  };

  const handleBack = () => router.back();

  const { data, isLoading } = useQuery(["podcasts"], () => getPodcast(), {});

  const columns = [
    {
      title: "Episode",
      dataIndex: "episode",
      key: "episode",
    },
    {
      title: "Judul Podcast",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Publikasi",
      key: "is_published",
      render: (_, record) => (
        <div>
          {record?.is_published ? (
            <CheckCircleOutlined style={{ color: "green" }} />
          ) : (
            <CloseOutlined style={{ color: "red" }} />
          )}
        </div>
      ),
    },
    {
      title: "Tgl. Dibuat",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Detail",
      key: "id",
      render: (_, record) => (
        <div>
          <Link href={`/apps-managements/podcasts/${record?.id}`}>Detail</Link>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus podcast ini?"
            onConfirm={() => remove(record?.id)}
          >
            Hapus
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Podcast</title>
      </Head>
      <PageContainer
        ghost
        onBack={handleBack}
        title="Podcast"
        subTitle="Daftar Podcast Rumah ASN"
      >
        <Row>
          <Col md={20} xs={24}>
            <Card>
              <Table
                title={() => (
                  <Button onClick={gotoCreate} type="primary">
                    Buat Podcast
                  </Button>
                )}
                columns={columns}
                rowKey={(row) => row?.id}
                dataSource={data?.results}
                loading={isLoading}
              />
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

Podcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Podcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Podcast;
