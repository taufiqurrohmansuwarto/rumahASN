import CardLayananKepegawaian from "@/components/FiturLayananKepegawaian/CardLayananKepegawaian";
import Layout from "@/components/Layout";
import { Breadcrumb, List } from "antd";
import { times } from "lodash";
import Head from "next/head";
import Link from "next/link";

const { default: PageContainer } = require("@/components/PageContainer");

const LayananKepegawaian = () => {
  const title = "Layanan Kepegawaian";
  const description =
    "Get Started with AI-Drive App Development Using the OpenAI Node.js SDK";
  const image =
    "https://egghead.io/_next/image?url=https%3A%2F%2Fd2eip9sf3oo6c2.cloudfront.net%2Fplaylists%2Fsquare_covers%2F001%2F141%2F294%2Fthumb%2Fegh_appwrite-react_2000.png&w=96&q=100";
  const bidang =
    "Perencanaan, Pengadaan, Pengolahan Data dan Sistem Informasi ASN";

  const data = times(10, (i) => ({
    id: i,
    title,
    description,
    image,
    bidang,
  }));

  return (
    <>
      <Head>
        <title>Rumah ASN - Layanan Kepegawaian</title>
      </Head>
      <PageContainer
        title="Layanan Kepegawaian"
        content="BKD Provinsi Jawa Timur"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Layanan Kepegawaian</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xxl: 4,
          }}
          dataSource={data}
          renderItem={({ id, title, description, image, bidang }) => (
            <List.Item>
              <CardLayananKepegawaian
                title={title}
                description={description}
                image={image}
                bidang={bidang}
              />
            </List.Item>
          )}
        />
      </PageContainer>
    </>
  );
};

LayananKepegawaian.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

LayananKepegawaian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LayananKepegawaian;
