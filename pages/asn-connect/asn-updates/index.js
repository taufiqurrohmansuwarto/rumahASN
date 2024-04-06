import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SocmedTabs from "@/components/Socmed/SocmedTabs";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton, Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const AsnUpdates = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect</title>
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
        title="ASN Connect"
        content="Berjejaring, Berkolaborasi, Berinovasi Bersama ASN Connect."
      >
        <FloatButton.BackTop />
        <SocmedTabs />
      </PageContainer>
    </>
  );
};

AsnUpdates.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdates.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnUpdates;
