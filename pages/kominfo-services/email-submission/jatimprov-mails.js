import EmailManagement from "@/components/KominfoServices/EmailManagement";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function JatimprovMailsPage() {
  return (
    <>
      <Head>
        <title>Daftar Email Jatimprov</title>
        <meta
          name="description"
          content="Kelola daftar email pegawai Jatimprov"
        />
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
