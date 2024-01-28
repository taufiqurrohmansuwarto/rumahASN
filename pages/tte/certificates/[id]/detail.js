import Checker from "@/components/Esign/Checker";
import DetailWebinarCertificates from "@/components/Esign/DetailWebinarCertificates";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function TTECertificatesDetail() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Certificates</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/tte/certificates">
                  <a>Sertifikat</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Daftar Sertifikat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Detail Sertifikat"
        content="Tanda Tangan Elektronik - Sertifikat"
      >
        <Card>
          <Checker>
            <DetailWebinarCertificates />
          </Checker>
        </Card>
      </PageContainer>
    </>
  );
}

TTECertificatesDetail.getLayout = function getLayout(page) {
  return <Layout active="/tte/certificates">{page}</Layout>;
};

TTECertificatesDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TTECertificatesDetail;
