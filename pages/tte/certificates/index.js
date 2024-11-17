import Checker from "@/components/Esign/Checker";
import WebinarsCertificates from "@/components/Esign/WebinarsCertificates";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";

function TTECertificates() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Certificates</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Tanda Tangan Elektronik</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Tanda Tangan Elektronik"
        content="Tanda Tangan Elektronik - Sertifikat"
      >
        <Card>
          <Checker>
            <WebinarsCertificates />
          </Checker>
        </Card>
      </PageContainer>
    </>
  );
}

TTECertificates.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TTECertificates.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTECertificates;
