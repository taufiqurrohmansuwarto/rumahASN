import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import EmailManagement from "@/components/KominfoServices/EmailManagement";
import Head from "next/head";

function EmailManagementPage() {
  return (
    <>
      <Head>
        <title>Kelola Email</title>
        <meta name="description" content="Kelola email" />
      </Head>
      <PageContainer
        title="Kelola Email Jatimprov"
        subTitle="Kelola pengajuan dan daftar email pegawai"
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
