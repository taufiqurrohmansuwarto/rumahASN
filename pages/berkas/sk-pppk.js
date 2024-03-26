import BerkasPNS from "@/components/Berkas/BerkasPNS";
import BerkasPPPK from "@/components/Berkas/BerkasPPPK";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const SkPPPK = () => {
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
                <Link href="/feeds">
                  <a>Forum Kepegawaian</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>ASN Connect</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Berkas"
        content="Berkas Kepegawaian PPPK"
      >
        <BerkasPPPK />
      </PageContainer>
    </>
  );
};

SkPPPK.Auth = {
  action: "manage",
  subject: "tickets",
};

SkPPPK.getLayout = (page) => {
  return <Layout active="/berkas/sk-pppk">{page}</Layout>;
};

export default SkPPPK;
