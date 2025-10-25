import { EmailSubmission } from "@/components/KominfoServices";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const EmailSubmissionPage = () => {
  return (
    <>
      <Head>
        <title>Ajukan Email Jatimprov</title>
        <meta name="description" content="Ajukan email @jatimprov.go.id" />
      </Head>
      <PageContainer
        title="Ajukan Email Jatimprov"
        subTitle="Ajukan pembuatan email @jatimprov.go.id untuk keperluan resmi"
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
