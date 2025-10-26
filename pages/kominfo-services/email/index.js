import { EmailSubmission } from "@/components/KominfoServices";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

const EmailSubmissionPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Ajukan Email Jatimprov</title>
      </Head>
      <PageContainer
        title="Pengajuan Email Jatimprov"
        content="Ajukan pembuatan akun email @jatimprov.go.id untuk keperluan resmi kedinasan"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/kominfo-services/dashboard">Layanan Kominfo</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pengajuan Email</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <EmailSubmission />
      </PageContainer>
    </>
  );
};

EmailSubmissionPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/email">
      {page}
    </KominfoServicesLayout>
  );
};

EmailSubmissionPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default EmailSubmissionPage;
