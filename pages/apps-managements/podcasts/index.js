import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getPodcast } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button, Table } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function Podcast() {
  const router = useRouter();

  const gotoCreate = () => {
    router.push("/apps-managements/podcasts/create");
  };

  const handleBack = () => router.back();

  const { data, isLoading } = useQuery(["podcasts"], () => getPodcast(), {});

  const columns = [
    {
      title: "Judul Podcast",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Detail",
      key: "id",
      render: (text, record) => (
        <Button
          onClick={() =>
            router.push(`/apps-managements/podcasts/${record?.id}`)
          }
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Podcast</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Podcast"
        subTitle="Daftar Podcast"
      >
        <div>
          <Button onClick={gotoCreate}>Buat Rekaman Podcast</Button>
          <Table
            columns={columns}
            rowKey={(row) => row?.id}
            dataSource={data?.results}
            loading={isLoading}
          />
        </div>
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
