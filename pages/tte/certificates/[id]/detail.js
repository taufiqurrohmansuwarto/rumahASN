import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function TTECertificatesDetail() {
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
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Tanda Tangan Elektronik</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Tanda Tangan Elektronik"
        content="Tanda Tangan Elektronik - Sertifikat"
      ></PageContainer>
    </>
  );
}

TTECertificatesDetail.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TTECertificatesDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTECertificatesDetail;
