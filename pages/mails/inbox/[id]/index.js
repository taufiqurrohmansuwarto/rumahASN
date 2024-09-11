import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import InboxMessageDetail from "@/components/PrivateMessages/InboxMessageDetail";
import Head from "next/head";

import { useRouter } from "next/router";

const InboxMailDetail = () => {
  const handleBack = () => router?.back();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer onBack={handleBack}>
        <InboxMessageDetail />
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
