import EmailManagement from "@/components/KominfoServices/EmailManagement";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

function JatimprovMailsPage() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Daftar Email Jatimprov</title>
      </Head>
      <PageContainer
        title="Daftar Email Pegawai Jatimprov"
        content="Lihat dan kelola daftar email @jatimprov.go.id yang telah dibuat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Daftar Email Pegawai</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <EmailManagement />
      </PageContainer>
    </>
  );
}

JatimprovMailsPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/email-submission">
      {page}
    </KominfoServicesLayout>
  );
};

JatimprovMailsPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default JatimprovMailsPage;
