import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import EmailDetailComponent from "@/components/mail/EmailDetailComponent";
import Head from "next/head";

import { useRouter } from "next/router";

const InboxMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();
  const { id } = router?.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer title="Pesan Pribadi">
        <EmailDetailComponent emailId={id} onBack={handleBack} />
      </PageContainer>
    </>
  );
};

InboxMailDetail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/inbox">{page}</GmailLayout>;
};

InboxMailDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default InboxMailDetail;
