import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import EmailManagement from "@/components/KominfoServices/EmailManagement";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

function EmailManagementPage() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Kelola Pengajuan Email</title>
      </Head>
      <PageContainer
        title="Kelola Pengajuan Email Jatimprov"
        content="Kelola dan proses pengajuan email @jatimprov.go.id dari pegawai"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Kelola Pengajuan Email</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <EmailManagement />
      </PageContainer>
    </>
  );
}

EmailManagementPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/email-submission">
      {page}
    </KominfoServicesLayout>
  );
};

EmailManagementPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EmailManagementPage;
