import Layout from "@/components/Layout";
import { Breadcrumb, Card, Empty } from "antd";
import Head from "next/head";
import Link from "next/link";

const { default: PageContainer } = require("@/components/PageContainer");

const LayananKepegawaian = () => {
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
        <Card>
          <Empty />
        </Card>
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
