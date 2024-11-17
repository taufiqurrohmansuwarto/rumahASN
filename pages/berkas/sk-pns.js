import BerkasPNS from "@/components/Berkas/BerkasPNS";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const SkPNS = () => {
  return (
    <>
      <Head>
        <title>Berkas - PNS</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Forum Kepegawaian</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>ASN Connect</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        ggggbbb
        title="Berkas"
        content="Berkas Kepegawaian PNS"
      >
        <BerkasPNS />
      </PageContainer>
    </>
  );
};

SkPNS.Auth = {
  action: "manage",
  subject: "tickets",
};

SkPNS.getLayout = (page) => {
  return <Layout active="/berkas/sk-pns">{page}</Layout>;
};

export default SkPNS;
