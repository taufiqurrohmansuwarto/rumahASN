import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Tutorials from "@/components/PusatBantuan/Tutorials";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function PusatBantuan() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pusat Bantuan</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pusat bantuan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Pusat Bantuan Rumah ASN"
      >
        <Tutorials />
      </PageContainer>
    </>
  );
}

PusatBantuan.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

PusatBantuan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PusatBantuan;
