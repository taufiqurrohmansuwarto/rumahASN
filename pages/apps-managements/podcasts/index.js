import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getPodcast } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Divider, Popconfirm, Row, Table } from "antd";
import Head from "next/head";
import Link from "next/link";
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
      title: "Publikasi",
      key: "is_published",
      render: (_, record) => (
        <div>
          {record?.is_published ? "Sudah dipublikasi" : "Belum dipublikasi"}
        </div>
      ),
    },
    {
      title: "Detail",
      key: "id",
      render: (text, record) => (
        <div>
          <Link href={`/apps-managements/podcasts/${record?.id}`}>
            <a>Detail</a>
          </Link>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus podcast ini?"
            onConfirm={() => console.log("Hapus")}
          >
            <a>Hapus</a>
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
